#!/usr/bin/env python3
"""
Convenience script to run database seeders.

This is a wrapper around the seeder package's run_all.py script.
"""

import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import and run the seeder runner
from app.seeder.run_all import main

if __name__ == "__main__":
    main()