from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from bson import ObjectId
import json
from typing import Optional, List, Dict, Any

# Load environment variables
load_dotenv()

# Get MongoDB connection string from environment variables
# Default to a local MongoDB instance if not provided
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "ai_debugger_db")

# Create a MongoDB client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
users_collection = db.users
history_collection = db.code_history

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle MongoDB ObjectIds and dates"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

def object_id_to_str(obj_id):
    """Convert ObjectId to string"""
    if isinstance(obj_id, ObjectId):
        return str(obj_id)
    return obj_id

# User Operations
async def get_user_by_email(email: str):
    """Get a user by email"""
    user = users_collection.find_one({"email": email})
    if user:
        user["_id"] = object_id_to_str(user["_id"])
    return user

async def get_user_by_id(user_id: str):
    """Get a user by ID"""
    if not ObjectId.is_valid(user_id):
        return None
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = object_id_to_str(user["_id"])
    return user

async def create_user(user_data: Dict[str, Any]):
    """Create a new user"""
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    result = users_collection.insert_one(user_data)
    return await get_user_by_id(str(result.inserted_id))

async def update_user_profile(user_id: str, profile_data: Dict[str, Any]):
    """Update user profile"""
    if not ObjectId.is_valid(user_id):
        return None
    
    profile_data["updated_at"] = datetime.utcnow()
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": profile_data}
    )
    return await get_user_by_id(user_id)

# Code History Operations
async def save_code_history(user_id: str, code_data: Dict[str, Any]):
    """Save code execution history"""
    if not ObjectId.is_valid(user_id):
        return None
    
    history_entry = {
        "user_id": ObjectId(user_id),
        "timestamp": datetime.utcnow(),
        **code_data
    }
    
    result = history_collection.insert_one(history_entry)
    return str(result.inserted_id)

async def get_user_history(user_id: str, limit: int = 20):
    """Get user's code execution history"""
    if not ObjectId.is_valid(user_id):
        return []
    
    cursor = history_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("timestamp", -1).limit(limit)
    
    history = []
    for item in cursor:
        item["_id"] = object_id_to_str(item["_id"])
        item["user_id"] = object_id_to_str(item["user_id"])
        history.append(item)
    
    return history