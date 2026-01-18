from sqlalchemy.orm import Session
from typing import List
from ..models.favorite import UserFavorite
from ..models.superhero import Superhero

class FavoriteRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_favorite(self, user_id: int, superhero_id: int) -> UserFavorite:
        """Add a favorite superhero for a user"""
        favorite = UserFavorite(user_id=user_id, superhero_id=superhero_id)
        self.db.add(favorite)
        self.db.commit()
        self.db.refresh(favorite)
        return favorite

    def remove_favorite(self, user_id: int, superhero_id: int) -> bool:
        """Remove a favorite superhero for a user"""
        favorite = self.db.query(UserFavorite).filter(
            UserFavorite.user_id == user_id,
            UserFavorite.superhero_id == superhero_id
        ).first()
        
        if favorite:
            self.db.delete(favorite)
            self.db.commit()
            return True
        return False

    def get_user_favorites(self, user_id: int) -> List[Superhero]:
        """Get all favorite superheroes for a user"""
        favorites = self.db.query(UserFavorite).filter(
            UserFavorite.user_id == user_id
        ).all()
        
        superhero_ids = [f.superhero_id for f in favorites]
        return self.db.query(Superhero).filter(Superhero.id.in_(superhero_ids)).all()

    def is_favorite(self, user_id: int, superhero_id: int) -> bool:
        """Check if a superhero is favorited by user"""
        favorite = self.db.query(UserFavorite).filter(
            UserFavorite.user_id == user_id,
            UserFavorite.superhero_id == superhero_id
        ).first()
        return favorite is not None

    def get_user_favorite_ids(self, user_id: int) -> List[int]:
        """Get list of favorite superhero IDs for a user (more efficient for bulk checks)"""
        favorites = self.db.query(UserFavorite).filter(
            UserFavorite.user_id == user_id
        ).all()
        return [f.superhero_id for f in favorites]
