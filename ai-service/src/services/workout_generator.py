"""
Workout Generator Service

Generates personalized workout plans by combining:
- User's fitness data and level
- Web research on effective training methods
- Progressive overload principles
- Recovery considerations
"""

from typing import Dict, List, Optional
from .research_service import ResearchService


class WorkoutGenerator:
    """Generates intelligent, personalized workout plans."""

    def __init__(self):
        self.research_service = ResearchService()

    async def generate_workout_plan(
        self,
        user_id: int,
        goal: str,
        duration_weeks: int = 8,
        days_per_week: int = 4,
        equipment: Optional[List[str]] = None,
        limitations: Optional[List[str]] = None
    ) -> Dict:
        """
        Generate a comprehensive workout plan.

        Args:
            user_id: User's ID
            goal: Primary goal (e.g., "weight_loss", "muscle_gain", "endurance")
            duration_weeks: Plan duration (4-12 weeks)
            days_per_week: Training days per week (3-6)
            equipment: Available equipment
            limitations: Physical limitations

        Returns:
            Complete workout plan with exercises, progressions, sources
        """

        # Step 1: Get user's fitness level
        # TODO: Get from database
        fitness_summary = {"avg_steps": 8500, "total_active_minutes": 320}
        fitness_level = "intermediate"

        # Step 2: Research exercises for this goal
        if equipment is None:
            equipment = ["bodyweight", "dumbbells", "resistance bands"]

        exercise_research = await self.research_service.search_exercises(
            goal=goal,
            fitness_level=fitness_level,
            equipment=equipment,
            limitations=limitations
        )

        # Step 3: Build week-by-week plan
        weekly_plans = []

        for week in range(1, duration_weeks + 1):
            # Progressive intensity (5% increase per week)
            intensity_multiplier = 1 + (week - 1) * 0.05

            week_plan = {
                "week_number": week,
                "focus": self._get_week_focus(week, duration_weeks, goal),
                "intensity_level": self._calculate_intensity_percentage(intensity_multiplier),
                "workouts": []
            }

            # Create workouts for each training day
            for day in range(1, days_per_week + 1):
                workout = self._create_daily_workout(
                    day_number=day,
                    goal=goal,
                    fitness_level=fitness_level,
                    intensity_multiplier=intensity_multiplier,
                    exercises=exercise_research,
                    equipment=equipment,
                    total_days=days_per_week
                )
                week_plan["workouts"].append(workout)

            weekly_plans.append(week_plan)

        # Step 4: Compile complete plan
        complete_plan = {
            "user_id": user_id,
            "goal": goal,
            "fitness_level": fitness_level,
            "duration_weeks": duration_weeks,
            "days_per_week": days_per_week,
            "weekly_plans": weekly_plans,
            "principles": {
                "progressive_overload": "Intensity increases 5% per week",
                "recovery": f"{7 - days_per_week} rest days per week",
                "variety": "Exercise variations every 2-3 weeks to prevent plateaus",
                "form_focus": "Quality over quantity - proper form is essential"
            },
            "sources": self._compile_sources(exercise_research),
            "tips": self._generate_tips(goal, fitness_level),
            "nutrition_guidelines": self._get_nutrition_guidelines(goal),
            "current_fitness_stats": {
                "avg_steps": fitness_summary['avg_steps'],
                "total_active_minutes": fitness_summary['total_active_minutes'],
                "fitness_level": fitness_level
            }
        }

        return complete_plan

    def _get_week_focus(self, week: int, total_weeks: int, goal: str) -> str:
        """Determine focus for each week."""
        phase = week / total_weeks

        if phase <= 0.25:
            return "Foundation - Learning proper form and building base endurance"
        elif phase <= 0.5:
            return "Building Volume - Increasing sets and reps"
        elif phase <= 0.75:
            return "Intensity - Adding weight and difficulty"
        else:
            return "Peak Performance - Maximizing results"

    def _calculate_intensity_percentage(self, multiplier: float) -> int:
        """Calculate intensity as percentage."""
        base_intensity = 65  # Start at 65%
        return min(int(base_intensity * multiplier), 95)  # Cap at 95%

    def _create_daily_workout(
        self,
        day_number: int,
        goal: str,
        fitness_level: str,
        intensity_multiplier: float,
        exercises: List[Dict],
        equipment: List[str],
        total_days: int
    ) -> Dict:
        """Create a single day's workout."""
        workout = {
            "day": day_number,
            "type": self._get_workout_type(day_number, goal, total_days),
            "duration_minutes": self._calculate_duration(fitness_level, goal),
            "exercises": [],
            "warm_up": self._get_warmup(5),
            "cool_down": self._get_cooldown(5),
            "notes": []
        }

        # Select exercises for this day (5-6 exercises per workout)
        exercise_count = 6 if fitness_level == "advanced" else 5
        selected_exercises = self._select_exercises_for_day(
            workout_type=workout["type"],
            available_exercises=exercises,
            count=exercise_count,
            goal=goal
        )

        # Add exercise details (sets, reps, rest)
        for i, exercise in enumerate(selected_exercises, 1):
            exercise_detail = {
                "order": i,
                "name": self._clean_exercise_name(exercise.get("name", f"Exercise {i}")),
                "description": exercise.get("description", "")[:200],
                "sets": self._calculate_sets(fitness_level, intensity_multiplier),
                "reps_or_duration": self._calculate_reps(goal, fitness_level, intensity_multiplier),
                "rest_seconds": self._calculate_rest(goal, fitness_level),
                "tips": self._get_exercise_tips(exercise.get("name", "")),
                "source": exercise.get("source", "")
            }
            workout["exercises"].append(exercise_detail)

        # Add workout notes
        workout["notes"] = self._get_workout_notes(workout["type"], fitness_level)

        return workout

    def _get_workout_type(self, day_number: int, goal: str, total_days: int) -> str:
        """Determine workout type for the day."""
        goal_lower = goal.lower()

        if "muscle" in goal_lower or "gain" in goal_lower or "strength" in goal_lower:
            # Strength training split
            if total_days >= 5:
                types = ["Push (Chest, Shoulders, Triceps)", "Pull (Back, Biceps)", "Legs", "Upper Body", "Lower Body"]
            elif total_days >= 4:
                types = ["Upper Body Push", "Lower Body", "Upper Body Pull", "Full Body"]
            else:
                types = ["Upper Body", "Lower Body", "Full Body"]

            return types[(day_number - 1) % len(types)]

        elif "weight" in goal_lower or "fat" in goal_lower or "loss" in goal_lower:
            # Mix of cardio and strength
            if total_days >= 5:
                types = ["HIIT Cardio", "Strength Circuit", "Cardio + Core", "Full Body Strength", "Active Recovery / Cardio"]
            elif total_days >= 4:
                types = ["HIIT", "Strength Circuit", "Cardio", "Full Body"]
            else:
                types = ["HIIT", "Strength", "Cardio"]

            return types[(day_number - 1) % len(types)]

        elif "endurance" in goal_lower or "stamina" in goal_lower:
            # Endurance focus
            types = ["Long Steady Cardio", "Interval Training", "Tempo Run/Bike", "Recovery Cardio"]
            return types[(day_number - 1) % len(types)]

        else:
            # General fitness
            types = ["Full Body Strength", "Cardio", "Upper Body", "Lower Body"]
            return types[(day_number - 1) % len(types)]

    def _calculate_duration(self, fitness_level: str, goal: str) -> int:
        """Calculate workout duration in minutes."""
        base_durations = {
            "beginner": 30,
            "intermediate": 45,
            "advanced": 60
        }

        duration = base_durations.get(fitness_level, 45)

        # Adjust for goal
        if "endurance" in goal.lower():
            duration += 15

        return duration

    def _calculate_sets(self, fitness_level: str, intensity_multiplier: float) -> int:
        """Calculate number of sets."""
        base_sets = {
            "beginner": 2,
            "intermediate": 3,
            "advanced": 4
        }
        base = base_sets.get(fitness_level, 3)
        return min(int(base * intensity_multiplier), 5)

    def _calculate_reps(self, goal: str, fitness_level: str, intensity_multiplier: float) -> str:
        """Calculate reps or duration."""
        goal_lower = goal.lower()

        if "muscle" in goal_lower or "strength" in goal_lower:
            # Lower reps, higher weight for muscle gain
            base_reps = {"beginner": 12, "intermediate": 10, "advanced": 8}
            reps = max(int(base_reps.get(fitness_level, 10) / intensity_multiplier), 6)
            return f"{reps}-{reps+2} reps"

        elif "endurance" in goal_lower:
            # Higher reps or duration
            if fitness_level == "beginner":
                return "12-15 reps or 30 seconds"
            else:
                return "15-20 reps or 45 seconds"

        else:
            # General fitness / weight loss
            return "10-12 reps"

    def _calculate_rest(self, goal: str, fitness_level: str) -> int:
        """Calculate rest period in seconds."""
        goal_lower = goal.lower()

        if "muscle" in goal_lower or "strength" in goal_lower:
            return 90 if fitness_level == "advanced" else 60

        elif "fat" in goal_lower or "weight" in goal_lower:
            return 30  # Shorter rest for cardio effect

        else:
            return 60  # Moderate rest

    def _select_exercises_for_day(
        self,
        workout_type: str,
        available_exercises: List[Dict],
        count: int,
        goal: str
    ) -> List[Dict]:
        """Select appropriate exercises for the workout type."""
        # For now, return first N exercises
        # In production, this would filter by workout type and muscle groups
        return available_exercises[:count] if available_exercises else []

    def _clean_exercise_name(self, name: str) -> str:
        """Clean exercise name from research results."""
        # Remove common prefixes/suffixes from research results
        name = name.replace("Best ", "").replace(" Exercises", "").replace(" Exercise", "")
        name = name.split(" - ")[0]  # Take part before dash
        name = name.split("|")[0]  # Take part before pipe
        return name.strip()[:100]

    def _get_exercise_tips(self, exercise_name: str) -> str:
        """Get tips for specific exercise."""
        # Basic tips based on exercise type
        name_lower = exercise_name.lower()

        if "squat" in name_lower:
            return "Keep chest up, knees tracking over toes, weight in heels"
        elif "push" in name_lower or "press" in name_lower:
            return "Engage core, control the movement, full range of motion"
        elif "pull" in name_lower or "row" in name_lower:
            return "Squeeze shoulder blades together, avoid using momentum"
        elif "plank" in name_lower:
            return "Keep body straight, engage core, breathe steadily"
        else:
            return "Focus on proper form, control the movement, breathe consistently"

    def _get_warmup(self, duration_minutes: int) -> Dict:
        """Generate warm-up routine."""
        return {
            "duration_minutes": duration_minutes,
            "activities": [
                "Light cardio (jogging in place, jumping jacks) - 2 minutes",
                "Dynamic stretches (leg swings, arm circles, torso twists) - 2 minutes",
                "Movement-specific warm-up (lighter version of main exercises) - 1 minute"
            ]
        }

    def _get_cooldown(self, duration_minutes: int) -> Dict:
        """Generate cool-down routine."""
        return {
            "duration_minutes": duration_minutes,
            "activities": [
                "Light walking or easy movement - 2 minutes",
                "Static stretching (hold each stretch 20-30 seconds) - 2 minutes",
                "Deep breathing and recovery - 1 minute"
            ]
        }

    def _get_workout_notes(self, workout_type: str, fitness_level: str) -> List[str]:
        """Get notes specific to workout type."""
        notes = [
            "Listen to your body and adjust intensity as needed",
            "Maintain proper form throughout - quality over quantity"
        ]

        if "HIIT" in workout_type:
            notes.append("Push hard during work intervals, recover fully during rest")

        if fitness_level == "beginner":
            notes.append("Don't hesitate to take extra rest if needed")

        if "Strength" in workout_type:
            notes.append("Increase weight when you can complete all sets with good form")

        return notes

    def _compile_sources(self, research_results: List[Dict]) -> List[Dict]:
        """Compile all sources from research."""
        sources = []
        seen_urls = set()

        for result in research_results[:10]:
            url = result.get('source') or result.get('link')
            if url and url not in seen_urls:
                sources.append({
                    'title': result.get('source_title') or result.get('title', 'Source'),
                    'url': url
                })
                seen_urls.add(url)

        return sources

    def _generate_tips(self, goal: str, fitness_level: str) -> List[str]:
        """Generate tips for the workout plan."""
        tips = [
            "🎯 Consistency is more important than perfection",
            "💧 Stay hydrated - drink water before, during, and after workouts",
            "😴 Get 7-9 hours of sleep for optimal recovery",
            "📊 Track your workouts to monitor progress",
            "⚠️ Stop if you feel sharp pain - discomfort is okay, pain is not"
        ]

        if goal.lower() in ["weight_loss", "fat_loss"]:
            tips.append("🍽️ Combine with calorie deficit for best results")
            tips.append("🏃 Add extra walking or light cardio on rest days")

        if goal.lower() in ["muscle_gain", "strength"]:
            tips.append("🍖 Eat enough protein (0.8-1g per lb bodyweight)")
            tips.append("💪 Progressive overload - gradually increase weight/reps")

        if fitness_level == "beginner":
            tips.append("🌱 Start conservative - it's okay to begin easier and build up")
            tips.append("📅 Schedule workouts like important appointments")

        return tips

    def _get_nutrition_guidelines(self, goal: str) -> Dict:
        """Get basic nutrition guidelines for goal."""
        goal_lower = goal.lower()

        if "weight" in goal_lower or "fat" in goal_lower or "loss" in goal_lower:
            return {
                "focus": "Calorie Deficit",
                "protein": "High - 1.0-1.2g per lb bodyweight",
                "carbs": "Moderate - prioritize whole grains and vegetables",
                "fats": "Moderate - focus on healthy fats (avocado, nuts, olive oil)",
                "tips": [
                    "Create 300-500 calorie deficit daily",
                    "Don't cut calories too drastically",
                    "Eat plenty of vegetables for satiety"
                ]
            }

        elif "muscle" in goal_lower or "gain" in goal_lower:
            return {
                "focus": "Calorie Surplus + High Protein",
                "protein": "Very High - 1.0-1.2g per lb bodyweight",
                "carbs": "High - fuel for workouts and recovery",
                "fats": "Moderate - support hormone production",
                "tips": [
                    "Eat 200-300 calories above maintenance",
                    "Time protein around workouts",
                    "Focus on nutrient-dense foods"
                ]
            }

        elif "endurance" in goal_lower:
            return {
                "focus": "Carbohydrates + Hydration",
                "protein": "Moderate - 0.8-1.0g per lb bodyweight",
                "carbs": "High - primary fuel source",
                "fats": "Moderate",
                "tips": [
                    "Carb-load before long sessions",
                    "Stay well-hydrated",
                    "Consider electrolyte replacement for long workouts"
                ]
            }

        else:
            return {
                "focus": "Balanced Nutrition",
                "protein": "Moderate - 0.8g per lb bodyweight",
                "carbs": "Moderate - whole grains and fruits",
                "fats": "Moderate - healthy fats",
                "tips": [
                    "Eat balanced meals with protein, carbs, and fats",
                    "Focus on whole, minimally processed foods",
                    "Listen to your hunger cues"
                ]
            }
