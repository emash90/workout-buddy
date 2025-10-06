"""
Fitness Analyzer Service

Analyzes user fitness data to generate insights, identify patterns,
and provide data-driven recommendations.
"""

from typing import List, Dict, Optional
import statistics
from datetime import datetime, timedelta


class FitnessAnalyzer:
    """Analyze fitness data and generate insights."""

    def analyze_patterns(self, daily_data: List[Dict]) -> Dict:
        """
        Analyze patterns in daily fitness data.

        Args:
            daily_data: List of daily fitness records

        Returns:
            Dictionary with trends, patterns, and recommendations
        """
        if not daily_data:
            return {
                "trends": [],
                "patterns": [],
                "recommendations": [],
                "stats": {}
            }

        # Extract step data
        steps = [d['steps'] for d in daily_data if d.get('steps')]

        if not steps:
            return {
                "trends": ["No step data available"],
                "patterns": [],
                "recommendations": ["Start tracking your daily steps"],
                "stats": {}
            }

        # Calculate statistics
        avg_steps = statistics.mean(steps)
        median_steps = statistics.median(steps)
        stdev_steps = statistics.stdev(steps) if len(steps) > 1 else 0
        min_steps = min(steps)
        max_steps = max(steps)

        trends = []
        patterns = []
        recommendations = []

        # Trend: Overall activity level
        if avg_steps >= 12000:
            trends.append("🔥 Excellent activity level - exceeding recommended daily steps")
        elif avg_steps >= 10000:
            trends.append("✅ Great activity level - consistently meeting 10k daily steps")
        elif avg_steps >= 7500:
            trends.append("👍 Good activity level - close to recommended 10k daily steps")
        else:
            trends.append(f"📊 Activity level below recommended - averaging {int(avg_steps):,} steps/day")

        # Pattern: Consistency
        consistency_score = 100 - min((stdev_steps / avg_steps * 100) if avg_steps > 0 else 100, 100)

        if consistency_score >= 80:
            patterns.append(f"⭐ High consistency ({consistency_score:.0f}%) - your activity is very predictable")
        elif consistency_score >= 60:
            patterns.append(f"📈 Moderate consistency ({consistency_score:.0f}%) - fairly regular activity")
        else:
            patterns.append(f"📉 Variable activity ({consistency_score:.0f}%) - try to be more consistent")

        # Pattern: Range analysis
        step_range = max_steps - min_steps
        if step_range > 8000:
            patterns.append(f"📊 Wide variation in daily steps ({min_steps:,} - {max_steps:,})")
        else:
            patterns.append(f"📊 Steady daily steps ({min_steps:,} - {max_steps:,})")

        # Recommendations based on data
        if avg_steps < 10000:
            deficit = int(10000 - avg_steps)
            recommendations.append(f"💪 Add {deficit:,} daily steps to reach recommended goal")
            recommendations.append("💡 Try: parking farther away, taking stairs, or short walks after meals")

        if stdev_steps > 3000:
            recommendations.append("🎯 Work on consistency - aim for similar step counts each day")
            recommendations.append("📅 Set a daily step goal and track it throughout the day")

        if median_steps > avg_steps * 1.2:
            recommendations.append("⚠️ Some very low activity days detected - try to maintain baseline activity")

        # Check for improvement trend
        if len(steps) >= 7:
            first_half = steps[:len(steps)//2]
            second_half = steps[len(steps)//2:]

            first_avg = statistics.mean(first_half)
            second_avg = statistics.mean(second_half)

            if second_avg > first_avg * 1.1:
                improvement = ((second_avg / first_avg) - 1) * 100
                trends.append(f"📈 Positive trend: Activity increased {improvement:.1f}% over the period")
            elif second_avg < first_avg * 0.9:
                decline = (1 - (second_avg / first_avg)) * 100
                if decline > 10:
                    trends.append(f"📉 Activity declined {decline:.1f}% - let's get back on track")

        # Activity streaks
        active_days = sum(1 for s in steps if s >= 10000)
        if len(steps) >= 7:
            streak_percentage = (active_days / len(steps)) * 100
            if streak_percentage >= 80:
                patterns.append(f"🔥 Strong streak: {active_days}/{len(steps)} days hit 10k goal ({streak_percentage:.0f}%)")

        return {
            "trends": trends,
            "patterns": patterns,
            "recommendations": recommendations,
            "stats": {
                "average": int(avg_steps),
                "median": int(median_steps),
                "min": int(min_steps),
                "max": int(max_steps),
                "std_dev": int(stdev_steps),
                "consistency": round(consistency_score, 1),
                "days_analyzed": len(steps),
                "days_hit_goal": active_days
            }
        }

    def generate_insights(self, daily_data: List[Dict], goals: List[Dict]) -> List[str]:
        """
        Generate human-readable insights from fitness data.

        Args:
            daily_data: List of daily fitness records
            goals: List of user goals

        Returns:
            List of insight strings
        """
        insights = []

        if not daily_data:
            return ["Start tracking your fitness data to get personalized insights!"]

        # Analyze activity patterns
        analysis = self.analyze_patterns(daily_data)

        # Add top insights from analysis
        insights.extend(analysis['trends'][:2])
        insights.extend(analysis['patterns'][:1])

        # Goal progress insights
        for goal in goals[:2]:  # Top 2 goals
            progress = goal.get('progress', 0)
            goal_type = goal.get('type', 'unknown').replace('_', ' ').title()

            if progress >= 90:
                insights.append(f"🎉 Almost there! {progress}% towards your {goal_type} goal")
            elif progress >= 75:
                insights.append(f"🎯 Great progress: {progress}% towards your {goal_type} goal")
            elif progress >= 50:
                insights.append(f"📊 Halfway to your {goal_type} goal ({progress}%)")
            elif progress < 25:
                insights.append(f"💪 Let's focus on {goal_type} - currently at {progress}%")

        # Add top recommendation
        if analysis['recommendations']:
            insights.append(analysis['recommendations'][0])

        # Analyze calorie trends if available
        calories = [d.get('calories', 0) for d in daily_data if d.get('calories')]
        if calories:
            avg_calories = statistics.mean(calories)
            if avg_calories > 2500:
                insights.append(f"🔥 High calorie burn: averaging {int(avg_calories)} calories/day")

        # Analyze distance if available
        distances = [d.get('distance', 0) for d in daily_data if d.get('distance')]
        if distances:
            total_distance = sum(distances)
            if total_distance > 50:  # km
                insights.append(f"🏃 Great distance covered: {total_distance:.1f}km total")

        return insights[:5]  # Return top 5 insights

    def calculate_fitness_level(self, summary: Dict) -> str:
        """
        Determine user's fitness level based on activity data.

        Args:
            summary: Fitness summary with avg_steps, total_active_minutes, etc.

        Returns:
            Fitness level: 'beginner', 'intermediate', or 'advanced'
        """
        avg_steps = summary.get('avg_steps', 0)
        active_minutes = summary.get('total_active_minutes', 0)

        # Advanced: High steps AND high active minutes
        if avg_steps >= 12000 and active_minutes >= 250:
            return "advanced"
        elif avg_steps >= 10000 and active_minutes >= 200:
            return "advanced"

        # Intermediate: Decent steps OR good active minutes
        elif avg_steps >= 8500 and active_minutes >= 150:
            return "intermediate"
        elif avg_steps >= 7500 and active_minutes >= 120:
            return "intermediate"

        # Beginner: Below intermediate thresholds
        else:
            return "beginner"

    def get_fitness_level_description(self, level: str) -> str:
        """Get description for fitness level."""
        descriptions = {
            "beginner": "You're building your fitness foundation. Focus on consistency and gradual progression.",
            "intermediate": "You have a solid fitness base. Ready for more challenging workouts and progressive overload.",
            "advanced": "You're in great shape! Maintain your level with varied, challenging workouts."
        }
        return descriptions.get(level, "")

    def calculate_weekly_streak(self, daily_data: List[Dict], goal_steps: int = 10000) -> Dict:
        """
        Calculate current streak of days hitting step goal.

        Args:
            daily_data: List of daily fitness records (should be sorted by date DESC)
            goal_steps: Daily step goal (default: 10,000)

        Returns:
            Dictionary with current streak, best streak, and streak info
        """
        if not daily_data:
            return {
                "current_streak": 0,
                "best_streak": 0,
                "days_hit_goal": 0,
                "total_days": 0,
                "percentage": 0
            }

        # Sort by date descending (most recent first)
        sorted_data = sorted(daily_data, key=lambda x: x['date'], reverse=True)

        # Calculate current streak (consecutive days from most recent)
        current_streak = 0
        for record in sorted_data:
            if record.get('steps', 0) >= goal_steps:
                current_streak += 1
            else:
                break

        # Calculate best streak and total days hit goal
        best_streak = 0
        temp_streak = 0
        days_hit_goal = 0

        for record in sorted_data:
            if record.get('steps', 0) >= goal_steps:
                temp_streak += 1
                days_hit_goal += 1
                best_streak = max(best_streak, temp_streak)
            else:
                temp_streak = 0

        total_days = len(sorted_data)
        percentage = (days_hit_goal / total_days * 100) if total_days > 0 else 0

        return {
            "current_streak": current_streak,
            "best_streak": best_streak,
            "days_hit_goal": days_hit_goal,
            "total_days": total_days,
            "percentage": round(percentage, 1)
        }

    def identify_best_day(self, daily_data: List[Dict]) -> Optional[str]:
        """
        Identify the day of the week with best activity.

        Args:
            daily_data: List of daily fitness records

        Returns:
            Day name (e.g., "Monday") or None
        """
        if not daily_data:
            return None

        from collections import defaultdict

        day_stats = defaultdict(list)

        for record in daily_data:
            if 'date' in record and 'steps' in record:
                date = datetime.fromisoformat(record['date'])
                day_name = date.strftime('%A')
                day_stats[day_name].append(record['steps'])

        if not day_stats:
            return None

        # Calculate average steps per day
        day_averages = {
            day: statistics.mean(steps)
            for day, steps in day_stats.items()
        }

        # Find best day
        best_day = max(day_averages.items(), key=lambda x: x[1])

        return best_day[0]

    def get_daily_motivation(self, streak: int = 0) -> str:
        """
        Get motivational message based on streak.

        Args:
            streak: Current streak in days

        Returns:
            Motivational message
        """
        if streak >= 30:
            return "🏆 Incredible 30-day streak! You're unstoppable!"
        elif streak >= 14:
            return "🔥 Two weeks strong! Keep the momentum going!"
        elif streak >= 7:
            return "⭐ One week streak! You're building great habits!"
        elif streak >= 3:
            return "💪 Nice streak! Every day counts!"
        elif streak >= 1:
            return "✨ Great start! Let's build on this!"
        else:
            return "🎯 Today is a new day - let's crush it!"
