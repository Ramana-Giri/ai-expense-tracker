from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    database_url: str = "sqlite:///./expense_tracker.db"
    secret_key: str = "your-secret-key-change-in-production"
    encryption_key: str = "your-encryption-key-32-chars-long"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
