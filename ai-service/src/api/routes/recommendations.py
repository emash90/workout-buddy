"""
Recommendations API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
from ...agent.fitness_coach import FitnessCoachAgent
from ...utils.logger import logger

router = APIRouter()

# Initialize agent (singleton)
agent = FitnessCoachAgent()


class WorkoutPlanRequest(BaseModel):
    """Workout plan request model."""
    user_id: Union[int, str]  # Support both int and UUID string
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


@router.get("/quick-workout")
async def get_quick_workout(
    goal: str = Query(..., description="Fitness goal"),
    duration_minutes: int = Query(20, description="Workout duration in minutes"),
    equipment: Optional[str] = Query(None, description="Comma-separated equipment list")
):
    """
    Get a quick workout suggestion for today.

    Args:
        goal: Fitness goal (e.g., "weight_loss", "muscle_gain")
        duration_minutes: Workout duration in minutes (default: 20)
        equipment: Comma-separated equipment list (optional)

    Returns:
        Quick workout details
    """
    try:
        logger.info(f"Generating quick workout, goal: {goal}")

        # Parse equipment list
        equipment_list = equipment.split(',') if equipment else []

        workout = agent.workout_tools.suggest_quick_workout(
            goal=goal,
            duration_minutes=duration_minutes,
            equipment=equipment_list
        )

        return workout

    except Exception as e:
        logger.error(f"Quick workout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
