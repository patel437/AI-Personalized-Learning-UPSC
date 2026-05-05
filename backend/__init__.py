"""
Backend Package for UPSC Learning System
"""

from flask import Flask
from .config import get_config
from .database.db_manager import DatabaseManager

__version__ = '1.0.0'
__author__ = 'UPSC Learning System Team'