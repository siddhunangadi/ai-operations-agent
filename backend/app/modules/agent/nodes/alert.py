async def alert_node(state):

    if not state["alerts"]:

        state["answer"] = "No operational issues detected."

        state["finished"] = True

        return state

    report = "# AI Operations Alerts\n\n"

    for alert in state["alerts"]:

        report += f"- {alert}\n"

    state["answer"] = report

    state["finished"] = True

    return state
