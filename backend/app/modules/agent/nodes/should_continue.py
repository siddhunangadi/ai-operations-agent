def should_continue(state):

    if state["finished"]:
        return "respond"

    if state["iteration"] >= 5:
        return "respond"

    return "reason"
