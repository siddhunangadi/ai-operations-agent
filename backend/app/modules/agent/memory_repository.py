from app.db.supabase import supabase


class MemoryRepository:

    async def load(self):

        response = (

            supabase.table("agent_memory")

            .select("*")

            .order("created_at", desc=True)

            .limit(20)

            .execute()

        )

        return response.data


    async def save(

        self,

        question,

        answer,

        plan,

        completed_tools,

    ):

        supabase.table(

            "agent_memory"

        ).insert(

            {

                "organization_id": "org_1",

                "question": question,

                "answer": answer,

                "plan": plan,

                "completed_tools": completed_tools,

            }

        ).execute()


memory_repository = MemoryRepository()
