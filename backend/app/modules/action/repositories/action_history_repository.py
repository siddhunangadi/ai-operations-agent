from app.db.supabase import supabase


class ActionHistoryRepository:

    TABLE = "action_history"


    async def save(

        self,

        action,

    ):

        supabase.table(

            self.TABLE

        ).insert(

            action

        ).execute()

    async def list(self, limit: int = 50):

        response = (
            supabase.table(self.TABLE)
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return response.data or []


action_history_repository = ActionHistoryRepository()
