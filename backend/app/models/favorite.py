from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class UserFavorite(Base):
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    superhero_id = Column(Integer, ForeignKey("superheroes.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Ensure a user can only favorite a superhero once
    __table_args__ = (
        UniqueConstraint('user_id', 'superhero_id', name='unique_user_superhero_favorite'),
    )

    def __repr__(self):
        return f"<UserFavorite(user_id={self.user_id}, superhero_id={self.superhero_id})>"
