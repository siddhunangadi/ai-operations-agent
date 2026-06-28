from app.modules.action.models import Action


ACTION_REGISTRY = {

    "notify_admin": Action(

        name="notify_admin",

        description="Notify administrator",

        parameters={},

    ),

    "send_slack_message": Action(

        name="send_slack_message",

        description="Send Slack notification",

        parameters={

            "channel": "",

            "message": ""

        },

    ),

    "create_jira_ticket": Action(

        name="create_jira_ticket",

        description="Create Jira ticket",

        parameters={

            "title": "",

            "description": ""

        },

        risk="MEDIUM",

        requires_approval=True,

    ),

    "create_github_issue": Action(

        name="create_github_issue",

        description="Create GitHub issue",

        parameters={

            "title": "",

            "body": ""

        },

        risk="LOW",

    ),

}
