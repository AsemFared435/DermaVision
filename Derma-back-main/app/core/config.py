"""
Application configuration using Pydantic Settings
"""
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import secrets

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # Application
    APP_NAME: str = "Skin Disease Analysis API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    
    # Database
    DATABASE_URL: str = "sqlite:///./skin_analysis.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600
    DB_ECHO: bool = False
    
    # Security - Generate default if not provided
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    AUTH_REQUIRED: bool = False  # Set to True in production
    ALLOWED_HOSTS: List[str] = ["*"]
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://frontai.vercel.app",
        "https://ai-front-beta-ashy.vercel.app"
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Email / password reset
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_USE_TLS: bool = True
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    FRONTEND_RESET_PASSWORD_URL: Optional[str] = None
    
    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png"]
    ALLOWED_IMAGE_MIME_TYPES: List[str] = ["image/jpeg", "image/png"]
    FILE_RETENTION_DAYS: int = 30
    
    # ML Model
    MODEL_PATH: str = "./app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth"
    MODEL_DEVICE: str = "cpu"
    MODEL_WARMUP: bool = True  # Enable warmup for testing
    PREDICTION_BATCH_SIZE: int = 1
    TOP_K_PREDICTIONS: int = 3
    DIAGNOSIS_MIN_CONFIDENCE: float = 0.60
    DIAGNOSIS_MIN_TOP2_MARGIN: float = 0.15
    DIAGNOSIS_MIN_IMAGE_QUALITY_SCORE: int = 50
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 10
    RATE_LIMIT_LOGIN_REQUESTS: int = 5
    RATE_LIMIT_LOGIN_WINDOW_SECONDS: int = 60
    RATE_LIMIT_SIGNUP_REQUESTS: int = 5
    RATE_LIMIT_SIGNUP_WINDOW_SECONDS: int = 60
    RATE_LIMIT_FORGOT_PASSWORD_REQUESTS: int = 3
    RATE_LIMIT_FORGOT_PASSWORD_WINDOW_SECONDS: int = 600
    RATE_LIMIT_RESET_PASSWORD_REQUESTS: int = 5
    RATE_LIMIT_RESET_PASSWORD_WINDOW_SECONDS: int = 600
    RATE_LIMIT_DIAGNOSIS_REQUESTS: int = 10
    RATE_LIMIT_DIAGNOSIS_WINDOW_SECONDS: int = 60
    RATE_LIMIT_RAG_CHAT_REQUESTS: int = 20
    RATE_LIMIT_RAG_CHAT_WINDOW_SECONDS: int = 60

    # RAG
    RAG_KNOWLEDGE_PATH: str = "./app/data/rag/skin_data1.txt"
    RAG_VECTOR_INDEX_DIR: str = "./app/data/rag/vector_index"
    RAG_TOP_K: int = 4
    RAG_CHUNK_SIZE: int = 900
    RAG_CHUNK_OVERLAP: int = 150
    RAG_SOURCE_SNIPPET_CHARS: int = 500
    RAG_LLM_PROVIDER: Optional[str] = None
    RAG_LLM_MODEL: Optional[str] = None
    RAG_LLM_TIMEOUT_SECONDS: int = 20
    RAG_LLM_MAX_OUTPUT_TOKENS: int = 700
    OPENAI_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    XAI_BASE_URL: str = "https://api.x.ai/v1"
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    
    # Monitoring
    ENABLE_METRICS: bool = True
    HEALTH_CHECK_INTERVAL: int = 60
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @field_validator("UPLOAD_DIR")
    @classmethod
    def validate_upload_dir(cls, v: str) -> str:
        """Ensure upload directory exists"""
        path = Path(v)
        path.mkdir(parents=True, exist_ok=True)
        return v

    @model_validator(mode="after")
    def validate_production_security(self):
        """Prevent unsafe production startup configuration."""
        if self.is_production:
            if not self.AUTH_REQUIRED:
                raise ValueError("AUTH_REQUIRED must be true in production")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("CORS_ORIGINS must not contain '*' in production")

            weak_secret_values = {
                "",
                "change-me",
                "your-secret-key-change-in-production-minimum-32-characters",
            }
            secret_was_configured = "SECRET_KEY" in self.model_fields_set
            if (
                not secret_was_configured
                or self.SECRET_KEY in weak_secret_values
                or len(self.SECRET_KEY) < 32
            ):
                raise ValueError("A strong SECRET_KEY must be configured in production")
        return self
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    @property
    def database_url_async(self) -> str:
        """Get async database URL for SQLAlchemy 2.0"""
        if self.DATABASE_URL.startswith("sqlite"):
            return self.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
        elif self.DATABASE_URL.startswith("postgresql"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        return self.DATABASE_URL

    @property
    def rate_limit_rules(self) -> Dict[Tuple[str, str], Tuple[int, int]]:
        """Endpoint-specific rate limit rules: (method, path) -> (calls, seconds)."""
        return {
            ("POST", "/api/v1/auth/login"): (
                self.RATE_LIMIT_LOGIN_REQUESTS,
                self.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
            ),
            ("POST", "/api/v1/auth/signup"): (
                self.RATE_LIMIT_SIGNUP_REQUESTS,
                self.RATE_LIMIT_SIGNUP_WINDOW_SECONDS,
            ),
            ("POST", "/api/v1/auth/forgot-password"): (
                self.RATE_LIMIT_FORGOT_PASSWORD_REQUESTS,
                self.RATE_LIMIT_FORGOT_PASSWORD_WINDOW_SECONDS,
            ),
            ("POST", "/api/v1/auth/reset-password"): (
                self.RATE_LIMIT_RESET_PASSWORD_REQUESTS,
                self.RATE_LIMIT_RESET_PASSWORD_WINDOW_SECONDS,
            ),
            ("POST", "/api/v1/diagnosis"): (
                self.RATE_LIMIT_DIAGNOSIS_REQUESTS,
                self.RATE_LIMIT_DIAGNOSIS_WINDOW_SECONDS,
            ),
            ("POST", "/api/v1/rag/chat"): (
                self.RATE_LIMIT_RAG_CHAT_REQUESTS,
                self.RATE_LIMIT_RAG_CHAT_WINDOW_SECONDS,
            ),
        }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
