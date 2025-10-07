"""
Fitness Data Tools

Agent tools for querying and analyzing user fitness data.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from ...services.database_service import get_database_service


class FitnessDataTools:
    """Tools for accessing user fitness data from database."""

    def __init__(self):
        """Initialize fitness data tools."""
        self.db = get_database_service()

    async def get_fitness_summary(self, user_id: str, period: str = "week") -> Dict:
        """
        Get user's fitness data summary for a period.

        Args:
            user_id: User's ID (UUID string)
            period: Time period ("week", "month", "year")

        Returns:
            Dictionary with fitness summary
        """
        # Calculate date range
        end_date = datetime.now()

        if period == "week":
            start_date = end_date - timedelta(days=7)
            period_label = "Past Week"
        elif period == "month":
            start_date = end_date - timedelta(days=30)
            period_label = "Past Month"
        elif period == "year":
            start_date = end_date - timedelta(days=365)
            period_label = "Past Year"
        else:
            start_date = end_date - timedelta(days=7)
            period_label = "Past Week"

        # Query real data from database
        summary = await self.db.get_fitness_summary(user_id, start_date, end_date)

        if not summary:
            return {
                "user_id": user_id,
                "period": period,
                "period_label": period_label,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "avg_steps": 0,
                "total_distance_km": 0,
                "total_calories": 0,
                "total_active_minutes": 0,
                "avg_heart_rate": 0,
                "floors_climbed": 0,
                "days_active": 0,
                "total_days": 0,
                "activity_percentage": 0
            }

        summary["user_id"] = user_id
        summary["period"] = period
        summary["period_label"] = period_label
        summary["start_date"] = start_date.isoformat()
        summary["end_date"] = end_date.isoformat()

        return summary

    async def get_daily_data(self, user_id: str, days: int = 30) -> List[Dict]:
        """
        Get daily fitness data for the last N days.

        Args:
            user_id: User's ID (UUID string)
            days: Number of days to retrieve

        Returns:
            List of daily data records
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # Query real data from database
        daily_data = await self.db.get_user_fitness_data(user_id, start_date, end_date)

        return daily_data

    async def get_goal_progress(self, user_id: str, goal_id: Optional[int] = None) -> List[Dict]:
        """
        Get user's goal progress.

        Args:
            user_id: User's ID (UUID string)
            goal_id: Specific goal ID (optional)

        Returns:
            List of goals with progress
        """
        # Query real goals from database
        goals = await self.db.get_user_goals(user_id)

        if goal_id:
            return [g for g in goals if g["id"] == goal_id]

        return goals

    async def get_activity_trends(self, user_id: str, days: int = 30) -> Dict:
        """
        Analyze activity trends over time.

        Args:
            user_id: User's ID (UUID string)
            days: Number of days to analyze

        Returns:
            Dictionary with trend analysis
        """
        daily_data = await self.get_daily_data(user_id, days)

        if not daily_data or len(daily_data) < 2:
            return {
                "trend": "insufficient_data",
                "change_percentage": 0,
                "average_activity": 0
            }

        # Calculate first half vs second half
        mid_point = len(daily_data) // 2
        first_half = daily_data[mid_point:]
        second_half = daily_data[:mid_point]

        first_avg = sum(d["steps"] for d in first_half) / len(first_half) if first_half else 0
        second_avg = sum(d["steps"] for d in second_half) / len(second_half) if second_half else 0

        if first_avg == 0:
            change_percentage = 0
        else:
            change_percentage = ((second_avg - first_avg) / first_avg) * 100

        if change_percentage > 10:
            trend = "increasing"
        elif change_percentage < -10:
            trend = "decreasing"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "change_percentage": round(change_percentage, 1),
            "first_half_avg": round(first_avg),
            "second_half_avg": round(second_avg),
            "overall_avg": round((first_avg + second_avg) / 2) if (first_avg + second_avg) > 0 else 0,
            "days_analyzed": days
        }

    async def get_weekly_breakdown(self, user_id: str) -> Dict:
        """
        Get breakdown of activity by day of week.

        Args:
            user_id: User's ID (UUID string)

        Returns:
            Dictionary with day-by-day averages
        """
        # Get last 4 weeks of data
        daily_data = await self.get_daily_data(user_id, 28)

        if not daily_data:
            return {
                "Monday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Tuesday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Wednesday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Thursday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Friday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Saturday": {"avg_steps": 0, "avg_active_minutes": 0},
                "Sunday": {"avg_steps": 0, "avg_active_minutes": 0},
                "best_day": "Unknown",
                "most_consistent_day": "Unknown"
            }

        from collections import defaultdict
        import statistics

        day_data = defaultdict(lambda: {"steps": [], "active_minutes": []})

        for record in daily_data:
            date = datetime.fromisoformat(record["date"])
            day_name = date.strftime("%A")
            day_data[day_name]["steps"].append(record["steps"])
            day_data[day_name]["active_minutes"].append(record["active_minutes"])

        breakdown = {}
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            if day in day_data and day_data[day]["steps"]:
                breakdown[day] = {
                    "avg_steps": int(statistics.mean(day_data[day]["steps"])),
                    "avg_active_minutes": int(statistics.mean(day_data[day]["active_minutes"]))
                }
            else:
                breakdown[day] = {"avg_steps": 0, "avg_active_minutes": 0}

        # Find best day
        best_day = max(breakdown.items(), key=lambda x: x[1]["avg_steps"])
        breakdown["best_day"] = best_day[0] if best_day[1]["avg_steps"] > 0 else "Unknown"

        # Find most consistent day (lowest std dev)
        consistency_scores = {}
        for day, data in day_data.items():
            if len(data["steps"]) > 1:
                consistency_scores[day] = statistics.stdev(data["steps"])

        if consistency_scores:
            most_consistent = min(consistency_scores.items(), key=lambda x: x[1])
            breakdown["most_consistent_day"] = most_consistent[0]
        else:
            breakdown["most_consistent_day"] = "Unknown"

        return breakdown

    async def get_today_data(self, user_id: str) -> Optional[Dict]:
        """
        Get today's fitness data.

        Args:
            user_id: User's ID (UUID string)

        Returns:
            Today's fitness record or None
        """
        return await self.db.get_today_fitness_data(user_id)
