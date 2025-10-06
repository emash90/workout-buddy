"""
Recommendations API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from ...agent.fitness_coach import FitnessCoachAgent
from ...utils.logger import logger

router = APIRouter()

# Initialize agent (singleton)
agent = FitnessCoachAgent()


class WorkoutPlanRequest(BaseModel):
    """Workout plan request model."""
    user_id: int
    goal: str
    duration_weeks: int = 8
    days_per_week: int = 4
    equipment: Optional[List[str]] = None
    limitations: Optional[List[str]] = None


class QuickWorkoutRequest(BaseModel):
    """Quick workout request model."""
    goal: str
    duration_minutes: int = 20
    equipment: Optional[List[str]] = None


@router.post("/workout-plan")
async def generate_workout_plan(request: WorkoutPlanRequest):
    """
    Generate a personalized workout plan.

    Args:
        request: Workout plan request

    Returns:
        Complete workout plan
    """
    try:
        logger.info(f"Generating workout plan for user {request.user_id}, goal: {request.goal}")

        plan = await agent.generate_workout_plan(
            user_id=request.user_id,
            goal=request.goal,
            duration_weeks=request.duration_weeks,
            days_per_week=request.days_per_week,
            equipment=request.equipment,
            limitations=request.limitations
        )

        return plan

    except Exception as e:
        logger.error(f"Workout plan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-workout")
async def get_quick_workout(request: QuickWorkoutRequest):
    """
    Get a quick workout suggestion for today.

    Args:
        request: Quick workout request

    Returns:
        Quick workout details
    """
    try:
        logger.info(f"Generating quick workout, goal: {request.goal}")

        workout = agent.workout_tools.suggest_quick_workout(
            goal=request.goal,
            duration_minutes=request.duration_minutes,
            equipment=request.equipment
        )

        return workout

    except Exception as e:
        logger.error(f"Quick workout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
