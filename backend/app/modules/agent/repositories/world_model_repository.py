from app.db.supabase import supabase


class WorldModelRepository:

    TABLE = "world_model"

    async def load(self):

        response = (
            supabase.table(self.TABLE)
            .select("state")
            .eq("organization_id", "org_1")
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]["state"]

        return {}


    async def save(self, state):

        payload = {
            "organization_id": "org_1",
            "state": state,
        }

        existing = (
            supabase.table(self.TABLE)
            .select("id")
            .eq("organization_id", "org_1")
            .limit(1)
            .execute()
        )

        if existing.data:

            supabase.table(self.TABLE).update(
                {
                    "state": state,
                }
            ).eq(
                "organization_id",
                "org_1",
            ).execute()

        else:

            supabase.table(self.TABLE).insert(
                payload
            ).execute()


world_model_repository = WorldModelRepository()
