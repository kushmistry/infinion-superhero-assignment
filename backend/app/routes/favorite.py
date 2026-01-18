from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..database import get_db
from ..schemas.auth import APIResponse
from ..controllers.favorite_controller import FavoriteController
from ..utils.auth import get_current_active_user

router = APIRouter()
security = HTTPBearer()

@router.post("/{superhero_id}", response_model=APIResponse)
def add_favorite(
    superhero_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Add a superhero to favorites"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = FavoriteController(db)
    result = controller.add_favorite(user.id, superhero_id)

    if result.status == "error":
        status_code = status.HTTP_404_NOT_FOUND if "not found" in result.message.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )

    return result

@router.delete("/{superhero_id}", response_model=APIResponse)
def remove_favorite(
    superhero_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Remove a superhero from favorites"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = FavoriteController(db)
    result = controller.remove_favorite(user.id, superhero_id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message
        )

    return result

@router.get("", response_model=APIResponse)
def get_favorites(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all favorites for current user"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = FavoriteController(db)
    result = controller.get_favorites(user.id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result

@router.get("/check/{superhero_id}", response_model=APIResponse)
def check_favorite(
    superhero_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Check if a superhero is favorited by current user"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = FavoriteController(db)
    result = controller.check_favorite(user.id, superhero_id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result
