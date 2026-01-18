import requests
import json
import logging
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.superhero import Superhero
from ..config import settings
from ..utils import setup_logger
import time

class SuperheroSeeder:
    def __init__(self):
        self.base_url = settings.SUPERHERO_API_BASE_URL
        self.token = settings.SUPERHERO_API_TOKEN
        self.batch_size = 10  # Process 10 heroes at a time
        self.delay = 1  # Delay between requests to avoid rate limiting
        self.logger = setup_logger("superhero_seeder", level=logging.INFO)

    def fetch_superhero(self, hero_id: int) -> dict:
        """Fetch a single superhero from the API"""
        try:
            url = f"{self.base_url}/{self.token}/{hero_id}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            self.logger.error(f"Error fetching hero {hero_id}: {e}")
            return None

    def fetch_batch(self, hero_ids: list) -> list:
        """Fetch a batch of superheroes"""
        valid_results = []

        for hero_id in hero_ids:
            result = self.fetch_superhero(hero_id)
            if result and result.get("response") == "success":
                valid_results.append(result)
            else:
                self.logger.warning(f"Invalid response for hero {hero_id}")

            # Small delay between individual requests
            time.sleep(0.1)

        return valid_results

    def create_superhero_from_data(self, data: dict) -> Superhero:
        """Create a Superhero instance from API data"""
        # Extract powerstats
        powerstats = data.get("powerstats", {})
        intelligence = self._parse_int(powerstats.get("intelligence", "0"))
        strength = self._parse_int(powerstats.get("strength", "0"))
        speed = self._parse_int(powerstats.get("speed", "0"))
        durability = self._parse_int(powerstats.get("durability", "0"))
        power = self._parse_int(powerstats.get("power", "0"))
        combat = self._parse_int(powerstats.get("combat", "0"))

        # Extract biography
        biography = data.get("biography", {})
        aliases = json.dumps(biography.get("aliases", []))

        # Extract appearance
        appearance = data.get("appearance", {})
        height = appearance.get("height", ["", ""])
        weight = appearance.get("weight", ["", ""])

        # Extract work
        work = data.get("work", {})

        # Extract connections
        connections = data.get("connections", {})

        # Extract image
        image = data.get("image", {})

        return Superhero(
            id=int(data.get("id", 0)),
            name=data.get("name", ""),
            response_status=data.get("response", "success"),

            # Powerstats
            intelligence=intelligence,
            strength=strength,
            speed=speed,
            durability=durability,
            power=power,
            combat=combat,

            # Biography
            full_name=biography.get("full-name", ""),
            alter_egos=biography.get("alter-egos", ""),
            place_of_birth=biography.get("place-of-birth", ""),
            first_appearance=biography.get("first-appearance", ""),
            publisher=biography.get("publisher", ""),
            alignment=biography.get("alignment", ""),
            aliases=aliases,

            # Appearance
            gender=appearance.get("gender", ""),
            race=appearance.get("race", ""),
            height_feet=height[0] if len(height) > 0 else "",
            height_cm=height[1] if len(height) > 1 else "",
            weight_lbs=weight[0] if len(weight) > 0 else "",
            weight_kg=weight[1] if len(weight) > 1 else "",
            eye_color=appearance.get("eye-color", ""),
            hair_color=appearance.get("hair-color", ""),

            # Work
            occupation=work.get("occupation", ""),
            base=work.get("base", ""),

            # Connections
            group_affiliation=connections.get("group-affiliation", ""),
            relatives=connections.get("relatives", ""),

            # Image
            image_url=image.get("url", "")
        )

    def _parse_int(self, value: str) -> int:
        """Parse string to int, return 0 if invalid"""
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0

    def seed_database(self, start_id: int = 1, end_id: int = 732):
        """Main seeding function"""
        if not self.token:
            raise ValueError("SUPERHERO_API_TOKEN not set in environment variables")

        db = SessionLocal()
        try:
            # Get existing hero IDs to avoid duplicates
            existing_ids = {hero.id for hero in db.query(Superhero.id).all()}
            self.logger.info(f"Found {len(existing_ids)} existing heroes in database")

            # Create list of IDs to fetch
            hero_ids = [i for i in range(start_id, end_id + 1) if i not in existing_ids]

            if not hero_ids:
                self.logger.info("All heroes already seeded!")
                return

            self.logger.info(f"Seeding {len(hero_ids)} heroes...")

            # Track progress
            total_added = 0

            # Process in batches
            for i in range(0, len(hero_ids), self.batch_size):
                batch_ids = hero_ids[i:i + self.batch_size]
                batch_num = i//self.batch_size + 1
                total_batches = (len(hero_ids) + self.batch_size - 1) // self.batch_size
                self.logger.info(f"Processing batch {batch_num}/{total_batches}: heroes {batch_ids[0]}-{batch_ids[-1]}")

                # Fetch batch
                batch_data = self.fetch_batch(batch_ids)

                # Create superhero objects
                superheroes = []
                for idx, data in enumerate(batch_data):
                    try:
                        hero = self.create_superhero_from_data(data)
                        superheroes.append(hero)
                        total_added += 1
                        # Show progress for each hero
                        self.logger.info(f"{total_added} complete - {hero.name}")
                    except Exception as e:
                        self.logger.error(f"Error creating hero from data: {e}")

                # Bulk insert
                if superheroes:
                    try:
                        db.add_all(superheroes)
                        db.commit()
                        self.logger.info(f"✅ Batch {batch_num}: Successfully added {len(superheroes)} heroes to database")
                        self.logger.info(f"   Total heroes in database now: {total_added}/{len(hero_ids)}")
                    except Exception as e:
                        db.rollback()
                        self.logger.error(f"❌ Batch {batch_num}: Failed to add heroes to database: {e}")
                        raise
                else:
                    self.logger.warning(f"⚠️  Batch {batch_num}: No valid heroes to add from this batch")

                # Rate limiting delay
                if i + self.batch_size < len(hero_ids):
                    time.sleep(self.delay)

            self.logger.info("Seeding completed successfully!")

        except Exception as e:
            db.rollback()
            self.logger.error(f"Error during seeding: {e}")
            raise
        finally:
            db.close()

def run_seeder():
    """Convenience function to run the seeder"""
    seeder = SuperheroSeeder()
    seeder.seed_database()

if __name__ == "__main__":
    run_seeder()