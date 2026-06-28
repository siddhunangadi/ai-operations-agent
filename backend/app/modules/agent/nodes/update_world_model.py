from app.modules.agent.repositories.world_model_repository import world_model_repository


async def update_world_model_node(state):

    await world_model_repository.save(

        state["world_model"]

    )

    return state
