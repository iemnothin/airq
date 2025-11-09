# Production
import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="abiila_admin",
        password="2bGBTWV7@y#bnPH",
        database="abiila_airq_db"
    )

# Local
# import mysql.connector

# def get_db_connection():
#     return mysql.connector.connect(
#         host="localhost",
#         user="root",
#         password="",
#         database="db_airq"
#     )