"""
Fitness Coach Agent

Main AI agent powered by Google Gemini for fitness coaching.
"""

import os
import json
from typing import Dict, List, Optional
import google.generativeai as genai

from .tools.fitness_data_tools import FitnessDataTools
from .tools.research_tools import ResearchTools
from .tools.workout_generator_tools import WorkoutGeneratorTools
from .tools.goal_analysis_tools import GoalAnalysisTools
from .tools.insights_tools import InsightsTools
from .prompts.system_prompt import get_system_prompt
from ..utils.logger import logger


class FitnessCoachAgent:
    """AI Fitness Coach powered by Google Gemini."""

    def __init__(self):
        """Initialize the fitness coach agent."""
        # Configure Google Gemini
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.warning("GOOGLE_API_KEY not found - agent will use mock responses")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name='gemini-pro',
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 2048,
                }
            )

        # Initialize tools
        self.fitness_tools = FitnessDataTools()
        self.research_tools = ResearchTools()
        self.workout_tools = WorkoutGeneratorTools()
        self.goal_tools = GoalAnalysisTools()
        self.insights_tools = InsightsTools()

        logger.info("Fitness Coach Agent initialized")

    async def chat(
        self,
        user_id: int,
        message: str,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Process user message and generate response.

        Args:
            user_id: User's ID
            message: User's message
            conversation_history: Previous messages

        Returns:
            Dictionary with response and metadata
        """
        try:
            # Build context with user data
            context = await self._build_context(user_id, message)

            # Build conversation prompt
            prompt = self._build_prompt(message, context, conversation_history)

            # Generate response
            if self.model:
                response = await self._generate_with_gemini(prompt)
            else:
                response = self._generate_mock_response(message, context)

            return {
                "message": response["text"],
                "sources": response.get("sources", []),
                "tools_used": response.get("tools_used", []),
                "user_id": user_id
            }

        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {
                "message": "I'm having trouble right now. Please try again in a moment.",
                "sources": [],
                "tools_used": [],
                "error": str(e)
            }

    async def generate_insights(
        self,
        user_id: int,
        period: str = "week"
    ) -> Dict:
        """
        Generate personalized insights for user.

        Args:
            user_id: User's ID
            period: Time period ("week", "month", "year")

        Returns:
            Dictionary with insights
        """
        try:
            # Get user's fitness data
            summary = self.fitness_tools.get_fitness_summary(user_id, period)
            daily_data = self.fitness_tools.get_daily_data(user_id, 30)
            goals = self.fitness_tools.get_goal_progress(user_id)

            # Generate insights using tools
            insights = self.insights_tools.generate_insights(
                user_id=user_id,
                daily_data=daily_data,
                goals=goals,
                days=30
            )

            return insights

        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return {
                "error": str(e),
                "insights": ["Unable to generate insights at this time"],
                "patterns": {}
            }

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
        Generate a personalized workout plan.

        Args:
            user_id: User's ID
            goal: Primary fitness goal
            duration_weeks: Plan duration
            days_per_week: Training frequency
            equipment: Available equipment
            limitations: Physical limitations

        Returns:
            Complete workout plan
        """
        try:
            plan = await self.workout_tools.create_workout_plan(
                user_id=user_id,
                goal=goal,
                duration_weeks=duration_weeks,
                days_per_week=days_per_week,
                equipment=equipment,
                limitations=limitations
            )

            return plan

        except Exception as e:
            logger.error(f"Error generating workout plan: {e}")
            return {
                "error": str(e),
                "message": "Unable to generate workout plan at this time"
            }

    async def _build_context(self, user_id: int, message: str) -> Dict:
        """
        Build context about user for the agent.

        Args:
            user_id: User's ID
            message: User's message

        Returns:
            Context dictionary
        """
        context = {}

        # Determine what data is relevant based on message
        message_lower = message.lower()

        # Always get basic summary
        context["fitness_summary"] = self.fitness_tools.get_fitness_summary(user_id, "week")

        # Get goals if mentioned
        if any(word in message_lower for word in ["goal", "progress", "achieve", "target"]):
            context["goals"] = self.fitness_tools.get_goal_progress(user_id)

        # Get daily data for trends
        if any(word in message_lower for word in ["trend", "pattern", "improve", "week", "month"]):
            context["daily_data"] = self.fitness_tools.get_daily_data(user_id, 30)
            context["trends"] = self.fitness_tools.get_activity_trends(user_id, 30)

        # Get weekly breakdown
        if any(word in message_lower for word in ["day", "monday", "tuesday", "weekend"]):
            context["weekly_breakdown"] = self.fitness_tools.get_weekly_breakdown(user_id)

        return context

    def _build_prompt(
        self,
        message: str,
        context: Dict,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Build prompt for Gemini including context.

        Args:
            message: User's message
            context: User context data
            conversation_history: Previous messages

        Returns:
            Complete prompt string
        """
        system_prompt = get_system_prompt()

        # Build context section
        context_section = "\n\n## User Context\n\n"

        if "fitness_summary" in context:
            summary = context["fitness_summary"]
            context_section += f"""
**Recent Activity ({summary['period_label']})**:
- Average Steps: {summary['avg_steps']:,}/day
- Total Distance: {summary['total_distance_km']:.1f} km
- Total Calories: {summary['total_calories']:,}
- Active Minutes: {summary['total_active_minutes']}
- Days Active: {summary['days_active']}/{summary['total_days']}
"""

        if "goals" in context:
            context_section += "\n**Goals**:\n"
            for goal in context["goals"]:
                context_section += f"- {goal['goal_type']}: {goal['current_value']}/{goal['target_value']} ({goal['progress_percentage']}%)\n"

        if "trends" in context:
            trends = context["trends"]
            context_section += f"\n**Activity Trend**: {trends['trend'].capitalize()} ({trends['change_percentage']:+.1f}%)\n"

        # Build conversation history
        history_section = ""
        if conversation_history and len(conversation_history) > 0:
            history_section = "\n\n## Conversation History\n\n"
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = "User" if msg["role"] == "user" else "Assistant"
                history_section += f"**{role}**: {msg['content']}\n\n"

        # Combine all sections
        full_prompt = f"""{system_prompt}

{context_section}

{history_section}

## Current User Message

{message}

## Your Response

Provide a helpful, personalized response based on the user's data and context above. Use specific numbers from their data when relevant. Be supportive and actionable.
"""

        return full_prompt

    async def _generate_with_gemini(self, prompt: str) -> Dict:
        """
        Generate response using Gemini.

        Args:
            prompt: Complete prompt

        Returns:
            Response dictionary
        """
        try:
            response = self.model.generate_content(prompt)

            return {
                "text": response.text,
                "sources": [],  # Would extract from response if included
                "tools_used": []
            }

        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return {
                "text": "I'm having trouble processing your request right now. Please try again.",
                "sources": [],
                "tools_used": [],
                "error": str(e)
            }

    def _generate_mock_response(self, message: str, context: Dict) -> Dict:
        """
        Generate mock response when API key is not available.

        Args:
            message: User message
            context: Context data

        Returns:
            Mock response dictionary
        """
        message_lower = message.lower()

        # Simple keyword-based responses
        if "how am i doing" in message_lower or "progress" in message_lower:
            summary = context.get("fitness_summary", {})
            response = f"""Looking at your recent activity, here's how you're doing:

📊 **This Week's Stats**:
- Average Steps: {summary.get('avg_steps', 0):,}/day
- You've been active {summary.get('days_active', 0)} out of {summary.get('total_days', 7)} days

You're making progress! Keep up the consistent effort. 🎯
"""
        elif "workout" in message_lower or "exercise" in message_lower:
            response = """I can help you with workout recommendations! Tell me:

1. What's your main goal? (muscle gain, weight loss, endurance, etc.)
2. How many days per week can you train?
3. What equipment do you have access to?

I'll create a personalized plan for you! 💪
"""
        elif "goal" in message_lower:
            response = """Let's work on your fitness goals! 🎯

I can help you:
- Set realistic, achievable goals
- Track your progress
- Adjust your plan as needed
- Stay motivated

What specific goal would you like to focus on?
"""
        else:
            response = """I'm your AI fitness coach! I can help you with:

- 📊 Analyzing your fitness data and progress
- 💪 Creating personalized workout plans
- 🎯 Setting and tracking goals
- 📈 Providing insights and recommendations

What would you like to work on today?
"""

        return {
            "text": response,
            "sources": [],
            "tools_used": ["mock_response"]
        }
