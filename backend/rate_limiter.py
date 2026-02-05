from collections import defaultdict
from datetime import datetime, timedelta
import logging
from config import Config

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.user_messages = defaultdict(list)  # user_id -> list of timestamps
    
    def is_allowed(self, user_id: str) -> tuple[bool, str]:
        """Check if user is allowed to send a message"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=Config.RATE_LIMIT_WINDOW)
        
        # Clean old timestamps
        self.user_messages[user_id] = [
            ts for ts in self.user_messages[user_id] 
            if ts > window_start
        ]
        
        # Check rate limit
        if len(self.user_messages[user_id]) >= Config.RATE_LIMIT_MESSAGES:
            remaining = Config.RATE_LIMIT_WINDOW - (now - self.user_messages[user_id][0]).total_seconds()
            return False, f"Rate limit exceeded. Please wait {int(remaining)} seconds."
        
        # Record this message
        self.user_messages[user_id].append(now)
        return True, "OK"
    
    def reset(self, user_id: str):
        """Reset rate limit for a user"""
        if user_id in self.user_messages:
            del self.user_messages[user_id]

# Global rate limiter instance
rate_limiter = RateLimiter()

