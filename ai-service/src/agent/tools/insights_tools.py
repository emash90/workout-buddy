"""
Insights Tools

Agent tools for generating personalized fitness insights.
"""

from typing import Dict, List
from ...services.fitness_analyzer import FitnessAnalyzer
from datetime import datetime, timedelta


class InsightsTools:
    """Tools for generating insights from fitness data."""

    def __init__(self):
        """Initialize insights tools."""
        self.analyzer = FitnessAnalyzer()

    def generate_insights(
        self,
        user_id: int,
        daily_data: List[Dict],
        goals: List[Dict],
        days: int = 30
    ) -> Dict:
        """
        Generate comprehensive insights from user data.

        Args:
            user_id: User's ID
            daily_data: List of daily fitness records
            goals: List of user goals
            days: Number of days analyzed

        Returns:
            Dictionary with insights
        """
        # Use fitness analyzer to get patterns
        patterns = self.analyzer.analyze_patterns(daily_data)

        # Generate insights
        insights = self.analyzer.generate_insights(daily_data, goals)

        # Calculate streak
        streak = self.analyzer.calculate_weekly_streak(daily_data)

        # Get motivation message
        motivation = self.analyzer.get_daily_motivation(streak["current_streak"])

        return {
            "user_id": user_id,
            "period": f"Past {days} days",
            "generated_at": datetime.now().isoformat(),
            "insights": insights,
            "patterns": patterns,
            "streak": streak,
            "motivation": motivation,
            "summary": self._create_summary(patterns, streak)
        }

    def _create_summary(self, patterns: Dict, streak: Dict) -> str:
        """Create a human-readable summary."""
        stats = patterns.get("stats", {})
        avg_steps = stats.get("average", 0)
        consistency = stats.get("consistency", 0)
        current_streak = streak.get("current_streak", 0)

        summary_parts = []

        # Activity level
        if avg_steps >= 10000:
            summary_parts.append(f"You're averaging {avg_steps:,} steps daily - excellent work!")
        else:
            summary_parts.append(f"You're averaging {avg_steps:,} steps daily")

        # Consistency
        if consistency >= 80:
            summary_parts.append("Your consistency is outstanding")
        elif consistency >= 60:
            summary_parts.append("You're staying fairly consistent")

        # Streak
        if current_streak >= 7:
            summary_parts.append(f"You've maintained a {current_streak}-day streak!")
        elif current_streak >= 3:
            summary_parts.append(f"You're on a {current_streak}-day streak")

        return " ".join(summary_parts)

    def get_daily_insight(self, user_id: int, today_data: Dict, weekly_data: List[Dict]) -> Dict:
        """
        Generate insight for today based on recent activity.

        Args:
            user_id: User's ID
            today_data: Today's fitness data
            weekly_data: Past week's data

        Returns:
            Today's insight
        """
        today_steps = today_data.get("steps", 0)
        weekly_avg = sum(d.get("steps", 0) for d in weekly_data) / len(weekly_data) if weekly_data else 0

        comparison = "above" if today_steps > weekly_avg else "below"
        diff_percentage = abs((today_steps - weekly_avg) / weekly_avg * 100) if weekly_avg > 0 else 0

        insights = []

        # Compare to weekly average
        if today_steps > weekly_avg * 1.2:
            insights.append(f"🎉 Outstanding! You're {diff_percentage:.0f}% above your weekly average!")
        elif today_steps > weekly_avg:
            insights.append(f"✨ Great job! You're {comparison} your weekly average")
        elif today_steps < weekly_avg * 0.8:
            insights.append(f"📊 You're a bit below your usual pace today")
        else:
            insights.append("📈 You're tracking close to your weekly average")

        # Check if hit goal
        if today_steps >= 10000:
            insights.append("✅ You hit your 10,000 step goal today!")
        else:
            remaining = 10000 - today_steps
            insights.append(f"🎯 {remaining:,} more steps to hit your goal")

        return {
            "user_id": user_id,
            "date": datetime.now().isoformat(),
            "today_steps": today_steps,
            "weekly_average": int(weekly_avg),
            "comparison": comparison,
            "difference_percentage": round(diff_percentage, 1),
            "insights": insights,
            "motivation": self._get_daily_motivation_tip()
        }

    def _get_daily_motivation_tip(self) -> str:
        """Get a random motivation tip."""
        tips = [
            "💪 Every step counts towards your goals",
            "🌟 Consistency is the key to success",
            "🎯 Small daily improvements lead to big results",
            "🔥 You're stronger than you think",
            "✨ Make today count - you've got this!",
            "🚀 Progress, not perfection",
            "💯 Your health is worth the effort",
            "⭐ One day at a time, one step at a time"
        ]

        import random
        return random.choice(tips)

    def compare_periods(
        self,
        period1_data: List[Dict],
        period2_data: List[Dict],
        period1_label: str = "This Week",
        period2_label: str = "Last Week"
    ) -> Dict:
        """
        Compare two time periods.

        Args:
            period1_data: First period data
            period2_data: Second period data
            period1_label: Label for period 1
            period2_label: Label for period 2

        Returns:
            Comparison results
        """
        def calculate_stats(data: List[Dict]) -> Dict:
            if not data:
                return {"avg_steps": 0, "total_distance": 0, "total_calories": 0, "active_days": 0}

            avg_steps = sum(d.get("steps", 0) for d in data) / len(data)
            total_distance = sum(d.get("distance", 0) for d in data)
            total_calories = sum(d.get("calories", 0) for d in data)
            active_days = sum(1 for d in data if d.get("steps", 0) >= 5000)

            return {
                "avg_steps": int(avg_steps),
                "total_distance": round(total_distance, 1),
                "total_calories": int(total_calories),
                "active_days": active_days
            }

        stats1 = calculate_stats(period1_data)
        stats2 = calculate_stats(period2_data)

        # Calculate changes
        steps_change = ((stats1["avg_steps"] - stats2["avg_steps"]) / stats2["avg_steps"] * 100) if stats2["avg_steps"] > 0 else 0
        distance_change = ((stats1["total_distance"] - stats2["total_distance"]) / stats2["total_distance"] * 100) if stats2["total_distance"] > 0 else 0
        calories_change = ((stats1["total_calories"] - stats2["total_calories"]) / stats2["total_calories"] * 100) if stats2["total_calories"] > 0 else 0

        return {
            "period1": {
                "label": period1_label,
                "stats": stats1
            },
            "period2": {
                "label": period2_label,
                "stats": stats2
            },
            "changes": {
                "steps": {
                    "percentage": round(steps_change, 1),
                    "direction": "up" if steps_change > 0 else "down" if steps_change < 0 else "same"
                },
                "distance": {
                    "percentage": round(distance_change, 1),
                    "direction": "up" if distance_change > 0 else "down" if distance_change < 0 else "same"
                },
                "calories": {
                    "percentage": round(calories_change, 1),
                    "direction": "up" if calories_change > 0 else "down" if calories_change < 0 else "same"
                }
            },
            "summary": self._create_comparison_summary(steps_change, distance_change, calories_change)
        }

    def _create_comparison_summary(
        self,
        steps_change: float,
        distance_change: float,
        calories_change: float
    ) -> str:
        """Create summary of period comparison."""
        if steps_change > 10:
            return f"🎉 Great improvement! Your activity increased by {steps_change:.0f}% compared to last period"
        elif steps_change > 0:
            return f"📈 Slight improvement - your activity is up {steps_change:.0f}%"
        elif steps_change > -10:
            return "📊 Activity level is fairly consistent between periods"
        else:
            return f"📉 Activity decreased by {abs(steps_change):.0f}% - let's work on bringing it back up"

    def predict_goal_achievement(
        self,
        current_progress: float,
        target_value: float,
        days_elapsed: int,
        days_remaining: int,
        recent_trend: str
    ) -> Dict:
        """
        Predict likelihood of achieving a goal.

        Args:
            current_progress: Current value
            target_value: Target value
            days_elapsed: Days since goal started
            days_remaining: Days until target date
            recent_trend: "increasing", "decreasing", or "stable"

        Returns:
            Prediction dictionary
        """
        total_days = days_elapsed + days_remaining
        expected_progress_percentage = (days_elapsed / total_days) * 100 if total_days > 0 else 0
        actual_progress_percentage = (current_progress / target_value) * 100 if target_value > 0 else 0

        # Calculate daily rate needed
        remaining_progress = target_value - current_progress
        daily_rate_needed = remaining_progress / days_remaining if days_remaining > 0 else 0

        # Calculate current daily rate
        current_daily_rate = current_progress / days_elapsed if days_elapsed > 0 else 0

        # Determine likelihood
        if actual_progress_percentage >= expected_progress_percentage * 1.1 and recent_trend == "increasing":
            likelihood = "very_high"
            confidence = 90
        elif actual_progress_percentage >= expected_progress_percentage * 0.9:
            likelihood = "high"
            confidence = 75
        elif actual_progress_percentage >= expected_progress_percentage * 0.7:
            likelihood = "moderate"
            confidence = 60
        else:
            likelihood = "low"
            confidence = 40

        return {
            "likelihood": likelihood,
            "confidence_percentage": confidence,
            "current_progress_percentage": round(actual_progress_percentage, 1),
            "expected_progress_percentage": round(expected_progress_percentage, 1),
            "on_track": actual_progress_percentage >= expected_progress_percentage * 0.9,
            "daily_rate_needed": round(daily_rate_needed, 2),
            "current_daily_rate": round(current_daily_rate, 2),
            "recommendation": self._get_achievement_recommendation(likelihood, daily_rate_needed, current_daily_rate)
        }

    def _get_achievement_recommendation(
        self,
        likelihood: str,
        daily_rate_needed: float,
        current_daily_rate: float
    ) -> str:
        """Get recommendation based on achievement prediction."""
        if likelihood == "very_high":
            return "🎉 You're on an excellent track! Keep up the great work!"
        elif likelihood == "high":
            return "✅ Stay consistent and you'll reach your goal"
        elif likelihood == "moderate":
            rate_increase = daily_rate_needed - current_daily_rate
            return f"📈 Increase your daily effort by {rate_increase:.0f} to stay on track"
        else:
            return "⚠️ Consider adjusting your goal or extending the timeline for sustainable progress"
