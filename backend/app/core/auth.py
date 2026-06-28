from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

security = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: str
    email: str
    organization_id: str
    full_name: str | None = None


async def verify_supabase_token(token: str) -> dict:
    settings = get_settings()

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return response.json()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> CurrentUser:
    settings = get_settings()

    if not credentials:
        if settings.AUTH_REQUIRED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )
        return CurrentUser(
            id="dev-user",
            email="admin@demo.local",
            organization_id="org_1",
            full_name="Demo Admin",
        )

    user_data = await verify_supabase_token(credentials.credentials)
    org_id = user_data.get("user_metadata", {}).get("organization_id", "org_1")

    return CurrentUser(
        id=user_data["id"],
        email=user_data.get("email", ""),
        organization_id=org_id,
        full_name=user_data.get("user_metadata", {}).get("full_name"),
    )
