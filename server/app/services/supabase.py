from fastapi import HTTPException, status
from supabase_auth.errors import AuthApiError

from app.core.config import settings
from app.core.supabase import supabase_client


def check_domain(email: str, allowed_domains: list) -> bool:
    domain = email.split("@")[-1]
    return domain in allowed_domains


def initiate_oauth_signin(provider: str, redirect_url: str):
    """Initiate OAuth sign-in flow with a provider

    Args:
        provider: OAuth provider name (google, github, etc.)
        redirect_url: URL to redirect to after OAuth callback

    Returns:
        OAuth response with authorization URL
    """
    try:
        result = supabase_client.auth.sign_in_with_oauth(
            {"provider": provider, "options": {"redirect_to": redirect_url}}
        )
        return result
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth initiation failed: {str(e)}",
        )


def exchange_code_for_session(auth_code: str):
    """Exchange OAuth authorization code for user session

    Args:
        auth_code: Authorization code from OAuth callback

    Returns:
        User session with access token and user data
    """
    try:
        result = supabase_client.auth.exchange_code_for_session(
            {"auth_code": auth_code}
        )
        return result
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Code exchange failed: {str(e)}",
        )
