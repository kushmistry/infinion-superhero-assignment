from sqlalchemy.orm import Session
from typing import List, Optional
from ..repository.team_repository import TeamRepository
from ..repository.superhero_repository import SuperheroRepository
from ..utils import get_logger, create_success_response, create_error_response, create_superhero_data
import random

logger = get_logger("team_controller")

class TeamController:
    def __init__(self, db: Session):
        self.db = db
        self.team_repo = TeamRepository(db)
        self.superhero_repo = SuperheroRepository(db)

    def create_team(self, user_id: int, name: str, description: Optional[str], superhero_ids: List[int]):
        """Create a new team"""
        try:
            if not name:
                return create_error_response("Team name is required")

            if not superhero_ids:
                return create_error_response("Team must have at least one member")

            # Validate all superheroes exist
            for hero_id in superhero_ids:
                if not self.superhero_repo.get_by_id(hero_id):
                    return create_error_response(f"Superhero with ID {hero_id} not found")

            team = self.team_repo.create_team(name, description, user_id, superhero_ids)
            return create_success_response(
                "Team created successfully",
                self._team_to_dict(team)
            )
        except Exception as e:
            logger.error(f"Error creating team: {e}")
            return create_error_response("Failed to create team")

    def get_user_teams(self, user_id: int):
        """Get all teams for a user"""
        try:
            teams = self.team_repo.get_user_teams(user_id)
            return create_success_response(
                "Teams retrieved successfully",
                [self._team_to_dict(team) for team in teams]
            )
        except Exception as e:
            logger.error(f"Error getting teams: {e}")
            return create_error_response("Failed to retrieve teams")

    def get_team_by_id(self, team_id: int, user_id: int):
        """Get team by ID"""
        try:
            team = self.team_repo.get_team_by_id(team_id, user_id)
            if not team:
                return create_error_response("Team not found")

            return create_success_response(
                "Team retrieved successfully",
                self._team_to_dict(team)
            )
        except Exception as e:
            logger.error(f"Error getting team: {e}")
            return create_error_response("Failed to retrieve team")

    def update_team(self, team_id: int, user_id: int, name: Optional[str], description: Optional[str], superhero_ids: Optional[List[int]]):
        """Update a team"""
        try:
            team = self.team_repo.get_team_by_id(team_id, user_id)
            if not team:
                return create_error_response("Team not found")

            if superhero_ids is not None:
                # Validate all superheroes exist
                for hero_id in superhero_ids:
                    if not self.superhero_repo.get_by_id(hero_id):
                        return create_error_response(f"Superhero with ID {hero_id} not found")

            updated_team = self.team_repo.update_team(team, name, description, superhero_ids)
            return create_success_response(
                "Team updated successfully",
                self._team_to_dict(updated_team)
            )
        except Exception as e:
            logger.error(f"Error updating team: {e}")
            return create_error_response("Failed to update team")

    def delete_team(self, team_id: int, user_id: int):
        """Delete a team"""
        try:
            team = self.team_repo.get_team_by_id(team_id, user_id)
            if not team:
                return create_error_response("Team not found")

            if self.team_repo.delete_team(team_id):
                return create_success_response("Team deleted successfully")
            return create_error_response("Failed to delete team")
        except Exception as e:
            logger.error(f"Error deleting team: {e}")
            return create_error_response("Failed to delete team")

    def recommend_balanced_team(self, count: int = 5):
        """Recommend a balanced team with better alignment distribution"""
        try:
            good_heroes = self.superhero_repo.get_by_alignment("good")
            bad_heroes = self.superhero_repo.get_by_alignment("bad")
            neutral_heroes = self.superhero_repo.get_by_alignment("neutral")

            # Better distribution: ensures more balanced ratio
            # For 5: 2 good, 2 bad, 1 neutral (better than 1-1-3)
            # For 6: 2 good, 2 bad, 2 neutral
            # For 4: 1 good, 1 bad, 2 neutral
            good_count = max(1, (count + 1) // 3)  # ~33%
            bad_count = max(1, (count + 1) // 3)   # ~33%
            neutral_count = count - good_count - bad_count  # Remaining ~33%

            selected = []
            if good_heroes:
                selected.extend(random.sample(good_heroes, min(good_count, len(good_heroes))))
            if bad_heroes:
                selected.extend(random.sample(bad_heroes, min(bad_count, len(bad_heroes))))
            if neutral_heroes:
                selected.extend(random.sample(neutral_heroes, min(neutral_count, len(neutral_heroes))))

            # Fill remaining slots with random if needed
            if len(selected) < count:
                all_heroes = good_heroes + bad_heroes + neutral_heroes
                remaining = [h for h in all_heroes if h.id not in [s.id for s in selected]]
                if remaining:
                    needed = count - len(selected)
                    selected.extend(random.sample(remaining, min(needed, len(remaining))))

            return create_success_response(
                "Balanced team recommended",
                [create_superhero_data(hero) for hero in selected[:count]]
            )
        except Exception as e:
            logger.error(f"Error recommending balanced team: {e}")
            return create_error_response("Failed to recommend team")

    def recommend_power_team(self, power_stat: Optional[str] = None, min_value: int = 50, count: int = 5):
        """Recommend team with high selected stat AND good overall power"""
        try:
            # If power_stat not provided, randomly select one
            if power_stat is None:
                power_stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat']
                power_stat = random.choice(power_stats)
            
            # Get heroes with high target stat
            candidates = self.superhero_repo.get_by_power_stat(power_stat, min_value)
            
            if not candidates:
                return create_error_response(f"No heroes found with {power_stat} >= {min_value}")
            
            # Calculate total power for each hero (sum of all stats)
            def total_power(hero):
                stats = [
                    hero.intelligence or 0,
                    hero.strength or 0,
                    hero.speed or 0,
                    hero.durability or 0,
                    hero.power or 0,
                    hero.combat or 0
                ]
                return sum(stats)
            
            # Sort by total power and select top performers
            candidates_sorted = sorted(candidates, key=total_power, reverse=True)
            
            # Take top 10 candidates, then randomly select from them for diversity
            top_candidates = candidates_sorted[:min(10, len(candidates_sorted))]
            selected = random.sample(top_candidates, min(count, len(top_candidates))) if top_candidates else []
            
            return create_success_response(
                f"Team recommended based on {power_stat}",
                [create_superhero_data(hero) for hero in selected]
            )
        except Exception as e:
            logger.error(f"Error recommending power team: {e}")
            return create_error_response("Failed to recommend team")

    def recommend_random_team(self, count: int = 5):
        """Recommend a random team"""
        try:
            heroes = self.superhero_repo.get_random(count)
            return create_success_response(
                "Random team recommended",
                [create_superhero_data(hero) for hero in heroes]
            )
        except Exception as e:
            logger.error(f"Error recommending random team: {e}")
            return create_error_response("Failed to recommend team")

    def compare_teams(self, team1_id: int, team2_id: int, user_id: int):
        """Compare two teams and predict a winner"""
        try:
            # Get both teams
            team1 = self.team_repo.get_team_by_id(team1_id, user_id)
            team2 = self.team_repo.get_team_by_id(team2_id, user_id)

            if not team1:
                return create_error_response(f"Team {team1_id} not found")
            if not team2:
                return create_error_response(f"Team {team2_id} not found")

            # Get superheroes for both teams
            heroes1 = self.team_repo.get_team_superheroes(team1_id)
            heroes2 = self.team_repo.get_team_superheroes(team2_id)

            if not heroes1 or not heroes2:
                return create_error_response("Both teams must have at least one member")

            # Calculate team statistics
            def calculate_team_stats(heroes):
                """Calculate total power, averages, and alignment distribution"""
                total_power = 0
                total_intelligence = 0
                total_strength = 0
                total_speed = 0
                total_durability = 0
                total_power_stat = 0
                total_combat = 0
                
                alignment_counts = {"good": 0, "bad": 0, "neutral": 0}
                
                for hero in heroes:
                    stats = [
                        hero.intelligence or 0,
                        hero.strength or 0,
                        hero.speed or 0,
                        hero.durability or 0,
                        hero.power or 0,
                        hero.combat or 0
                    ]
                    total_power += sum(stats)
                    total_intelligence += stats[0]
                    total_strength += stats[1]
                    total_speed += stats[2]
                    total_durability += stats[3]
                    total_power_stat += stats[4]
                    total_combat += stats[5]
                    
                    if hero.alignment:
                        alignment_counts[hero.alignment] = alignment_counts.get(hero.alignment, 0) + 1

                count = len(heroes)
                return {
                    "total_power": total_power,
                    "average_power": total_power / (count * 6) if count > 0 else 0,
                    "total_intelligence": total_intelligence,
                    "total_strength": total_strength,
                    "total_speed": total_speed,
                    "total_durability": total_durability,
                    "total_power_stat": total_power_stat,
                    "total_combat": total_combat,
                    "average_intelligence": total_intelligence / count if count > 0 else 0,
                    "average_strength": total_strength / count if count > 0 else 0,
                    "average_speed": total_speed / count if count > 0 else 0,
                    "average_durability": total_durability / count if count > 0 else 0,
                    "average_power_stat": total_power_stat / count if count > 0 else 0,
                    "average_combat": total_combat / count if count > 0 else 0,
                    "alignment_distribution": alignment_counts,
                    "member_count": count
                }

            stats1 = calculate_team_stats(heroes1)
            stats2 = calculate_team_stats(heroes2)

            # Determine winner based on multiple factors
            team1_score = 0
            team2_score = 0
            reasons = []

            # Factor 1: Total Power (40% weight)
            if stats1["total_power"] > stats2["total_power"]:
                team1_score += 40
                reasons.append(f"{team1.name} has higher total power ({stats1['total_power']} vs {stats2['total_power']})")
            elif stats2["total_power"] > stats1["total_power"]:
                team2_score += 40
                reasons.append(f"{team2.name} has higher total power ({stats2['total_power']} vs {stats1['total_power']})")

            # Factor 2: Average Power per Hero (20% weight)
            if stats1["average_power"] > stats2["average_power"]:
                team1_score += 20
                reasons.append(f"{team1.name} has higher average power per hero ({stats1['average_power']:.1f} vs {stats2['average_power']:.1f})")
            elif stats2["average_power"] > stats1["average_power"]:
                team2_score += 20
                reasons.append(f"{team2.name} has higher average power per hero ({stats2['average_power']:.1f} vs {stats1['average_power']:.1f})")

            # Factor 3: Strength advantage (15% weight)
            if stats1["total_strength"] > stats2["total_strength"]:
                team1_score += 15
                reasons.append(f"{team1.name} has superior strength ({stats1['total_strength']} vs {stats2['total_strength']})")
            elif stats2["total_strength"] > stats1["total_strength"]:
                team2_score += 15
                reasons.append(f"{team2.name} has superior strength ({stats2['total_strength']} vs {stats1['total_strength']})")

            # Factor 4: Combat ability (15% weight)
            if stats1["total_combat"] > stats2["total_combat"]:
                team1_score += 15
                reasons.append(f"{team1.name} has better combat skills ({stats1['total_combat']} vs {stats2['total_combat']})")
            elif stats2["total_combat"] > stats1["total_combat"]:
                team2_score += 15
                reasons.append(f"{team2.name} has better combat skills ({stats2['total_combat']} vs {stats1['total_combat']})")

            # Factor 5: Intelligence advantage (10% weight)
            if stats1["total_intelligence"] > stats2["total_intelligence"]:
                team1_score += 10
                reasons.append(f"{team1.name} has higher intelligence ({stats1['total_intelligence']} vs {stats2['total_intelligence']})")
            elif stats2["total_intelligence"] > stats1["total_intelligence"]:
                team2_score += 10
                reasons.append(f"{team2.name} has higher intelligence ({stats2['total_intelligence']} vs {stats1['total_intelligence']})")

            # Determine winner
            if team1_score > team2_score:
                winner_id = team1_id
                winner_name = team1.name
                explanation = f"{team1.name} wins with a score of {team1_score}/100 vs {team2.name}'s {team2_score}/100."
            elif team2_score > team1_score:
                winner_id = team2_id
                winner_name = team2.name
                explanation = f"{team2.name} wins with a score of {team2_score}/100 vs {team1.name}'s {team1_score}/100."
            else:
                winner_id = None
                winner_name = "Tie"
                explanation = f"Both teams are evenly matched with a score of {team1_score}/100."

            comparison_data = {
                "team1": {
                    "id": team1.id,
                    "name": team1.name,
                    "stats": stats1,
                    "score": team1_score
                },
                "team2": {
                    "id": team2.id,
                    "name": team2.name,
                    "stats": stats2,
                    "score": team2_score
                },
                "winner": {
                    "team_id": winner_id,
                    "team_name": winner_name,
                    "score": max(team1_score, team2_score) if winner_id else team1_score
                },
                "explanation": explanation,
                "reasons": reasons
            }

            return create_success_response(
                f"Team comparison completed: {explanation}",
                comparison_data
            )

        except Exception as e:
            logger.error(f"Error comparing teams: {e}")
            return create_error_response("Failed to compare teams")

    def _team_to_dict(self, team) -> dict:
        """Convert team model to dictionary with superheroes"""
        superheroes = self.team_repo.get_team_superheroes(team.id)
        return {
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "user_id": team.user_id,
            "created_at": team.created_at.isoformat() if team.created_at else None,
            "updated_at": team.updated_at.isoformat() if team.updated_at else None,
            "superheroes": [create_superhero_data(hero) for hero in superheroes]
        }
