from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List, Tuple
from ..models.superhero import Superhero

class SuperheroRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self, 
        page: int = 1, 
        page_size: int = 20,
        search: Optional[str] = None,
        alignment: Optional[str] = None
    ) -> Tuple[List[Superhero], int]:
        """Get all superheroes with pagination and filters"""
        query = self.db.query(Superhero)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Superhero.name.ilike(search_term),
                    Superhero.full_name.ilike(search_term),
                    Superhero.publisher.ilike(search_term)
                )
            )

        if alignment:
            query = query.filter(Superhero.alignment == alignment)

        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return items, total

    def get_by_id(self, superhero_id: int) -> Optional[Superhero]:
        """Get superhero by ID"""
        return self.db.query(Superhero).filter(Superhero.id == superhero_id).first()

    def update(self, superhero: Superhero, update_data: dict) -> Superhero:
        """Update superhero data"""
        for key, value in update_data.items():
            if hasattr(superhero, key) and value is not None:
                setattr(superhero, key, value)
        self.db.commit()
        self.db.refresh(superhero)
        return superhero

    def get_by_alignment(self, alignment: str) -> List[Superhero]:
        """Get superheroes by alignment"""
        return self.db.query(Superhero).filter(Superhero.alignment == alignment).all()

    def get_random(self, count: int = 5) -> List[Superhero]:
        """Get random superheroes"""
        return self.db.query(Superhero).order_by(func.random()).limit(count).all()

    def get_by_power_stat(self, stat_name: str, min_value: int = 50) -> List[Superhero]:
        """Get superheroes by power stat (intelligence, strength, etc.)"""
        stat_column = getattr(Superhero, stat_name, None)
        if not stat_column:
            return []
        return self.db.query(Superhero).filter(stat_column >= min_value).all()
