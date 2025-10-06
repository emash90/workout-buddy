"""
Goal Analysis Tools

Agent tools for analyzing user goals and progress.
"""

from typing import Dict, List
from datetime import datetime, timedelta


class GoalAnalysisTools:
    """Tools for analyzing and coaching towards goals."""

    def __init__(self):
        """Initialize goal analysis tools."""
        pass

    def analyze_goal_progress(self, user_id: int, goal_id: int) -> Dict:
        """
        Analyze progress towards a specific goal.

        Args:
            user_id: User's ID
            goal_id: Goal ID

        Returns:
            Detailed progress analysis
        """
        # In production, query database
        # Mock data for now
        goal = {
            "id": goal_id,
            "user_id": user_id,
            "goal_type": "steps",
            "target_value": 10000,
            "current_value": 8500,
            "progress_percentage": 85,
            "start_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "target_date": (datetime.now() + timedelta(days=60)).isoformat(),
            "status": "in_progress"
        }

        days_elapsed = 30
        days_remaining = 60
        total_days = days_elapsed + days_remaining

        # Calculate if on track
        expected_progress = (days_elapsed / total_days) * 100
        actual_progress = goal["progress_percentage"]

        on_track = actual_progress >= expected_progress * 0.9

        return {
            "goal": goal,
            "on_track": on_track,
            "expected_progress": round(expected_progress, 1),
            "actual_progress": actual_progress,
            "gap": round(actual_progress - expected_progress, 1),
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "recommendations": self._get_goal_recommendations(goal, on_track)
        }

    def _get_goal_recommendations(self, goal: Dict, on_track: bool) -> List[str]:
        """Generate recommendations based on goal progress."""
        recommendations = []

        if on_track:
            recommendations.append("✅ You're on track! Keep up the great work")
            recommendations.append(f"Maintain current activity level to reach {goal['target_value']}")
        else:
            gap = goal["target_value"] - goal["current_value"]
            recommendations.append(f"🎯 You need to increase by {gap} to reach your goal")
            recommendations.append("💪 Consider adding an extra workout or increasing intensity")
            recommendations.append("📈 Small daily improvements add up over time")

        if goal["goal_type"] == "steps":
            recommendations.append("🚶 Try: taking walking breaks every hour, parking farther away")
        elif goal["goal_type"] == "weight_loss":
            recommendations.append("🥗 Combine exercise with balanced nutrition for best results")
        elif goal["goal_type"] == "muscle_gain":
            recommendations.append("🏋️ Focus on progressive overload and adequate protein intake")

        return recommendations

    def suggest_goal_adjustments(self, goal: Dict, progress: Dict) -> Dict:
        """
        Suggest adjustments to make goal more achievable.

        Args:
            goal: Goal details
            progress: Progress analysis

        Returns:
            Suggested adjustments
        """
        suggestions = []

        # If significantly behind
        if progress["actual_progress"] < progress["expected_progress"] * 0.7:
            new_target_date = datetime.fromisoformat(goal["target_date"]) + timedelta(days=30)
            suggestions.append({
                "type": "extend_deadline",
                "description": "Consider extending your deadline by 1 month",
                "new_target_date": new_target_date.isoformat(),
                "reason": "This gives you more realistic time to reach your goal sustainably"
            })

        # If goal might be too aggressive
        if goal["target_value"] > goal["current_value"] * 1.5:
            suggestions.append({
                "type": "lower_target",
                "description": "Consider a slightly lower target",
                "suggested_target": int(goal["current_value"] * 1.3),
                "reason": "Smaller, achievable goals lead to better long-term success"
            })

        # If making good progress
        if progress["on_track"] and progress["actual_progress"] > progress["expected_progress"] * 1.2:
            suggestions.append({
                "type": "increase_target",
                "description": "You're doing great! Consider increasing your goal",
                "suggested_target": int(goal["target_value"] * 1.1),
                "reason": "You're exceeding expectations - challenge yourself more"
            })

        return {
            "has_suggestions": len(suggestions) > 0,
            "suggestions": suggestions
        }

    def calculate_goal_feasibility(
        self,
        goal_type: str,
        current_value: float,
        target_value: float,
        timeframe_days: int,
        user_fitness_level: str = "intermediate"
    ) -> Dict:
        """
        Assess if a goal is realistic and achievable.

        Args:
            goal_type: Type of goal
            current_value: Starting value
            target_value: Target value
            timeframe_days: Days to achieve goal
            user_fitness_level: User's fitness level

        Returns:
            Feasibility assessment
        """
        required_change = target_value - current_value
        daily_change_needed = required_change / timeframe_days if timeframe_days > 0 else 0

        # Define realistic daily changes by goal type
        realistic_daily_changes = {
            "steps": {
                "beginner": 500,
                "intermediate": 1000,
                "advanced": 1500
            },
            "weight_loss": {  # kg per day
                "beginner": 0.05,  # ~0.35 kg/week
                "intermediate": 0.07,  # ~0.5 kg/week
                "advanced": 0.10  # ~0.7 kg/week
            },
            "distance": {  # km per day
                "beginner": 0.5,
                "intermediate": 1.0,
                "advanced": 1.5
            }
        }

        max_realistic_daily = realistic_daily_changes.get(goal_type, {}).get(
            user_fitness_level,
            realistic_daily_changes.get(goal_type, {}).get("intermediate", 0)
        )

        is_feasible = abs(daily_change_needed) <= max_realistic_daily
        difficulty = "easy" if abs(daily_change_needed) < max_realistic_daily * 0.5 else \
                    "moderate" if is_feasible else "challenging"

        return {
            "is_feasible": is_feasible,
            "difficulty": difficulty,
            "required_daily_change": round(daily_change_needed, 2),
            "max_realistic_daily_change": max_realistic_daily,
            "recommended_timeframe_days": int(abs(required_change) / max_realistic_daily) if max_realistic_daily > 0 else timeframe_days,
            "confidence": "high" if is_feasible else "medium",
            "notes": self._get_feasibility_notes(is_feasible, difficulty)
        }

    def _get_feasibility_notes(self, is_feasible: bool, difficulty: str) -> List[str]:
        """Get notes about goal feasibility."""
        if not is_feasible:
            return [
                "⚠️ This goal might be too aggressive for the timeframe",
                "Consider extending the deadline or adjusting the target",
                "Sustainable progress is better than burnout"
            ]
        elif difficulty == "easy":
            return [
                "✅ This goal is very achievable",
                "Consider challenging yourself more if you'd like",
                "You have room to push harder"
            ]
        else:
            return [
                "🎯 This is a realistic and challenging goal",
                "Stay consistent and you'll reach it",
                "Break it down into weekly milestones"
            ]

    def generate_milestones(self, goal: Dict) -> List[Dict]:
        """
        Generate milestones for a goal.

        Args:
            goal: Goal details

        Returns:
            List of milestone dictionaries
        """
        start_date = datetime.fromisoformat(goal["start_date"])
        target_date = datetime.fromisoformat(goal["target_date"])
        total_days = (target_date - start_date).days

        current_value = goal["current_value"]
        target_value = goal["target_value"]
        total_change = target_value - current_value

        # Create 4-5 milestones
        num_milestones = min(5, max(3, total_days // 14))  # Every ~2 weeks
        milestones = []

        for i in range(1, num_milestones + 1):
            progress_percentage = (i / num_milestones) * 100
            milestone_value = current_value + (total_change * (i / num_milestones))
            milestone_date = start_date + timedelta(days=(total_days * i // num_milestones))

            milestones.append({
                "number": i,
                "target_value": round(milestone_value, 1),
                "target_date": milestone_date.isoformat(),
                "progress_percentage": round(progress_percentage, 1),
                "description": f"Reach {milestone_value:.0f} by {milestone_date.strftime('%B %d')}"
            })

        return milestones
