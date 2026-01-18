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
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30  # 30 days expiration

    # External APIs
    SUPERHERO_API_BASE_URL: str = "https://www.superheroapi.com/api"
    SUPERHERO_API_TOKEN: str = os.getenv("SUPERHERO_API_TOKEN", "")

    # CORS
    BACKEND_CORS_ORIGINS: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000")

    # Frontend Configuration
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")

    # Email/SMTP Configuration
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", SMTP_USERNAME)
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    # Project settings
    PROJECT_NAME: str = "Superhero API"
    VERSION: str = "1.0.0"

settings = Settings()