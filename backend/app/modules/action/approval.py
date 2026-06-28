from app.modules.action.registry import ACTION_REGISTRY


async def approve(action):
    """
    Returns whether the planned action can execute without manual approval.
    If no action was planned, treat it as already approved.
    """

    if not action:
        return True

    action_name = action.get("action_name")

    if not action_name:
        return True

    definition = ACTION_REGISTRY.get(action_name)

    if definition is None:
        return True

    return not definition.requires_approval
