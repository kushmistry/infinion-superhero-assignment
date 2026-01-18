from sqlalchemy.orm import Session
from ..models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_username(self, username: str) -> User:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, user_data: dict) -> User:
        """Create a new user"""
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user: User, update_data: dict) -> User:
        """Update user data"""
        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def soft_delete_user(self, user: User) -> User:
        """Soft delete user"""
        from datetime import datetime
        user.deleted_at = datetime.utcnow()
        user.is_active = False
        self.db.commit()
        return user

    def get_active_users(self) -> list[User]:
        """Get all active users"""
        return self.db.query(User).filter(User.is_active == True).all()

    def set_password_reset_token(self, user: User, token: str, expires_at) -> User:
        """Set password reset token for user"""
        user.reset_token = token
        user.reset_token_expires_at = expires_at
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_reset_token(self, token: str) -> User:
        """Get user by reset token"""
        return self.db.query(User).filter(User.reset_token == token).first()

    def clear_password_reset_token(self, user: User) -> User:
        """Clear password reset token for user"""
        user.reset_token = None
        user.reset_token_expires_at = None
        self.db.commit()
        self.db.refresh(user)
        return user

    def is_reset_token_valid(self, user: User) -> bool:
        """Check if user's reset token is valid (not expired)"""
        if not user.reset_token or not user.reset_token_expires_at:
            return False

        from datetime import datetime, timezone
        # Make current time timezone-aware to match database datetime
        now = datetime.now(timezone.utc)
        return now < user.reset_token_expires_at