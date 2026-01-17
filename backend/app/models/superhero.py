from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Superhero(Base):
    __tablename__ = "superheroes"

    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    response_status = Column(String(50), default="success")

    # Powerstats
    intelligence = Column(Integer, default=0)
    strength = Column(Integer, default=0)
    speed = Column(Integer, default=0)
    durability = Column(Integer, default=0)
    power = Column(Integer, default=0)
    combat = Column(Integer, default=0)

    # Biography
    full_name = Column(String(255))
    alter_egos = Column(Text)
    place_of_birth = Column(String(255))
    first_appearance = Column(String(255))
    publisher = Column(String(255))
    alignment = Column(String(50))  # good, bad, neutral

    # Appearance
    gender = Column(String(50))
    race = Column(String(100))
    height_feet = Column(String(50))  # e.g., "6'6"
    height_cm = Column(String(50))    # e.g., "198 cm"
    weight_lbs = Column(String(50))   # e.g., "425 lb"
    weight_kg = Column(String(50))    # e.g., "191 kg"
    eye_color = Column(String(50))
    hair_color = Column(String(50))

    # Work
    occupation = Column(Text)
    base = Column(String(255))

    # Connections
    group_affiliation = Column(Text)
    relatives = Column(Text)

    # Image
    image_url = Column(String(500))

    # Aliases (stored as JSON string for simplicity)
    aliases = Column(Text)  # JSON array as string

    def __repr__(self):
        return f"<Superhero(id={self.id}, name='{self.name}')>"