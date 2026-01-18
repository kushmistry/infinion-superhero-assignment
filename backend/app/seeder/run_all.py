#!/usr/bin/env python3
"""
Seeder runner script for the Superhero API.

This script provides multiple seeding options to populate the database.
Run this after setting up your environment variables.

Available seeders:
- superhero: Fetches and stores superhero data from Superhero API
- user: Creates admin user account

Usage:
    python -m app.seeder.run_all                    # Run all seeders
    python -m app.seeder.run_all superhero         # Run only superhero seeder
    python -m app.seeder.run_all user              # Run only user seeder
    python -m app.seeder.run_all --help           # Show help

Or from the seeder directory:
    python run_all.py                             # Run all seeders
    python run_all.py superhero                   # Run only superhero seeder
    python run_all.py user                        # Run only user seeder
"""

import sys
import argparse
from .superhero_seeder import run_seeder
from .user_seeder import run_user_seeder
from ..utils import get_logger

def seed_superheroes():
    """Seed superhero data from Superhero API"""
    logger = get_logger("seeder_runner")

    logger.info("🌟 Starting superhero database seeding...")
    logger.info("This will fetch data for 732 superheroes from the Superhero API")
    logger.info("This may take several minutes depending on your internet connection...")

    try:
        run_seeder()
        logger.info("🎉 Superhero seeding completed successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Error during superhero seeding: {e}")
        logger.error("Make sure your SUPERHERO_API_TOKEN is set in your .env file")
        return False

def seed_users():
    """Seed user data (admin account)"""
    logger = get_logger("seeder_runner")

    logger.info("🌟 Starting user seeding...")
    logger.info("This will create the admin user account")

    try:
        run_user_seeder()
        logger.info("🎉 User seeding completed successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Error during user seeding: {e}")
        return False

def main():
    logger = get_logger("seeder_runner")

    parser = argparse.ArgumentParser(description="Database seeding script")
    parser.add_argument(
        "seeders",
        nargs="*",
        choices=["superhero", "user", "all"],
        help="Specify which seeders to run (default: all available seeders)"
    )

    args = parser.parse_args()

    # If no seeders specified, run all
    if not args.seeders:
        args.seeders = ["all"]

    # Run selected seeders
    if "all" in args.seeders or "superhero" in args.seeders:
        success = seed_superheroes()
        if not success:
            sys.exit(1)

    if "all" in args.seeders or "user" in args.seeders:
        success = seed_users()
        if not success:
            sys.exit(1)

    logger.info("🎉 All selected seeders completed successfully!")

if __name__ == "__main__":
    main()