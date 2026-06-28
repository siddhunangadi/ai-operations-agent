from app.db.supabase import supabase


class UsageRepository:

    TABLE = "usage_logs"

    async def get_all(self):

        response = (
            supabase
            .table(self.TABLE)
            .select("*")
            .execute()
        )

        print("=" * 60)
        print("SUPABASE RESPONSE")
        print(response.data)
        print("=" * 60)

        return response.data


usage_repository = UsageRepository()
