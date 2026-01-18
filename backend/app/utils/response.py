"""
Common API response utilities for standardized response format.
"""

from ..schemas.auth import APIResponse

def create_success_response(message: str, data=None) -> APIResponse:
    """
    Create a standardized success response.

    Args:
        message: Success message
        data: Optional data payload

    Returns:
        APIResponse with status="success"
    """
    return APIResponse(
        status="success",
        message=message,
        data=data
    )

def create_error_response(message: str, data=None) -> APIResponse:
    """
    Create a standardized error response.

    Args:
        message: Error message
        data: Optional error details

    Returns:
        APIResponse with status="error"
    """
    return APIResponse(
        status="error",
        message=message,
        data=data
    )

def create_user_data(user) -> dict:
    """
    Create standardized user data dictionary from User model.

    Args:
        user: User model instance

    Returns:
        Dictionary with user data
    """
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }