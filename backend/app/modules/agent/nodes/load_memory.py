from app.modules.agent.memory_repository import memory_repository


async def load_memory_node(state):

    state["memory"] = await memory_repository.load()

    return state
