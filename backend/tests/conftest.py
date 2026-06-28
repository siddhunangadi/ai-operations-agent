import sys
import os
import pytest
from unittest.mock import MagicMock

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Create a mock for the supabase client before app imports
mock_supabase = MagicMock()
sys.modules['supabase'] = MagicMock()

# Mock the langchain google genai module
sys.modules['langchain_google_genai'] = MagicMock()

# Patch the supabase client in app.db.supabase
import app.db.supabase
app.db.supabase.supabase = mock_supabase

from app.main import app

@pytest.fixture
def mock_supabase_client():
    mock_supabase.reset_mock()
    mock_supabase.table.side_effect = None
    return mock_supabase

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    import httpx
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
