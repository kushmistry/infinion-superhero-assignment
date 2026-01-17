import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Database - loaded from .env
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # API Settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")

    # External APIs
    SUPERHERO_API_BASE_URL: str = "https://www.superheroapi.com/api"
    SUPERHERO_API_TOKEN: str = os.getenv("SUPERHERO_API_TOKEN", "")

    # CORS
    BACKEND_CORS_ORIGINS: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000")

    # Project settings
    PROJECT_NAME: str = "Superhero API"
    VERSION: str = "1.0.0"

settings = Settings()