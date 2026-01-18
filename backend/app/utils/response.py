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

def create_superhero_data(superhero, is_favorite: bool = False) -> dict:
    """
    Create standardized superhero data dictionary from Superhero model.

    Args:
        superhero: Superhero model instance
        is_favorite: Whether this superhero is favorited by the current user

    Returns:
        Dictionary with superhero data
    """
    data = {
        "id": superhero.id,
        "name": superhero.name,
        "response_status": superhero.response_status,
        "intelligence": superhero.intelligence,
        "strength": superhero.strength,
        "speed": superhero.speed,
        "durability": superhero.durability,
        "power": superhero.power,
        "combat": superhero.combat,
        "full_name": superhero.full_name,
        "alter_egos": superhero.alter_egos,
        "place_of_birth": superhero.place_of_birth,
        "first_appearance": superhero.first_appearance,
        "publisher": superhero.publisher,
        "alignment": superhero.alignment,
        "aliases": superhero.aliases,
        "gender": superhero.gender,
        "race": superhero.race,
        "height_feet": superhero.height_feet,
        "height_cm": superhero.height_cm,
        "weight_lbs": superhero.weight_lbs,
        "weight_kg": superhero.weight_kg,
        "eye_color": superhero.eye_color,
        "hair_color": superhero.hair_color,
        "occupation": superhero.occupation,
        "base": superhero.base,
        "group_affiliation": superhero.group_affiliation,
        "relatives": superhero.relatives,
        "image_url": superhero.image_url,
        "is_favorite": is_favorite
    }
    return data