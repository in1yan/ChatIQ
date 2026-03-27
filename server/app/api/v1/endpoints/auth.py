from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse, Response

from app.core.config import settings
from app.dependancies.auth import get_current_user
from app.schemas.auth import RefreshTokenRequest
from app.services.auth import create_user
from supabase_auth.errors import AuthApiError
from app.services.supabase import (
    check_domain,
    exchange_code_for_session,
    initiate_oauth_signin,
    supabase_client,
)

router = APIRouter()


@router.get("/oauth/callback")
async def oauth_callback(code: Optional[str] = Query(None)):
    """
    OAuth callback endpoint that redirects to frontend with tokens
    """
    frontend_url = settings.FRONTEND_URL

    if not code:
        error_params = urlencode(
            {"error": "oauth_failed", "message": "OAuth sign-in failed"}
        )
        return RedirectResponse(url=f"{frontend_url}/auth/error?{error_params}")

    try:
        result = exchange_code_for_session(code)
    except Exception as e:
        error_params = urlencode(
            {"error": "invalid_code", "message": "Invalid or expired OAuth code"}
        )
        return RedirectResponse(url=f"{frontend_url}/auth/error?{error_params}")

    if not result.session or not result.user:
        error_params = urlencode(
            {"error": "session_failed", "message": "Failed to create session"}
        )
        return RedirectResponse(url=f"{frontend_url}/auth/error?{error_params}")

    email = result.user.email
    if not email or not check_domain(email, settings.ALLOWED_EMAIL_DOMAINS):
        error_params = urlencode(
            {"error": "domain_not_allowed", "message": "Email domain not allowed"}
        )
        return RedirectResponse(url=f"{frontend_url}/auth/error?{error_params}")

    await create_user(result.user)

    refresh_token = result.session.refresh_token
    redirect_url = f"{frontend_url}/auth/success#refresh_token={refresh_token}"

    return RedirectResponse(url=redirect_url)


@router.post("/token")
async def get_access_token(token_request: RefreshTokenRequest):
    if not token_request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing"
        )

    try:
        session = supabase_client.auth.refresh_session(token_request.refresh_token)

        if not session or not session.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not refresh session",
            )

        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "token_type": "Bearer",
            "expires_in": session.session.expires_in,
        }
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}"
        )


@router.get(
    "/oauth/{provider}",
    status_code=status.HTTP_200_OK,
)
async def oauth_signin(
    provider: str,
    redirect_url: str = Query(
        default=settings.OAUTH_REDIRECT_URL,
    ),
):
    result = initiate_oauth_signin(provider, redirect_url)

    if not result.url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate OAuth URL",
        )

    return RedirectResponse(url=result.url)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}
