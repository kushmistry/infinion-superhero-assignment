from .auth import router as auth_router
from .superhero import router as superhero_router
from .favorite import router as favorite_router
from .team import router as team_router

__all__ = ["auth_router", "superhero_router", "favorite_router", "team_router"]