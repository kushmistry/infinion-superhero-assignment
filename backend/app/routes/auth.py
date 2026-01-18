from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.auth import (
    UserCreate, LoginRequest, ForgotPasswordRequest, 
    ResetPasswordRequest, APIResponse, VerifyTokenRequest
)
from ..utils.auth import get_current_active_user
from ..controllers.auth_controller import AuthController

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=APIResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account"""
    controller = AuthController(db)
    result = controller.register_user(user_data)
    if result.status == "error":
        # Return 409 for duplicate email, 400 for other validation errors
        if "already exists" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=result.message
            )
        elif "server error" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message
            )
    return result

@router.post("/login", response_model=APIResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    controller = AuthController(db)
    result = controller.authenticate_user(login_data.email, login_data.password)

    if result.status == "error":
        # Return 401 for invalid credentials, 500 for server errors
        if "server error" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.message,
                headers={"WWW-Authenticate": "Bearer"},
            )

    return result

@router.post("/forgot-password", response_model=APIResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset - sends reset email"""
    controller = AuthController(db)
    result = controller.initiate_password_reset(request.email)

    if result.status == "error":
        # Return appropriate HTTP status codes for different error types
        if "not found" in result.message.lower() or "no account" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.message
            )
        elif "not active" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=result.message
            )
        elif "server error" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message
            )

    return result

@router.post("/reset-password", response_model=APIResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using reset token"""
    controller = AuthController(db)
    result = controller.reset_password(request.token, request.new_password)

    if result.status == "error":
        # Return 400 for invalid/expired token, 500 for server errors
        if "invalid" in result.message.lower() or "expired" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message
            )
        elif "server error" in result.message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message
            )

    return result

@router.get("/me", response_model=APIResponse)
def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user information"""
    token = credentials.credentials
    user_email = get_current_active_user(db, token)

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    controller = AuthController(db)
    result = controller.get_current_user(user_email.email)

    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message
        )

    return result

@router.post("/verify-reset-token", response_model=APIResponse)
def verify_reset_token(request: VerifyTokenRequest, db: Session = Depends(get_db)):
    """Verify if a password reset token is valid"""
    controller = AuthController(db)
    result = controller.verify_reset_token(request.token)
    
    if result.status == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message
        )
    
    return result