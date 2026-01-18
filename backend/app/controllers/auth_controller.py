from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import secrets
from ..repository.user_repository import UserRepository
from ..schemas.auth import UserCreate, UserResponse, APIResponse, VerifyTokenResponse
from ..utils.auth import get_password_hash, create_access_token
from ..utils import get_logger, create_success_response, create_error_response, create_user_data
from ..service import send_password_reset_email
from ..config import settings

logger = get_logger("auth_controller")

class AuthController:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> APIResponse:
        """Register a new user"""
        try:
            # Generate username from email (part before @)
            base_username = user_data.email.split('@')[0]
            username = base_username
            
            # Ensure username is unique by appending numbers if needed
            counter = 1
            while self.user_repo.get_user_by_username(username):
                username = f"{base_username}{counter}"
                counter += 1
            
            # Check if user already exists by email
            if self.user_repo.get_user_by_email(user_data.email):
                logger.warning(f"Registration failed - user already exists: {user_data.email}")
                return create_error_response("User with this email already exists")

            # Create user data
            user_dict = {
                "email": user_data.email,
                "username": username,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "password_hash": get_password_hash(user_data.password),
                "role": "user",
                "is_active": True
            }

            # Create user
            user = self.user_repo.create_user(user_dict)
            return create_success_response("User registered successfully", {"user": create_user_data(user)})

        except Exception as e:
            logger.error(f"Registration error for {user_data.email}: {e}")
            return create_error_response("Registration failed due to server error")

    def authenticate_user(self, email: str, password: str) -> APIResponse:
        """Authenticate user and return access token"""
        try:
            user = self.user_repo.get_user_by_email(email)
            if not user or not user.is_active:
                logger.warning(f"Login failed - user not found or inactive: {email}")
                return create_error_response("Invalid email or password")

            # Check password
            from ..utils.auth import verify_password
            if not verify_password(password, user.password_hash):
                logger.warning(f"Login failed - invalid password: {email}")
                return create_error_response("Invalid email or password")

            # Generate access token (30 days)
            access_token_expires = timedelta(days=30)
            access_token = create_access_token(
                data={"sub": user.email},
                expires_delta=access_token_expires
            )

            return create_success_response("Login successful", {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": int(access_token_expires.total_seconds()),
                "user": create_user_data(user)
            })

        except Exception as e:
            logger.error(f"Login error for {email}: {e}")
            return create_error_response("Login failed due to server error")

    def get_current_user(self, email: str) -> APIResponse:
        """Get current user by email"""
        try:
            user = self.user_repo.get_user_by_email(email)
            if not user or not user.is_active:
                return create_error_response("User not found or inactive")

            return create_success_response("User retrieved successfully", {"user": create_user_data(user)})

        except Exception as e:
            logger.error(f"Error getting user {email}: {e}")
            return create_error_response("Failed to retrieve user")

    def initiate_password_reset(self, email: str) -> APIResponse:
        """Initiate password reset process"""
        try:
            user = self.user_repo.get_user_by_email(email)
            if not user:
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return create_error_response("No account found with this email address.")

            if not user.is_active:
                logger.warning(f"Password reset requested for inactive account: {email}")
                return create_error_response("This account is not active. Please contact support.")

            # Generate reset token and expiry (10 minutes)
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

            # Set reset token
            self.user_repo.set_password_reset_token(user, reset_token, expires_at)

            # Send password reset email
            from ..service.email_service import email_service

            if not email_service.is_configured:
                # Email not configured - log token for development
                logger.warning(f"Email not configured. Password reset token for {email}: {reset_token}")
                return create_success_response("Password reset token generated. Check server logs for the token (email not configured).")

            email_sent = send_password_reset_email(email, reset_token)

            if email_sent:
                return create_success_response("If an account with this email exists, a password reset link has been sent.")
            else:
                logger.error(f"Failed to send password reset email to {email}")
                # Still return success for security (don't reveal email sending issues)
                return create_success_response("If an account with this email exists, a password reset link has been sent.")

        except Exception as e:
            logger.error(f"Password reset initiation error for {email}: {e}")
            return create_error_response("Failed to initiate password reset")

    def reset_password(self, token: str, new_password: str) -> APIResponse:
        """Reset password using token"""
        try:
            user = self.user_repo.get_user_by_reset_token(token)
            if not user or not self.user_repo.is_reset_token_valid(user):
                logger.warning("Invalid or expired password reset token")
                return create_error_response("Invalid or expired reset token")

            # Update password
            user.password_hash = get_password_hash(new_password)
            user.reset_token = None
            user.reset_token_expires_at = None

            self.user_repo.update_user(user, {})
            return create_success_response("Password has been reset successfully")

        except Exception as e:
            logger.error(f"Password reset error: {e}")
            return create_error_response("Failed to reset password")

    def verify_reset_token(self, token: str) -> APIResponse:
        """Verify if a reset token is valid"""
        try:
            user = self.user_repo.get_user_by_reset_token(token)
            if not user or not self.user_repo.is_reset_token_valid(user):
                return create_success_response("Token validation completed", {"valid": False, "expires_at": None})

            # Token is valid
            expires_at = user.reset_token_expires_at.isoformat() if user.reset_token_expires_at else None
            return create_success_response("Token validation completed", {"valid": True, "expires_at": expires_at})

        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return create_error_response("Failed to verify token")