from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..schemas.auth import APIResponse
from ..controllers.team_controller import TeamController
from ..utils.auth import get_current_active_user

router = APIRouter()
security = HTTPBearer()

class TeamCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    superhero_ids: List[int]

class TeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    superhero_ids: Optional[List[int]] = None

@router.post("", response_model=APIResponse)
def create_team(
    team_data: TeamCreateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new team"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.create_team(
        user.id,
        team_data.name,
        team_data.description,
        team_data.superhero_ids
    )

    if result.status == "error":
        status_code = status.HTTP_400_BAD_REQUEST
        if "not found" in result.message.lower():
            status_code = status.HTTP_404_NOT_FOUND
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )

    return result

@router.get("", response_model=APIResponse)
def get_teams(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all teams for current user"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.get_user_teams(user.id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result

@router.get("/compare", response_model=APIResponse)
def compare_teams(
    team1_id: int = Query(..., description="First team ID"),
    team2_id: int = Query(..., description="Second team ID"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Compare two teams and predict a winner"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.compare_teams(team1_id, team2_id, user.id)

    if result.status == "error":
        status_code = status.HTTP_400_BAD_REQUEST
        if "not found" in result.message.lower():
            status_code = status.HTTP_404_NOT_FOUND
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )

    return result

@router.get("/{team_id}", response_model=APIResponse)
def get_team(
    team_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get team by ID"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.get_team_by_id(team_id, user.id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message
        )

    return result

@router.put("/{team_id}", response_model=APIResponse)
def update_team(
    team_id: int,
    team_data: TeamUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update a team"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.update_team(
        team_id,
        user.id,
        team_data.name,
        team_data.description,
        team_data.superhero_ids
    )

    if result.status == "error":
        status_code = status.HTTP_400_BAD_REQUEST
        if "not found" in result.message.lower():
            status_code = status.HTTP_404_NOT_FOUND
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )

    return result

@router.delete("/{team_id}", response_model=APIResponse)
def delete_team(
    team_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a team"""
    token = credentials.credentials
    user = get_current_active_user(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    controller = TeamController(db)
    result = controller.delete_team(team_id, user.id)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message
        )

    return result

@router.get("/recommendations/balanced", response_model=APIResponse)
def recommend_balanced_team(
    count: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get a balanced team recommendation (mix of alignments)"""
    controller = TeamController(db)
    result = controller.recommend_balanced_team(count)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result

@router.get("/recommendations/power", response_model=APIResponse)
def recommend_power_team(
    min_value: int = Query(50, ge=0, le=100),
    count: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get team recommendation based on a random power stat"""
    controller = TeamController(db)
    result = controller.recommend_power_team(None, min_value, count)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result

@router.get("/recommendations/random", response_model=APIResponse)
def recommend_random_team(
    count: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get a random team recommendation"""
    controller = TeamController(db)
    result = controller.recommend_random_team(count)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )

    return result
