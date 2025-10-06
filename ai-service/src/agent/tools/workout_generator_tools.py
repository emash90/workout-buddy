"""
Workout Generator Tools

Agent tools for generating personalized workout plans.
"""

from typing import Dict, List, Optional
from ...services.workout_generator import WorkoutGenerator


class WorkoutGeneratorTools:
    """Tools for generating workout plans."""

    def __init__(self):
        """Initialize workout generator tools."""
        self.generator = WorkoutGenerator()

    async def create_workout_plan(
        self,
        user_id: int,
        goal: str,
        duration_weeks: int = 8,
        days_per_week: int = 4,
        equipment: Optional[List[str]] = None,
        limitations: Optional[List[str]] = None
    ) -> Dict:
        """
        Generate a complete workout plan.

        Args:
            user_id: User's ID
            goal: Primary fitness goal
            duration_weeks: Plan duration in weeks
            days_per_week: Training days per week
            equipment: Available equipment
            limitations: Physical limitations

        Returns:
            Complete workout plan dictionary
        """
        plan = await self.generator.generate_workout_plan(
            user_id=user_id,
            goal=goal,
            duration_weeks=duration_weeks,
            days_per_week=days_per_week,
            equipment=equipment,
            limitations=limitations
        )

        return plan

    def suggest_quick_workout(
        self,
        goal: str,
        duration_minutes: int = 20,
        equipment: Optional[List[str]] = None
    ) -> Dict:
        """
        Suggest a quick workout for today.

        Args:
            goal: Fitness goal
            duration_minutes: Available time
            equipment: Available equipment

        Returns:
            Quick workout dictionary
        """
        # Generate a simple workout
        workouts_by_goal = {
            "weight_loss": {
                "name": "Quick HIIT Workout",
                "exercises": [
                    {"name": "Jumping Jacks", "duration": "1 minute", "rest": "30 seconds"},
                    {"name": "Burpees", "reps": "10-12", "rest": "30 seconds"},
                    {"name": "Mountain Climbers", "duration": "45 seconds", "rest": "30 seconds"},
                    {"name": "High Knees", "duration": "45 seconds", "rest": "30 seconds"},
                    {"name": "Plank", "duration": "30-45 seconds", "rest": "30 seconds"}
                ],
                "rounds": 3 if duration_minutes >= 20 else 2,
                "notes": "Complete all exercises, rest, then repeat for specified rounds"
            },
            "muscle_gain": {
                "name": "Quick Strength Circuit",
                "exercises": [
                    {"name": "Push-ups", "reps": "12-15", "rest": "45 seconds"},
                    {"name": "Squats", "reps": "15-20", "rest": "45 seconds"},
                    {"name": "Dumbbell Rows", "reps": "12-15 each arm", "rest": "45 seconds"},
                    {"name": "Lunges", "reps": "10-12 each leg", "rest": "45 seconds"},
                    {"name": "Plank", "duration": "45-60 seconds", "rest": "60 seconds"}
                ],
                "rounds": 3,
                "notes": "Focus on form, increase weight when possible"
            },
            "endurance": {
                "name": "Quick Cardio Session",
                "exercises": [
                    {"name": "Jogging in Place", "duration": "2 minutes", "rest": "30 seconds"},
                    {"name": "Jumping Jacks", "duration": "1 minute", "rest": "30 seconds"},
                    {"name": "Step-ups", "duration": "1 minute", "rest": "30 seconds"},
                    {"name": "High Knees", "duration": "1 minute", "rest": "30 seconds"},
                    {"name": "Cool-down Walk", "duration": "2 minutes", "rest": "none"}
                ],
                "rounds": 2,
                "notes": "Maintain steady pace, focus on breathing"
            }
        }

        # Default to general fitness
        workout = workouts_by_goal.get(goal, workouts_by_goal["weight_loss"])

        return {
            "workout": workout,
            "duration_minutes": duration_minutes,
            "goal": goal,
            "equipment_needed": equipment or ["none - bodyweight only"]
        }

    def suggest_progression(
        self,
        current_workout: Dict,
        fitness_level: str
    ) -> Dict:
        """
        Suggest how to progress a workout.

        Args:
            current_workout: Current workout details
            fitness_level: User's fitness level

        Returns:
            Progression suggestions
        """
        progressions = {
            "beginner": [
                "Add 1-2 more reps per set",
                "Reduce rest time by 10-15 seconds",
                "Add one more set to each exercise",
                "Improve form and range of motion"
            ],
            "intermediate": [
                "Increase weight by 5-10%",
                "Add 2-3 more reps per set",
                "Reduce rest time by 15-20 seconds",
                "Add a more challenging exercise variation",
                "Increase training frequency by 1 day"
            ],
            "advanced": [
                "Increase weight by 5-10%",
                "Add advanced exercise variations",
                "Incorporate drop sets or supersets",
                "Reduce rest time for density training",
                "Add volume (sets/reps)"
            ]
        }

        return {
            "current_level": fitness_level,
            "progression_strategies": progressions.get(fitness_level, progressions["intermediate"]),
            "recommended_timeline": "Progress every 2-3 weeks",
            "notes": "Only progress when you can complete current workout with good form"
        }
