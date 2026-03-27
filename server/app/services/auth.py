from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


async def create_user(db: AsyncSession, data):
    # Check if user already exists by auth_id
    result = await db.execute(select(User).where(User.auth_id == data.id))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        return existing_user

    app_metadata = data.app_metadata or {}
    metadata = data.user_metadata or {}

    user = User(
        auth_id=data.id,
        email=data.email,
        provider=(
            app_metadata.get("provider") or (app_metadata.get("providers") or [None])[0]
        ),
        full_name=metadata.get("full_name"),
        is_active=True,
        created_at=data.created_at,
    )

    try:
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        # If the insert fails due to a duplicate key, it could be either auth_id or email.
        # First, try to find the user by auth_id, as it's the primary identifier from the token.
        result = await db.execute(select(User).where(User.auth_id == data.id))
        existing_user_by_auth_id = result.scalar_one_or_none()
        if existing_user_by_auth_id:
            return existing_user_by_auth_id

        # If no user is found by auth_id, the duplicate key error was likely on the email.
        # Find the user by email to handle cases where the user signed up with a different provider.
        result = await db.execute(select(User).where(User.email == data.email))
        return result.scalar_one_or_none()

    return user
