"""
Database Service

Service for querying fitness data from PostgreSQL database.
"""

import os
from typing import List, Dict, Optional, Any
from datetime import datetime
import asyncpg  # type: ignore
from ..utils.logger import logger


class DatabaseService:
    """Service for database operations."""

    def __init__(self):
        """Initialize database service."""
        self.pool: Optional[asyncpg.Pool] = None
        self.database_url = os.getenv("DATABASE_URL")

        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")

    async def connect(self):
        """Create database connection pool."""
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    self.database_url,
                    min_size=1,
                    max_size=10,
                    command_timeout=60
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to create database pool: {e}")
                raise

    async def close(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    async def get_user_fitness_data(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get user's fitness data for date range.

        Args:
            user_id: User's ID (UUID string)
            start_date: Start date
            end_date: End date

        Returns:
            List of daily fitness records
        """
        if not self.pool:
            await self.connect()

        query = """
            SELECT
                a.date,
                a.steps,
                a.distance,
                a.calories,
                a."activeMinutes" as active_minutes,
                a.floors,
                a."veryActiveMinutes" as very_active_minutes,
                a."fairlyActiveMinutes" as fairly_active_minutes,
                a."lightlyActiveMinutes" as lightly_active_minutes,
                COALESCE(h."restingHeartRate", 0) as resting_heart_rate
            FROM activity_data a
            LEFT JOIN heart_rate_data h ON a."userId" = h."userId" AND a.date = h.date
            WHERE a."userId" = $1
                AND a.date >= $2
                AND a.date <= $3
            ORDER BY a.date DESC
        """

        try:
            assert self.pool is not None
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(
                    query,
                    user_id,
                    start_date.date(),
                    end_date.date()
                )

                return [
                    {
                        "date": row["date"].isoformat(),
                        "steps": row["steps"] or 0,
                        "distance": float(row["distance"] or 0),
                        "calories": row["calories"] or 0,
                        "active_minutes": row["active_minutes"] or 0,
                        "floors": row["floors"] or 0,
                        "heart_rate_avg": row["resting_heart_rate"] or 0,
                        "very_active_minutes": row["very_active_minutes"] or 0,
                        "fairly_active_minutes": row["fairly_active_minutes"] or 0,
                        "lightly_active_minutes": row["lightly_active_minutes"] or 0
                    }
                    for row in rows
                ]

        except Exception as e:
            logger.error(f"Error fetching fitness data: {e}")
            return []

    async def get_fitness_summary(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        Get aggregated fitness summary for period.

        Args:
            user_id: User's ID
            start_date: Start date
            end_date: End date

        Returns:
            Summary dictionary
        """
        if not self.pool:
            await self.connect()

        query = """
            SELECT
                COUNT(*) as total_days,
                AVG(a.steps) as avg_steps,
                SUM(a.distance) as total_distance,
                SUM(a.calories) as total_calories,
                SUM(a."activeMinutes") as total_active_minutes,
                AVG(h."restingHeartRate") as avg_heart_rate,
                SUM(a.floors) as floors_climbed,
                COUNT(CASE WHEN a.steps >= 5000 THEN 1 END) as days_active
            FROM activity_data a
            LEFT JOIN heart_rate_data h ON a."userId" = h."userId" AND a.date = h.date
            WHERE a."userId" = $1
                AND a.date >= $2
                AND a.date <= $3
        """

        try:
            assert self.pool is not None
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    query,
                    user_id,
                    start_date.date(),
                    end_date.date()
                )

                if not row or row["total_days"] == 0:
                    return None

                total_days = row["total_days"]
                days_active = row["days_active"] or 0

                return {
                    "avg_steps": int(row["avg_steps"] or 0),
                    "total_distance_km": float(row["total_distance"] or 0),
                    "total_calories": int(row["total_calories"] or 0),
                    "total_active_minutes": int(row["total_active_minutes"] or 0),
                    "avg_heart_rate": int(row["avg_heart_rate"] or 0),
                    "floors_climbed": int(row["floors_climbed"] or 0),
                    "days_active": days_active,
                    "total_days": total_days,
                    "activity_percentage": round((days_active / total_days) * 100, 1) if total_days > 0 else 0
                }

        except Exception as e:
            logger.error(f"Error fetching fitness summary: {e}")
            return None

    async def get_user_goals(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get user's fitness goals and targets.

        Args:
            user_id: User's ID

        Returns:
            List with user's goals (typically one record)
        """
        if not self.pool:
            await self.connect()

        query = """
            SELECT
                id,
                "fitnessGoal" as fitness_goal,
                "currentWeight" as current_weight,
                "targetWeight" as target_weight,
                height,
                "currentBMI" as current_bmi,
                "idealBMI" as ideal_bmi,
                age,
                gender,
                "activityLevel" as activity_level,
                "dailyStepsGoal" as daily_steps_goal,
                "dailyCaloriesBurnGoal" as daily_calories_burn_goal,
                "dailyActiveMinutesGoal" as daily_active_minutes_goal,
                "dailySleepHoursGoal" as daily_sleep_hours_goal,
                "weeklyWorkoutsGoal" as weekly_workouts_goal,
                "aiRecommendationsEnabled" as ai_recommendations_enabled,
                "aiRecommendations" as ai_recommendations,
                "createdAt" as created_at,
                "updatedAt" as updated_at
            FROM user_goals
            WHERE user_id = $1
            ORDER BY "updatedAt" DESC
            LIMIT 1
        """

        try:
            assert self.pool is not None
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, user_id)

                return [
                    {
                        "id": row["id"],
                        "fitness_goal": row["fitness_goal"],
                        "current_weight": float(row["current_weight"]) if row["current_weight"] else None,
                        "target_weight": float(row["target_weight"]) if row["target_weight"] else None,
                        "height": float(row["height"]) if row["height"] else None,
                        "current_bmi": float(row["current_bmi"]) if row["current_bmi"] else None,
                        "ideal_bmi": float(row["ideal_bmi"]) if row["ideal_bmi"] else None,
                        "age": row["age"],
                        "gender": row["gender"],
                        "activity_level": row["activity_level"],
                        "daily_steps_goal": row["daily_steps_goal"],
                        "daily_calories_burn_goal": row["daily_calories_burn_goal"],
                        "daily_active_minutes_goal": row["daily_active_minutes_goal"],
                        "daily_sleep_hours_goal": float(row["daily_sleep_hours_goal"]) if row["daily_sleep_hours_goal"] else None,
                        "weekly_workouts_goal": row["weekly_workouts_goal"],
                        "ai_recommendations_enabled": row["ai_recommendations_enabled"],
                        "ai_recommendations": row["ai_recommendations"],
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                        "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None
                    }
                    for row in rows
                ]

        except Exception as e:
            logger.error(f"Error fetching goals: {e}")
            return []

    async def get_today_fitness_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get today's fitness data for user.

        Args:
            user_id: User's ID

        Returns:
            Today's fitness record or None
        """
        if not self.pool:
            await self.connect()

        query = """
            SELECT
                a.steps,
                a.distance,
                a.calories,
                a."activeMinutes" as active_minutes,
                a.floors,
                COALESCE(h."restingHeartRate", 0) as resting_heart_rate
            FROM activity_data a
            LEFT JOIN heart_rate_data h ON a."userId" = h."userId" AND a.date = h.date
            WHERE a."userId" = $1
                AND a.date = $2
        """

        try:
            assert self.pool is not None
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    query,
                    user_id,
                    datetime.now().date()
                )

                if not row:
                    return None

                return {
                    "steps": row["steps"] or 0,
                    "distance": float(row["distance"] or 0),
                    "calories": row["calories"] or 0,
                    "active_minutes": row["active_minutes"] or 0,
                    "floors": row["floors"] or 0,
                    "heart_rate": row["resting_heart_rate"] or 0
                }

        except Exception as e:
            logger.error(f"Error fetching today's data: {e}")
            return None


# Singleton instance
_db_service = None


def get_database_service() -> DatabaseService:
    """Get database service singleton."""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service
