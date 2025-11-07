"""
db.py - Database connection utilities for AirQ backend
"""
import mysql.connector

def get_db_connection():
    """Create and return a new MySQL database connection."""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # Change as needed
        database="db_airq"  # Change as needed
    )
