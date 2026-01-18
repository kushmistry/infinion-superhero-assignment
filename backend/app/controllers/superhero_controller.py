from sqlalchemy.orm import Session
from typing import Optional
from ..repository.superhero_repository import SuperheroRepository
from ..repository.favorite_repository import FavoriteRepository
from ..schemas.superhero import SuperheroUpdate, SuperheroResponse
from ..utils import get_logger, create_success_response, create_error_response, create_superhero_data
import math

logger = get_logger("superhero_controller")

class SuperheroController:
    def __init__(self, db: Session):
        self.db = db
        self.superhero_repo = SuperheroRepository(db)
        self.favorite_repo = FavoriteRepository(db)

    def get_all(
        self, 
        page: int = 1, 
        page_size: int = 20,
        search: Optional[str] = None,
        alignment: Optional[str] = None,
        user_id: Optional[int] = None
    ):
        """Get all superheroes with pagination"""
        try:
            items, total = self.superhero_repo.get_all(page, page_size, search, alignment)
            
            # Get user's favorite IDs if user is authenticated (efficient bulk check)
            favorite_ids = set()
            if user_id:
                favorite_ids = set(self.favorite_repo.get_user_favorite_ids(user_id))
            
            return create_success_response(
                "Superheroes retrieved successfully",
                {
                    "items": [
                        create_superhero_data(item, is_favorite=(item.id in favorite_ids)) 
                        for item in items
                    ],
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "pages": math.ceil(total / page_size) if page_size > 0 else 0
                }
            )
        except Exception as e:
            logger.error(f"Error getting superheroes: {e}")
            return create_error_response("Failed to retrieve superheroes")

    def get_by_id(self, superhero_id: int):
        """Get superhero by ID"""
        try:
            superhero = self.superhero_repo.get_by_id(superhero_id)
            if not superhero:
                return create_error_response("Superhero not found")
            
            return create_success_response(
                "Superhero retrieved successfully",
                create_superhero_data(superhero)
            )
        except Exception as e:
            logger.error(f"Error getting superhero {superhero_id}: {e}")
            return create_error_response("Failed to retrieve superhero")

    def update(self, superhero_id: int, update_data: SuperheroUpdate, user_role: str):
        """Update superhero (admin only)"""
        if user_role != "admin":
            return create_error_response("Only admins can update superheroes")
        
        try:
            superhero = self.superhero_repo.get_by_id(superhero_id)
            if not superhero:
                return create_error_response("Superhero not found")

            update_dict = update_data.model_dump(exclude_unset=True)
            updated = self.superhero_repo.update(superhero, update_dict)
            
            return create_success_response(
                "Superhero updated successfully",
                create_superhero_data(updated)
            )
        except Exception as e:
            logger.error(f"Error updating superhero {superhero_id}: {e}")
            return create_error_response("Failed to update superhero")
