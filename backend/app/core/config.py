from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Operations Agent"
    APP_VERSION: str = "1.0.0"

    API_V1_PREFIX: str = "/api/v1"

    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = True

    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    GEMINI_API_KEY: str

    AUTH_REQUIRED: bool = Field(default=False)

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
