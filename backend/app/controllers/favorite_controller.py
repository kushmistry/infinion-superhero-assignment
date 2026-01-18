from sqlalchemy.orm import Session
from ..repository.favorite_repository import FavoriteRepository
from ..repository.superhero_repository import SuperheroRepository
from ..utils import get_logger, create_success_response, create_error_response, create_superhero_data

logger = get_logger("favorite_controller")

class FavoriteController:
    def __init__(self, db: Session):
        self.db = db
        self.favorite_repo = FavoriteRepository(db)
        self.superhero_repo = SuperheroRepository(db)

    def add_favorite(self, user_id: int, superhero_id: int):
        """Add a superhero to favorites"""
        try:
            # Check if superhero exists
            superhero = self.superhero_repo.get_by_id(superhero_id)
            if not superhero:
                return create_error_response("Superhero not found")

            # Check if already favorited
            if self.favorite_repo.is_favorite(user_id, superhero_id):
                return create_error_response("Superhero is already in favorites")

            self.favorite_repo.add_favorite(user_id, superhero_id)
            return create_success_response("Superhero added to favorites")
        except Exception as e:
            logger.error(f"Error adding favorite: {e}")
            return create_error_response("Failed to add favorite")

    def remove_favorite(self, user_id: int, superhero_id: int):
        """Remove a superhero from favorites"""
        try:
            if not self.favorite_repo.remove_favorite(user_id, superhero_id):
                return create_error_response("Favorite not found")
            return create_success_response("Superhero removed from favorites")
        except Exception as e:
            logger.error(f"Error removing favorite: {e}")
            return create_error_response("Failed to remove favorite")

    def get_favorites(self, user_id: int):
        """Get all favorites for a user"""
        try:
            favorites = self.favorite_repo.get_user_favorites(user_id)
            superhero_data = [create_superhero_data(hero) for hero in favorites]
            return create_success_response(
                "Favorites retrieved successfully",
                superhero_data
            )
        except Exception as e:
            logger.error(f"Error getting favorites: {e}")
            return create_error_response("Failed to retrieve favorites")

    def check_favorite(self, user_id: int, superhero_id: int):
        """Check if a superhero is favorited"""
        try:
            is_favorite = self.favorite_repo.is_favorite(user_id, superhero_id)
            return create_success_response(
                "Favorite status retrieved",
                {"is_favorite": is_favorite}
            )
        except Exception as e:
            logger.error(f"Error checking favorite: {e}")
            return create_error_response("Failed to check favorite status")
