from app.modules.agent.repositories.world_model_repository import world_model_repository


async def load_world_model_node(state):

    world_model = await world_model_repository.load()

    state["world_model"] = world_model

    return state
