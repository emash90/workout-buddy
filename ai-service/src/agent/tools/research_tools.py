"""
Research Tools

Agent tools for performing web research on fitness topics.
"""

from typing import Dict, List, Optional
from ...services.research_service import ResearchService


class ResearchTools:
    """Tools for researching exercises and fitness topics."""

    def __init__(self):
        """Initialize research tools."""
        self.research_service = ResearchService()

    async def search_exercises(
        self,
        goal: str,
        fitness_level: str = "intermediate",
        equipment: Optional[List[str]] = None
    ) -> Dict:
        """
        Search for exercises based on user's goal.

        Args:
            goal: Fitness goal (e.g., "muscle_gain", "weight_loss")
            fitness_level: User's fitness level
            equipment: Available equipment

        Returns:
            Dictionary with exercises and sources
        """
        results = await self.research_service.search_exercises(
            goal=goal,
            fitness_level=fitness_level,
            equipment=equipment
        )

        return {
            "goal": goal,
            "fitness_level": fitness_level,
            "exercises": results,
            "count": len(results),
            "sources_included": True
        }

    async def research_training_method(self, method: str) -> Dict:
        """
        Research a specific training method.

        Args:
            method: Training method to research (e.g., "progressive overload", "HIIT")

        Returns:
            Dictionary with research results
        """
        results = await self.research_service.research_topic(
            topic=method,
            context="training method benefits science"
        )

        return {
            "method": method,
            "results": results,
            "sources_count": len(results)
        }

    async def research_nutrition(self, goal: str) -> Dict:
        """
        Research nutrition strategies for a goal.

        Args:
            goal: Fitness goal

        Returns:
            Dictionary with nutrition research
        """
        results = await self.research_service.research_topic(
            topic=f"nutrition for {goal}",
            context="evidence-based diet recommendations"
        )

        return {
            "goal": goal,
            "nutrition_research": results,
            "sources_count": len(results)
        }

    async def research_injury_prevention(self, activity: str) -> Dict:
        """
        Research injury prevention for specific activity.

        Args:
            activity: Activity or exercise

        Returns:
            Dictionary with injury prevention info
        """
        results = await self.research_service.research_topic(
            topic=f"{activity} injury prevention",
            context="safe training techniques"
        )

        return {
            "activity": activity,
            "prevention_tips": results,
            "sources_count": len(results)
        }

    async def research_recovery_methods(self) -> Dict:
        """
        Research recovery and rest strategies.

        Returns:
            Dictionary with recovery research
        """
        results = await self.research_service.research_topic(
            topic="muscle recovery techniques",
            context="post-workout recovery science"
        )

        return {
            "recovery_methods": results,
            "sources_count": len(results)
        }
