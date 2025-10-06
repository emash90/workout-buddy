#!/usr/bin/env python3
"""
Database migration script for AI service.

Runs SQL migrations to set up required tables.
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Run database migrations."""
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("   Please set DATABASE_URL in your .env file")
        sys.exit(1)

    print("🔄 Connecting to database...")

    try:
        engine = create_engine(database_url)

        # Read SQL migration file
        migration_file = Path(__file__).parent / 'create_conversations_table.sql'

        if not migration_file.exists():
            print(f"❌ Migration file not found: {migration_file}")
            sys.exit(1)

        with open(migration_file, 'r') as f:
            sql = f.read()

        print("📝 Running migrations...")

        with engine.connect() as conn:
            # Split by semicolon and execute each statement
            statements = [s.strip() for s in sql.split(';') if s.strip()]

            for i, statement in enumerate(statements, 1):
                # Skip comments and empty statements
                if statement.startswith('--') or not statement:
                    continue

                try:
                    conn.execute(text(statement))
                    print(f"   ✓ Statement {i}/{len(statements)} executed")
                except Exception as e:
                    # Some statements might fail if tables already exist
                    if "already exists" in str(e).lower():
                        print(f"   ⚠ Statement {i}: Table already exists (skipping)")
                    else:
                        print(f"   ✗ Statement {i} failed: {e}")
                        raise

            conn.commit()

        print("✅ Migrations completed successfully!")
        print("\nCreated tables:")
        print("  - conversations (AI chat history)")
        print("  - ai_insights (cached insights)")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("AI Service Database Migration")
    print("=" * 60)
    print()

    run_migration()
