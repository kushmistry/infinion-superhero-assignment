from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Superhero schemas
class SuperheroBase(BaseModel):
    name: str
    intelligence: Optional[int] = None
    strength: Optional[int] = None
    speed: Optional[int] = None
    durability: Optional[int] = None
    power: Optional[int] = None
    combat: Optional[int] = None

class SuperheroCreate(SuperheroBase):
    pass

class SuperheroUpdate(BaseModel):
    name: Optional[str] = None
    intelligence: Optional[int] = None
    strength: Optional[int] = None
    speed: Optional[int] = None
    durability: Optional[int] = None
    power: Optional[int] = None
    combat: Optional[int] = None
    full_name: Optional[str] = None
    alter_egos: Optional[str] = None
    place_of_birth: Optional[str] = None
    first_appearance: Optional[str] = None
    publisher: Optional[str] = None
    alignment: Optional[str] = None
    aliases: Optional[str] = None
    gender: Optional[str] = None
    race: Optional[str] = None
    height_feet: Optional[str] = None
    height_cm: Optional[str] = None
    weight_lbs: Optional[str] = None
    weight_kg: Optional[str] = None
    eye_color: Optional[str] = None
    hair_color: Optional[str] = None
    occupation: Optional[str] = None
    base: Optional[str] = None
    group_affiliation: Optional[str] = None
    relatives: Optional[str] = None
    image_url: Optional[str] = None

class SuperheroResponse(SuperheroBase):
    id: int
    response_status: Optional[str] = None
    full_name: Optional[str] = None
    alter_egos: Optional[str] = None
    place_of_birth: Optional[str] = None
    first_appearance: Optional[str] = None
    publisher: Optional[str] = None
    alignment: Optional[str] = None
    aliases: Optional[str] = None
    gender: Optional[str] = None
    race: Optional[str] = None
    height_feet: Optional[str] = None
    height_cm: Optional[str] = None
    weight_lbs: Optional[str] = None
    weight_kg: Optional[str] = None
    eye_color: Optional[str] = None
    hair_color: Optional[str] = None
    occupation: Optional[str] = None
    base: Optional[str] = None
    group_affiliation: Optional[str] = None
    relatives: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# List and pagination schemas
class SuperheroListResponse(BaseModel):
    items: List[SuperheroResponse]
    total: int
    page: int
    page_size: int
    pages: int

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20