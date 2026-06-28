from app.db.supabase import supabase


class OrganizationMemoryRepository:

    async def get_all(self):

        response = (

            supabase.table(

                "organization_memory"

            )

            .select("*")

            .execute()

        )

        return response.data


    async def save(

        self,

        key,

        value,

    ):

        supabase.table(

            "organization_memory"

        ).insert(

            {

                "organization_id": "org_1",

                "memory_key": key,

                "memory_value": value,

            }

        ).execute()


organization_memory_repository = OrganizationMemoryRepository()
