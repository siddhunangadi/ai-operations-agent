from app.modules.action.services import github
from app.modules.action.services import jira
from app.modules.action.services import slack


EXECUTORS = {
    "create_github_issue": github.execute,
    "create_jira_ticket": jira.execute,
    "send_slack_message": slack.execute,
}


async def execute_action(action):
    """
    Execute a planned action.

    If no action was planned, return a no-op result so the graph can
    continue to the response generation stage.
    """

    if not action:
        return {
            "status": "skipped",
            "message": "No action planned."
        }

    action_name = action.get("action_name")

    if not action_name or action_name == "None":
        return {
            "status": "skipped",
            "message": "No action planned."
        }

    executor = EXECUTORS.get(action_name)

    if executor is None:
        return {
            "status": "skipped",
            "message": f"Unknown action: {action_name}"
        }

    return await executor(
        action.get("parameters", {})
    )
