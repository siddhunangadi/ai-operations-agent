import pytest
from unittest.mock import MagicMock

@pytest.mark.anyio
async def test_dashboard_timeline(client, mock_supabase_client):
    # Mock return values for action history table
    mock_action = {
        "id": "action-123",
        "action_name": "send_slack_message",
        "description": "Sent report to team channel",
        "status": "success",
        "created_at": "2026-06-28T05:00:00Z"
    }
    
    # Mock return values for agent learning table
    mock_learning = {
        "id": "learning-456",
        "lesson_type": "cost_optimization",
        "lesson": {"finding": "Marketing assistant has high latency"},
        "created_at": "2026-06-28T05:30:00Z"
    }
    
    # Mock database executes
    # We set up mock execute results for both tables
    mock_execute_action = MagicMock()
    mock_execute_action.data = [mock_action]
    
    mock_execute_learning = MagicMock()
    mock_execute_learning.data = [mock_learning]
    
    # Set up mock side effects based on table names
    def mock_table(table_name):
        mock_chain = MagicMock()
        if table_name == "action_history":
            mock_chain.select().order().limit().execute.return_value = mock_execute_action
        elif table_name == "agent_learning":
            mock_chain.select().order().limit().execute.return_value = mock_execute_learning
        return mock_chain

    mock_supabase_client.table.side_effect = mock_table

    # Call timeline API
    response = await client.get("/api/v1/dashboard/timeline")
    assert response.status_code == 200
    events = response.json()
    assert len(events) == 2
    
    # Check types and ordering (newest first, learning was at 05:30, action was at 05:00)
    assert events[0]["type"] == "learning"
    assert events[0]["title"] == "cost_optimization"
    assert events[1]["type"] == "action"
    assert events[1]["title"] == "send_slack_message"

@pytest.mark.anyio
async def test_dashboard_learning(client, mock_supabase_client):
    mock_learning = {
        "id": "learning-456",
        "lesson_type": "cost_optimization",
        "lesson": {"finding": "Marketing assistant has high latency"},
        "created_at": "2026-06-28T05:30:00Z"
    }
    
    mock_execute = MagicMock()
    mock_execute.data = [mock_learning]
    
    mock_supabase_client.table().select().order().limit().execute.return_value = mock_execute
    
    response = await client.get("/api/v1/dashboard/learning")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["lesson_type"] == "cost_optimization"
