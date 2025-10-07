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

        if not self.has_search:
            raise ValueError(
                "No search API configured. Please set SERPER_API_KEY or both "
                "GOOGLE_API_KEY and GOOGLE_SEARCH_CX environment variables "
                "to enable web research for exercises."
            )

        try:
            if self.serper_api_key:
                results = await self._search_serper(query)
            else:
                results = await self._search_google(query)

            return self._filter_trusted_sources(results)
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise ValueError(f"Failed to search for exercises: {str(e)}")

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
