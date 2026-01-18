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
import logging
from .superhero_seeder import run_seeder
from .user_seeder import run_user_seeder
from ..utils import setup_logger

def seed_superheroes():
    """Seed superhero data from Superhero API"""
    logger = setup_logger("seeder_runner", level=logging.INFO)

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
    logger = setup_logger("seeder_runner", level=logging.INFO)

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
    logger = setup_logger("seeder_runner", level=logging.INFO)

    parser = argparse.ArgumentParser(description="Database seeding script")
    parser.add_argument(
        "seeders",
        nargs="*",
        help="Specify which seeders to run: 'superhero', 'user', or 'all' (default: all)"
    )

    args = parser.parse_args()

    # If no seeders specified, run all
    if not args.seeders or len(args.seeders) == 0:
        args.seeders = ["all"]
    
    # Validate choices
    valid_choices = ["superhero", "user", "all"]
    for seeder in args.seeders:
        if seeder not in valid_choices:
            parser.error(f"Invalid choice: '{seeder}'. Choose from: {', '.join(valid_choices)}")

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