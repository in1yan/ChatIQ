from pymongo.errors import DuplicateKeyError

from app.models import User


async def create_user(data):
    existing_user = await User.find_one(User.auth_id == data.id)
    if existing_user:
        return existing_user

    app_metadata = data.app_metadata or {}
    metadata = data.user_metadata or {}

    user = User(
        auth_id=data.id,
        email=data.email,
        provider=(
            app_metadata.get("provider")
            or (app_metadata.get("providers") or [None])[0]
        ),
        avatar=metadata.get("avatar_url"),
        full_name=metadata.get("full_name"),
        is_active=True,
        created_at=data.created_at,
        is_admin=False,
    )

    try:
        await user.insert()
    except DuplicateKeyError:
        # If the insert fails due to a duplicate key, it could be either auth_id or email.
        # First, try to find the user by auth_id, as it's the primary identifier from the token.
        existing_user_by_auth_id = await User.find_one(User.auth_id == data.id)
        if existing_user_by_auth_id:
            return existing_user_by_auth_id

        # If no user is found by auth_id, the duplicate key error was likely on the email.
        # Find the user by email to handle cases where the user signed up with a different provider.
        return await User.find_one(User.email == data.email)

    return user

