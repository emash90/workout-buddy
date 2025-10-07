"""
Insights API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Union
from ...agent.fitness_coach import FitnessCoachAgent
from ...utils.logger import logger

router = APIRouter()

# Initialize agent (singleton)
agent = FitnessCoachAgent()


class InsightsRequest(BaseModel):
    """Insights request model."""
    user_id: Union[int, str]  # Support both int and UUID string
    period: str = "week"  # "week", "month", "year"


class InsightsResponse(BaseModel):
    """Insights response model."""
    insights: List[str]
    patterns: Dict
    stats: Dict
    period: str


@router.post("/", response_model=InsightsResponse)
async def generate_insights(request: InsightsRequest):
    """
    Generate personalized fitness insights.

    Args:
        request: Insights request with user_id and period

    Returns:
        Generated insights and patterns
    """
    try:
        logger.info(f"Generating insights for user {request.user_id}, period: {request.period}")

        result = await agent.generate_insights(
            user_id=request.user_id,
            period=request.period
        )

        return InsightsResponse(
            insights=result.get("insights", []),
            patterns=result.get("patterns", {}),
            stats=result.get("patterns", {}).get("stats", {}),
            period=request.period
        )

    except Exception as e:
        logger.error(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daily")
async def get_daily_insight(user_id: Union[int, str] = Query(...)):
    """
    Get today's daily insight.

    Args:
        user_id: User ID (int or UUID string)

    Returns:
        Daily insight
    """
    try:
        logger.info(f"Getting daily insight for user {user_id}")

        # Get real data from database
        today_data = await agent.fitness_tools.get_today_data(user_id)
        weekly_data = await agent.fitness_tools.get_daily_data(user_id, 7)

        if not today_data:
            today_data = {"steps": 0, "calories": 0}

        if not weekly_data:
            weekly_data = []

        insight = agent.insights_tools.get_daily_insight(
            user_id=user_id,
            today_data=today_data,
            weekly_data=weekly_data
        )

        return insight

    except Exception as e:
        logger.error(f"Daily insight error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
