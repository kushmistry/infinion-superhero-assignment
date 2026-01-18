from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..config import settings
from ..models.user import User
from ..utils import get_logger

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Logger
logger = get_logger("auth_utils")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not user.is_active:
        logger.warning(f"Attempted login with inactive account: {email}")
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def get_current_user(db: Session, token: str) -> Optional[User]:
    """Get current user from JWT token"""
    payload = verify_token(token)
    if payload is None:
        return None

    email: str = payload.get("sub")
    if email is None:
        return None

    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active:
        return None

    return user

def get_current_active_user(db: Session, token: str) -> Optional[User]:
    """Get current active user (same as get_current_user for now)"""
    return get_current_user(db, token)

def get_current_admin_user(db: Session, token: str) -> Optional[User]:
    """Get current admin user"""
    user = get_current_user(db, token)
    if user and user.role == "admin":
        return user
    return None