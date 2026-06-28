import uuid
from app.db.supabase import supabase


class ProfileRepository:

    async def get_by_id(self, user_id: str) -> dict | None:
        try:
            uuid.UUID(str(user_id))
        except ValueError:
            return None

        response = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    async def create_profile(self, user_id: str, email: str, full_name: str) -> dict:
        response = (
            supabase.table("profiles")
            .insert({
                "id": user_id,
                "email": email,
                "full_name": full_name
            })
            .execute()
        )
        return response.data[0] if response.data else None


profile_repository = ProfileRepository()
