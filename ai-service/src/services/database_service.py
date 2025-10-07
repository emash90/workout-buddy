"""
Database Service

Service for querying fitness data from PostgreSQL database.
"""

import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncpg
from ..utils.logger import logger


class DatabaseService:
    """Service for database operations."""

    def __init__(self):
        """Initialize database service."""
        self.pool = None
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
    ) -> List[Dict]:
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
                date,
                steps,
                distance,
                calories_burned as calories,
                active_minutes,
                floors_climbed,
                very_active_minutes,
                fairly_active_minutes,
                lightly_active_minutes,
                resting_heart_rate
            FROM fitness_data
            WHERE user_id = $1
                AND date >= $2
                AND date <= $3
            ORDER BY date DESC
        """

        try:
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
                        "floors": row["floors_climbed"] or 0,
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
    ) -> Dict:
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
                AVG(steps) as avg_steps,
                SUM(distance) as total_distance,
                SUM(calories_burned) as total_calories,
                SUM(active_minutes) as total_active_minutes,
                AVG(resting_heart_rate) as avg_heart_rate,
                SUM(floors_climbed) as floors_climbed,
                COUNT(CASE WHEN steps >= 5000 THEN 1 END) as days_active
            FROM fitness_data
            WHERE user_id = $1
                AND date >= $2
                AND date <= $3
        """

        try:
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

    async def get_user_goals(self, user_id: str) -> List[Dict]:
        """
        Get user's active goals.

        Args:
            user_id: User's ID

        Returns:
            List of goals with progress
        """
        if not self.pool:
            await self.connect()

        query = """
            SELECT
                id,
                type as goal_type,
                target_value,
                current_value,
                start_date,
                target_date,
                status,
                created_at
            FROM goals
            WHERE user_id = $1
                AND status = 'active'
            ORDER BY created_at DESC
        """

        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, user_id)

                return [
                    {
                        "id": row["id"],
                        "goal_type": row["goal_type"],
                        "target_value": float(row["target_value"]),
                        "current_value": float(row["current_value"] or 0),
                        "progress_percentage": int((float(row["current_value"] or 0) / float(row["target_value"])) * 100) if row["target_value"] > 0 else 0,
                        "status": row["status"],
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                        "target_date": row["target_date"].isoformat() if row["target_date"] else None,
                        "start_date": row["start_date"].isoformat() if row["start_date"] else None
                    }
                    for row in rows
                ]

        except Exception as e:
            logger.error(f"Error fetching goals: {e}")
            return []

    async def get_today_fitness_data(self, user_id: str) -> Optional[Dict]:
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
                steps,
                distance,
                calories_burned as calories,
                active_minutes,
                floors_climbed,
                resting_heart_rate
            FROM fitness_data
            WHERE user_id = $1
                AND date = $2
        """

        try:
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
                    "floors": row["floors_climbed"] or 0,
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
