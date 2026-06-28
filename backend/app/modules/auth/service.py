from fastapi import HTTPException
from app.core.auth import CurrentUser
from app.db.supabase import supabase
from app.modules.auth.repository import profile_repository
from app.modules.auth.schemas import SignupRequest, ProfileUpdateRequest


class AuthService:

    async def get_profile(self, user: CurrentUser) -> dict:
        profile = await profile_repository.get_by_id(user.id)

        if profile:
            return {
                "id": user.id,
                "email": profile.get("email") or user.email,
                "full_name": profile.get("full_name") or user.full_name,
                "avatar_url": profile.get("avatar_url"),
                "organization_id": user.organization_id,
            }

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": None,
            "organization_id": user.organization_id,
        }

    async def signup(self, email: str, password: str, full_name: str) -> dict:
        try:
            res = supabase.auth.sign_up(credentials={
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "organization_id": "org_1"
                    }
                }
            })
            
            # Proactive profile insertion in case triggers aren't run/enabled
            if res.user:
                try:
                    await profile_repository.create_profile(
                        user_id=res.user.id,
                        email=email,
                        full_name=full_name
                    )
                except Exception as db_err:
                    print("Resilient profile creation fallback: could not insert profile (perhaps it was auto-created by trigger?):", db_err)
            
            return {
                "success": True,
                "user": {
                    "id": res.user.id if res.user else None,
                    "email": res.user.email if res.user else email,
                    "full_name": full_name,
                },
                "session": {
                    "access_token": res.session.access_token if res.session else None,
                    "refresh_token": res.session.refresh_token if res.session else None,
                }
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def login(self, email: str, password: str) -> dict:
        try:
            res = supabase.auth.sign_in_with_password(credentials={
                "email": email,
                "password": password
            })
            
            # Sync user profile
            profile = await profile_repository.get_by_id(res.user.id)
            if not profile and res.user:
                try:
                    await profile_repository.create_profile(
                        user_id=res.user.id,
                        email=email,
                        full_name=res.user.user_metadata.get("full_name") or email.split("@")[0]
                    )
                except Exception as db_err:
                    print("Resilient profile creation fallback: could not insert profile on login:", db_err)
            
            return {
                "success": True,
                "user": {
                    "id": res.user.id if res.user else None,
                    "email": res.user.email if res.user else email,
                    "full_name": profile.get("full_name") if profile else (res.user.user_metadata.get("full_name") if res.user else (email.split("@")[0])),
                },
                "session": {
                    "access_token": res.session.access_token if res.session else None,
                    "refresh_token": res.session.refresh_token if res.session else None,
                }
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


auth_service = AuthService()
