import secrets
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def generate_token() -> str:
    """Generate a simple session token"""
    return secrets.token_urlsafe(32)

def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat()

def validate_username(username: str) -> bool:
    """Validate username format"""
    if not username or len(username.strip()) == 0:
        return False
    if len(username) > 50:
        return False
    # Allow alphanumeric, spaces, underscores, hyphens
    return all(c.isalnum() or c in [' ', '_', '-'] for c in username)

def validate_room_name(room_name: str) -> bool:
    """Validate room name format"""
    if not room_name or len(room_name.strip()) == 0:
        return False
    if len(room_name) > 50:
        return False
    return True

