from app.db.supabase import supabase


class LearningRepository:

    TABLE = "agent_learning"

    async def save(self, lesson):

        supabase.table(self.TABLE).insert(
            lesson
        ).execute()

    async def recent(self, limit=20):

        response = (
            supabase.table(self.TABLE)
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return response.data


learning_repository = LearningRepository()
