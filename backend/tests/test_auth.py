import pytest
from unittest.mock import MagicMock, patch

@pytest.mark.anyio
async def test_get_profile_dev_mode(client):
    # Tests GET /auth/me when AUTH_REQUIRED=false and no credentials provided
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "dev-user"
    assert data["email"] == "admin@demo.local"
    assert data["full_name"] == "Demo Admin"

@pytest.mark.anyio
async def test_update_profile_dev_mode(client, mock_supabase_client):
    # Tests PATCH /auth/me when ID is "dev-user"
    payload = {
        "full_name": "Updated Dev Name"
    }
    response = await client.patch("/api/v1/auth/me", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "dev-user"
    assert data["full_name"] == "Updated Dev Name"

@pytest.mark.anyio
async def test_signup_validation_error(client):
    # Tests signup with an invalid email address format
    payload = {
        "email": "invalidemail",
        "password": "password123",
        "full_name": "Test User"
    }
    response = await client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_signup_success(client, mock_supabase_client):
    # Setup mock AuthResponse
    mock_user = MagicMock()
    mock_user.id = "67d0b24e-9af8-4e9f-a794-dd2f9a779340"
    mock_user.email = "new_user@example.com"
    
    mock_session = MagicMock()
    mock_session.access_token = "mocked-access-token"
    mock_session.refresh_token = "mocked-refresh-token"
    
    mock_auth_resp = MagicMock()
    mock_auth_resp.user = mock_user
    mock_auth_resp.session = mock_session
    
    mock_supabase_client.auth.sign_up.return_value = mock_auth_resp
    mock_supabase_client.table().insert().execute.return_value = MagicMock(data=[])
    
    payload = {
        "email": "new_user@example.com",
        "password": "password123",
        "full_name": "New User"
    }
    response = await client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "new_user@example.com"
    assert data["session"]["access_token"] == "mocked-access-token"

@pytest.mark.anyio
async def test_login_success(client, mock_supabase_client):
    # Setup mock AuthResponse
    mock_user = MagicMock()
    mock_user.id = "67d0b24e-9af8-4e9f-a794-dd2f9a779340"
    mock_user.email = "new_user@example.com"
    mock_user.user_metadata = {"full_name": "New User"}
    
    mock_session = MagicMock()
    mock_session.access_token = "mocked-login-token"
    mock_session.refresh_token = "mocked-login-refresh"
    
    mock_auth_resp = MagicMock()
    mock_auth_resp.user = mock_user
    mock_auth_resp.session = mock_session
    
    mock_supabase_client.auth.sign_in_with_password.return_value = mock_auth_resp
    
    # Mock profiles table query returning none (triggering resilient create)
    mock_supabase_client.table().select().eq().limit().execute.return_value = MagicMock(data=[])
    mock_supabase_client.table().insert().execute.return_value = MagicMock(data=[])
    
    payload = {
        "email": "new_user@example.com",
        "password": "password123"
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["session"]["access_token"] == "mocked-login-token"
