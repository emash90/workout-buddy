"""
Application Settings

Configuration loaded from environment variables.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # Database
    database_url: Optional[str] = os.getenv("DATABASE_URL")

    # Google API
    google_api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")

    # Serper API
    serper_api_key: Optional[str] = os.getenv("SERPER_API_KEY")

    # Google Custom Search
    google_search_api_key: Optional[str] = os.getenv("GOOGLE_SEARCH_API_KEY")
    google_search_cx: Optional[str] = os.getenv("GOOGLE_SEARCH_CX")

    # JWT
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key")

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Service
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
