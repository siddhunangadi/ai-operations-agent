from app.modules.agent.organization_memory_repository import organization_memory_repository


async def update_memory_node(state):

    if "get_budget_summary" in state["tool_results"]:

        await organization_memory_repository.save(

            "latest_budget",

            state["tool_results"]["get_budget_summary"],

        )


    if "get_cost_summary" in state["tool_results"]:

        await organization_memory_repository.save(

            "latest_cost",

            state["tool_results"]["get_cost_summary"],

        )


    if "get_provider_summary" in state["tool_results"]:

        await organization_memory_repository.save(

            "latest_provider",

            state["tool_results"]["get_provider_summary"],

        )

    return state
