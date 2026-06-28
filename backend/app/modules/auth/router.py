from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import supabase
from app.modules.auth.schemas import ProfileUpdateRequest, SignupRequest, LoginRequest
from app.modules.auth.service import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
async def get_profile(user: CurrentUser = Depends(get_current_user)):
    return await auth_service.get_profile(user)


@router.patch("/me")
async def update_profile(
    payload: ProfileUpdateRequest,
    user: CurrentUser = Depends(get_current_user),
):
    import uuid

    is_uuid = True
    try:
        uuid.UUID(str(user.id))
    except ValueError:
        is_uuid = False

    if is_uuid:
        supabase.table("profiles").update({
            "full_name": payload.full_name,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", user.id).execute()

    profile_data = await auth_service.get_profile(user)
    if not is_uuid:
        profile_data["full_name"] = payload.full_name

    return profile_data


@router.post("/logout")
async def logout():
    return {"success": True, "message": "Session cleared on client."}


@router.post("/signup")
async def signup(payload: SignupRequest):
    return await auth_service.signup(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )


@router.post("/login")
async def login(payload: LoginRequest):
    return await auth_service.login(
        email=payload.email,
        password=payload.password,
    )
