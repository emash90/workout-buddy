"""
Research Service

Provides internet research capabilities using Serper API or Google Custom Search.
Used to find latest exercise science, training methods, and fitness research.
"""

from typing import List, Dict, Optional
import os
import httpx
from ..utils.logger import logger


class ResearchService:
    """Web research service using Serper or Google Custom Search."""

    def __init__(self):
        self.serper_api_key = os.getenv('SERPER_API_KEY')
        self.google_api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
        self.google_cx = os.getenv('GOOGLE_SEARCH_CX')

        self.has_search = bool(self.serper_api_key or (self.google_api_key and self.google_cx))

    async def search_exercises(
        self,
        goal: str,
        fitness_level: str = "intermediate",
        equipment: Optional[List[str]] = None,
        limitations: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Search for exercises based on goal and constraints.

        Args:
            goal: Primary fitness goal (e.g., "weight_loss", "muscle_gain")
            fitness_level: User's fitness level ("beginner", "intermediate", "advanced")
            equipment: Available equipment
            limitations: Physical limitations or injuries

        Returns:
            List of exercise dictionaries with name, description, source
        """
        # Build search query
        equipment_str = " ".join(equipment[:3]) if equipment else "bodyweight"
        query = f"best {goal} exercises {fitness_level} {equipment_str} 2024 2025"

        if limitations:
            query += f" with {limitations[0]} safe"

        logger.info(f"Searching exercises: {query}")

        if self.has_search:
            try:
                if self.serper_api_key:
                    results = await self._search_serper(query)
                else:
                    results = await self._search_google(query)

                return self._filter_trusted_sources(results)
            except Exception as e:
                logger.error(f"Search failed: {e}")
                return self._get_mock_exercises(goal, fitness_level)
        else:
            logger.info("No search API configured, using mock data")
            return self._get_mock_exercises(goal, fitness_level)

    async def _search_serper(self, query: str) -> List[Dict]:
        """Search using Serper API."""
        url = "https://google.serper.dev/search"
        headers = {
            'X-API-KEY': self.serper_api_key,
            'Content-Type': 'application/json'
        }
        payload = {"q": query, "num": 10}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get('organic', []):
            results.append({
                'name': item.get('title', ''),
                'description': item.get('snippet', ''),
                'link': item.get('link', ''),
                'source': item.get('link', ''),
                'source_title': item.get('title', '')
            })

        return results

    async def _search_google(self, query: str) -> List[Dict]:
        """Search using Google Custom Search API."""
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': self.google_api_key,
            'cx': self.google_cx,
            'q': query,
            'num': 10
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get('items', []):
            results.append({
                'name': item.get('title', ''),
                'description': item.get('snippet', ''),
                'link': item.get('link', ''),
                'source': item.get('link', ''),
                'source_title': item.get('title', '')
            })

        return results

    def _filter_trusted_sources(self, results: List[Dict]) -> List[Dict]:
        """Prioritize trusted fitness sources."""
        trusted_domains = [
            'pubmed.ncbi.nlm.nih.gov',
            'acsm.org',
            'nsca.com',
            'mayoclinic.org',
            'health.harvard.edu',
            'nih.gov',
            'acefitness.org',
            'nasm.org',
            'strongerbyscience.com',
            'examine.com'
        ]

        trusted = []
        other = []

        for r in results:
            link = r.get('link', '')
            is_trusted = any(domain in link for domain in trusted_domains)
            if is_trusted:
                trusted.append(r)
            else:
                other.append(r)

        # Return trusted first, then others
        return (trusted + other)[:15]

    def _get_mock_exercises(self, goal: str, fitness_level: str) -> List[Dict]:
        """Return mock exercise data when no API is available."""
        goal_lower = goal.lower()

        # Base exercises for different goals
        if "muscle" in goal_lower or "strength" in goal_lower or "gain" in goal_lower:
            exercises = [
                {
                    'name': 'Barbell Squats',
                    'description': 'Compound lower body exercise targeting quads, glutes, and hamstrings',
                    'source': 'https://strongerbyscience.com/squats',
                    'source_title': 'Stronger By Science - Squat Guide'
                },
                {
                    'name': 'Bench Press',
                    'description': 'Primary chest exercise with secondary triceps and shoulder activation',
                    'source': 'https://strongerbyscience.com/bench-press',
                    'source_title': 'Stronger By Science - Bench Press Guide'
                },
                {
                    'name': 'Deadlifts',
                    'description': 'Full body compound movement, primary posterior chain',
                    'source': 'https://strongerbyscience.com/deadlifts',
                    'source_title': 'Stronger By Science - Deadlift Guide'
                },
                {
                    'name': 'Pull-ups',
                    'description': 'Vertical pulling exercise for back and biceps',
                    'source': 'https://examine.com/supplements/pull-ups/',
                    'source_title': 'Pull-up Exercise Guide'
                },
                {
                    'name': 'Overhead Press',
                    'description': 'Compound shoulder exercise with core stabilization',
                    'source': 'https://strongerbyscience.com/overhead-press',
                    'source_title': 'Overhead Press Guide'
                },
                {
                    'name': 'Barbell Rows',
                    'description': 'Horizontal pulling exercise for back thickness',
                    'source': 'https://strongerbyscience.com/rows',
                    'source_title': 'Rowing Exercise Guide'
                }
            ]
        elif "weight" in goal_lower or "fat" in goal_lower or "loss" in goal_lower:
            exercises = [
                {
                    'name': 'Burpees',
                    'description': 'Full body cardio exercise combining squat, push-up, and jump',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/135/burpee/',
                    'source_title': 'ACE Fitness - Burpee Exercise'
                },
                {
                    'name': 'Jump Squats',
                    'description': 'Explosive lower body exercise for power and calorie burn',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/143/jump-squat/',
                    'source_title': 'ACE Fitness - Jump Squat'
                },
                {
                    'name': 'Mountain Climbers',
                    'description': 'Dynamic core and cardio exercise',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/252/mountain-climber/',
                    'source_title': 'ACE Fitness - Mountain Climbers'
                },
                {
                    'name': 'Kettlebell Swings',
                    'description': 'Explosive hip hinge movement for conditioning',
                    'source': 'https://strongerbyscience.com/kettlebell-swings',
                    'source_title': 'Kettlebell Swing Guide'
                },
                {
                    'name': 'High Knees',
                    'description': 'Cardio exercise for lower body and core',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/high-knees/',
                    'source_title': 'High Knees Exercise'
                },
                {
                    'name': 'Box Jumps',
                    'description': 'Plyometric exercise for power and leg strength',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/180/box-jump/',
                    'source_title': 'Box Jump Exercise'
                }
            ]
        elif "endurance" in goal_lower or "stamina" in goal_lower:
            exercises = [
                {
                    'name': 'Long Distance Running',
                    'description': 'Aerobic endurance training at steady pace',
                    'source': 'https://health.harvard.edu/topics/exercise-and-fitness',
                    'source_title': 'Harvard Health - Endurance Training'
                },
                {
                    'name': 'Cycling Intervals',
                    'description': 'High-intensity intervals for cardiovascular fitness',
                    'source': 'https://acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines',
                    'source_title': 'ACSM - Cycling Training'
                },
                {
                    'name': 'Swimming',
                    'description': 'Full body low-impact aerobic exercise',
                    'source': 'https://mayoclinic.org/healthy-lifestyle/fitness/in-depth/swimming/art-20048640',
                    'source_title': 'Mayo Clinic - Swimming Benefits'
                },
                {
                    'name': 'Jump Rope',
                    'description': 'High-intensity cardio for conditioning',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/jump-rope/',
                    'source_title': 'Jump Rope Training'
                },
                {
                    'name': 'Rowing Machine',
                    'description': 'Full body cardio with low impact',
                    'source': 'https://strongerbyscience.com/rowing',
                    'source_title': 'Rowing Training Guide'
                },
                {
                    'name': 'Stair Climbing',
                    'description': 'Lower body endurance and cardiovascular fitness',
                    'source': 'https://health.harvard.edu/exercise-and-fitness/stair-climbing',
                    'source_title': 'Harvard Health - Stair Climbing'
                }
            ]
        else:
            # General fitness
            exercises = [
                {
                    'name': 'Push-ups',
                    'description': 'Bodyweight upper body exercise',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/41/push-up/',
                    'source_title': 'ACE Fitness - Push-up'
                },
                {
                    'name': 'Squats',
                    'description': 'Fundamental lower body exercise',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/135/squat/',
                    'source_title': 'ACE Fitness - Squat'
                },
                {
                    'name': 'Planks',
                    'description': 'Isometric core strengthening exercise',
                    'source': 'https://health.harvard.edu/blog/planks-are-the-best-exercise-for-your-core-20200929',
                    'source_title': 'Harvard Health - Plank Benefits'
                },
                {
                    'name': 'Lunges',
                    'description': 'Unilateral lower body exercise',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/65/lunge/',
                    'source_title': 'ACE Fitness - Lunges'
                },
                {
                    'name': 'Dumbbell Rows',
                    'description': 'Back strengthening exercise',
                    'source': 'https://strongerbyscience.com/rows',
                    'source_title': 'Rowing Exercise Guide'
                },
                {
                    'name': 'Shoulder Press',
                    'description': 'Overhead pressing movement',
                    'source': 'https://acefitness.org/resources/everyone/exercise-library/38/shoulder-press/',
                    'source_title': 'Shoulder Press Guide'
                }
            ]

        return exercises

    async def research_topic(self, topic: str, context: str = "") -> List[Dict]:
        """
        General research on fitness topics.

        Args:
            topic: Topic to research
            context: Additional context for the search

        Returns:
            List of research results with title, snippet, source
        """
        query = f"{topic} fitness training {context} 2024 2025"
        logger.info(f"Researching topic: {query}")

        if self.has_search:
            try:
                if self.serper_api_key:
                    results = await self._search_serper(query)
                else:
                    results = await self._search_google(query)

                return self._filter_trusted_sources(results)
            except Exception as e:
                logger.error(f"Research failed: {e}")
                return []
        else:
            logger.info("No search API configured")
            return []
