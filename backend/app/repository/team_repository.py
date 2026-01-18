from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.team import Team, TeamMember
from ..models.superhero import Superhero

class TeamRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_team(self, name: str, description: Optional[str], user_id: int, superhero_ids: List[int]) -> Team:
        """Create a new team with members"""
        team = Team(name=name, description=description, user_id=user_id)
        self.db.add(team)
        self.db.flush()  # Get team ID without committing

        # Add team members
        for position, superhero_id in enumerate(superhero_ids):
            member = TeamMember(team_id=team.id, superhero_id=superhero_id, position=position)
            self.db.add(member)

        self.db.commit()
        self.db.refresh(team)
        return team

    def get_user_teams(self, user_id: int) -> List[Team]:
        """Get all teams for a user"""
        return self.db.query(Team).filter(Team.user_id == user_id).all()

    def get_team_by_id(self, team_id: int, user_id: Optional[int] = None) -> Optional[Team]:
        """Get team by ID, optionally filtered by user"""
        query = self.db.query(Team).filter(Team.id == team_id)
        if user_id:
            query = query.filter(Team.user_id == user_id)
        return query.first()

    def update_team(self, team: Team, name: Optional[str] = None, description: Optional[str] = None, superhero_ids: Optional[List[int]] = None) -> Team:
        """Update team information and/or members"""
        if name:
            team.name = name
        if description is not None:
            team.description = description

        if superhero_ids is not None:
            # Remove existing members
            self.db.query(TeamMember).filter(TeamMember.team_id == team.id).delete()
            # Add new members
            for position, superhero_id in enumerate(superhero_ids):
                member = TeamMember(team_id=team.id, superhero_id=superhero_id, position=position)
                self.db.add(member)

        self.db.commit()
        self.db.refresh(team)
        return team

    def delete_team(self, team_id: int) -> bool:
        """Delete a team"""
        team = self.db.query(Team).filter(Team.id == team_id).first()
        if team:
            self.db.delete(team)
            self.db.commit()
            return True
        return False

    def get_team_superheroes(self, team_id: int) -> List[Superhero]:
        """Get all superheroes in a team"""
        members = self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id
        ).order_by(TeamMember.position).all()
        
        superhero_ids = [m.superhero_id for m in members]
        return self.db.query(Superhero).filter(Superhero.id.in_(superhero_ids)).all()
