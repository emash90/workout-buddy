from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import chat, insights, recommendations, health
from .utils.logger import logger

app = FastAPI(
    title="Workout Buddy AI Service",
    description="AI-powered fitness analysis and workout generation service powered by Google Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])

@app.on_event("startup")
async def startup():
    logger.info("🚀 Workout Buddy AI Service starting...")
    logger.info("✅ AI Service ready")

@app.get("/")
async def root():
    return {
        "message": "Workout Buddy AI Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "insights": "/insights",
            "recommendations": "/recommendations",
            "health": "/health",
            "docs": "/docs"
        }
    }
