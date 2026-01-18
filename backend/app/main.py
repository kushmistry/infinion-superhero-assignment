from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine
from .routes import auth_router, superhero_router, favorite_router, team_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

app.include_router(
    superhero_router,
    prefix=f"{settings.API_V1_STR}/superheroes",
    tags=["superheroes"]
)

app.include_router(
    favorite_router,
    prefix=f"{settings.API_V1_STR}/favorites",
    tags=["favorites"]
)

app.include_router(
    team_router,
    prefix=f"{settings.API_V1_STR}/teams",
    tags=["teams"]
)

@app.get("/")
def root():
    return {"message": "Superhero API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}