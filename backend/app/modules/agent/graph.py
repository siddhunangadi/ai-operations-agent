from langgraph.graph import StateGraph
from langgraph.graph import START, END

from app.modules.agent.state import AgentState

from app.modules.agent.nodes.observe import observe_node
from app.modules.agent.nodes.load_world_model import load_world_model_node
from app.modules.agent.nodes.planner import planner_node
from app.modules.agent.nodes.execution_queue import execution_queue_node
from app.modules.agent.nodes.execute import execute_node
from app.modules.agent.nodes.collect_evidence import collect_evidence_node
from app.modules.agent.nodes.evaluate import evaluate_node
from app.modules.agent.nodes.gap_analyzer import gap_analyzer_node
from app.modules.agent.nodes.replan import replan_node
from app.modules.agent.nodes.critic import critic_node
from app.modules.agent.nodes.respond import respond_node
from app.modules.agent.nodes.save_memory import save_memory_node
from app.modules.agent.nodes.update_world_model import update_world_model_node
from app.modules.agent.nodes.learn import learn_node

from app.modules.action.nodes.action_planner import action_planner_node
from app.modules.action.nodes.approval import approval_node
from app.modules.action.nodes.execute_action import execute_action_node


builder = StateGraph(AgentState)

builder.add_node("observe", observe_node)
builder.add_node("load_world_model", load_world_model_node)
builder.add_node("planner", planner_node)
builder.add_node("queue", execution_queue_node)
builder.add_node("execute", execute_node)
builder.add_node("collect_evidence", collect_evidence_node)
builder.add_node("evaluate", evaluate_node)
builder.add_node("gap_analyzer", gap_analyzer_node)
builder.add_node("replan", replan_node)
builder.add_node("critic", critic_node)
builder.add_node("respond", respond_node)

builder.add_node("action_planner", action_planner_node)
builder.add_node("approval", approval_node)
builder.add_node("execute_action", execute_action_node)

builder.add_node("save_memory", save_memory_node)
builder.add_node("learn", learn_node)
builder.add_node("update_world_model", update_world_model_node)

builder.add_edge(START, "observe")

builder.add_edge("observe", "load_world_model")

builder.add_edge("load_world_model", "planner")

builder.add_edge("planner", "queue")


def after_queue(state):

    if state["finished"]:

        return "critic"

    return "execute"


builder.add_conditional_edges(

    "queue",

    after_queue,

)

builder.add_edge("execute", "collect_evidence")

builder.add_edge("collect_evidence", "evaluate")


def after_evaluate(state):

    if state["finished"]:

        return "critic"

    return "gap_analyzer"


builder.add_conditional_edges(

    "evaluate",

    after_evaluate,

)

builder.add_edge(

    "gap_analyzer",

    "replan",

)

builder.add_edge(

    "replan",

    "queue",

)

builder.add_edge(

    "critic",

    "respond",

)

builder.add_edge(

    "respond",

    "action_planner",

)

builder.add_edge(

    "action_planner",

    "approval",

)

builder.add_edge(

    "approval",

    "execute_action",

)

builder.add_edge(

    "execute_action",

    "save_memory",

)

builder.add_edge(

    "save_memory",

    "learn",

)

builder.add_edge(

    "learn",

    "update_world_model",

)

builder.add_edge(

    "update_world_model",

    END,

)

agent_graph = builder.compile()
