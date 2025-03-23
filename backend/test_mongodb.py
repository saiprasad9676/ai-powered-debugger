"""
Test MongoDB connection script

Run this script to verify your MongoDB connection is working correctly.
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

def test_connection():
    # Get MongoDB connection string from environment variables
    mongo_uri = os.environ.get("MONGO_URI")
    db_name = os.environ.get("DB_NAME")
    
    if not mongo_uri:
        print("Error: MONGO_URI not found in environment variables.")
        print("Make sure you've created a .env file with your MongoDB connection string.")
        sys.exit(1)
    
    if not db_name:
        print("Warning: DB_NAME not found in environment variables.")
        print("Using default name 'ai_debugger_db'.")
        db_name = "ai_debugger_db"
    
    print(f"Attempting to connect to MongoDB at: {mongo_uri}")
    try:
        # Attempt connection with a 5-second timeout
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Force a connection to verify it works
        client.server_info()
        
        # Connect to the database
        db = client[db_name]
        
        # Try to list collections (will create db if it doesn't exist)
        collections = db.list_collection_names()
        
        print("✅ Successfully connected to MongoDB!")
        print(f"✅ Database '{db_name}' is ready to use.")
        
        # Create test collections if they don't exist
        if "users" not in collections:
            print("Creating 'users' collection...")
            db.create_collection("users")
            
        if "code_history" not in collections:
            print("Creating 'code_history' collection...")
            db.create_collection("code_history")
            
        print(f"Collections in database: {', '.join(db.list_collection_names())}")
        print("\nYour MongoDB setup is complete and working correctly!")
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("\nPossible issues:")
        print("1. MongoDB service is not running")
        print("2. Connection string in .env file is incorrect")
        print("3. Network connectivity issues or firewall blocking connection")
        print("4. If using MongoDB Atlas, check if your IP address is whitelisted")
        sys.exit(1)

if __name__ == "__main__":
    test_connection() 