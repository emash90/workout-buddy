"""
Health Check Routes
"""

from fastapi import APIRouter
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Health status
    """
    has_google_api_key = bool(os.getenv("GOOGLE_API_KEY"))

    return {
        "status": "healthy",
        "service": "ai-service",
        "google_api_configured": has_google_api_key
    }
