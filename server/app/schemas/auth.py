from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserResponse(BaseModel):
    """Schema for user response (excludes sensitive data)"""

    id: str = Field(..., description="User's unique identifier (UUID)")
    email: EmailStr = Field(..., description="User's email address")
    provider: Optional[str] = Field(
        None, description="OAuth provider used for authentication"
    )
    avatar: Optional[str] = Field(None, description="Profile image")
    full_name: Optional[str] = Field(None, description="User's full name")
    is_active: Optional[bool] = Field(
        default=True, description="Whether the user account is active"
    )
    created_at: datetime = Field(..., description="Account creation timestamp")
    is_admin: Optional[bool] = Field(
        default=False, description="Whether the user account is admin"
    )
    model_config = ConfigDict(from_attributes=True)


class UserResponseWithHistory(UserResponse):
    recently_watched: List[WatchHistory]
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for JWT token response"""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenData(BaseModel):
    """Schema for token payload data"""

    email: Optional[str] = None
    user_id: Optional[str] = None  # UUID string for Supabase


class UserSession(BaseModel):
    """Schema for user session data"""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    expires_at: datetime = Field(..., description="Token expiration timestamp")
    token_type: str = Field(default="bearer", description="Token type")


class OAuthProvider(BaseModel):
    """Schema for OAuth provider selection"""

    provider: str = Field(..., description="OAuth provider name (google, github, etc.)")
    redirect_url: Optional[str] = Field(
        None, description="Custom redirect URL after OAuth"
    )


class OAuthResponse(BaseModel):
    """Schema for OAuth initiation response"""

    provider: str = Field(..., description="OAuth provider name")
    url: str = Field(..., description="OAuth authorization URL to redirect user to")


class OAuthCallbackRequest(BaseModel):
    """Schema for OAuth callback request"""

    code: str = Field(..., description="Authorization code from OAuth provider")


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""

    refresh_token: str = Field(..., description="The refresh token")
