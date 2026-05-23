import sqlite3
import os

db_path = "db.sqlite3"
conn = sqlite3.connect(db_path)
conn.execute("PRAGMA foreign_keys = OFF")
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Drop all tables
for table in tables:
    try:
        cursor.execute(f"DROP TABLE IF EXISTS [{table[0]}]")
    except:
        pass
    
conn.execute("PRAGMA foreign_keys = ON")
conn.commit()
conn.close()
print(f"Dropped {len(tables)} tables from database")


