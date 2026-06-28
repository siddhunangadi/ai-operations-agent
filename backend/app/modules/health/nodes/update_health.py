from app.modules.health.engine import health_engine


async def update_health_node(

    state,

):

    world_model=state["world_model"]

    health=health_engine.calculate(

        world_model,

    )

    state["world_model"]["health"]=health

    return state
