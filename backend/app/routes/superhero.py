from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas.superhero import SuperheroUpdate
from ..schemas.auth import APIResponse
from ..controllers.superhero_controller import SuperheroController
from ..utils.auth import get_current_active_user, get_current_admin_user
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

@router.get("", response_model=APIResponse)
def get_superheroes(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    alignment: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all superheroes with pagination and filters"""
    user_id = None
    # Try to get current user if Authorization header is provided (optional authentication)
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            user = get_current_active_user(db, token)
            if user:
                user_id = user.id
        except Exception:
            # If token is invalid, continue without user_id
            pass
    
    controller = SuperheroController(db)
    result = controller.get_all(page, page_size, search, alignment, user_id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result

@router.get("/{superhero_id}", response_model=APIResponse)
def get_superhero(
    superhero_id: int,
    db: Session = Depends(get_db)
):
    """Get superhero by ID"""
    controller = SuperheroController(db)
    result = controller.get_by_id(superhero_id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message
        )

    return result

@router.put("/{superhero_id}", response_model=APIResponse)
def update_superhero(
    superhero_id: int,
    update_data: SuperheroUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update superhero (admin only)"""
    token = credentials.credentials
    admin_user = get_current_admin_user(db, token)

    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update superheroes"
        )

    controller = SuperheroController(db)
    result = controller.update(superhero_id, update_data, admin_user.role)

    if result.status == "error":
        status_code = status.HTTP_404_NOT_FOUND if "not found" in result.message.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )

    return result
