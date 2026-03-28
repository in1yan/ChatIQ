from fastapi import APIRouter

from app.api.v1.endpoints import agent, auth, chat, health, insights, knowledge, webhooks

api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"],
)

api_router.include_router(
    webhooks.router,
    prefix="/webhook",
    tags=["webhook"],
)

api_router.include_router(
    knowledge.router,
    prefix="/knowledge",
    tags=["knowledge"],
)

api_router.include_router(
    insights.router,
    prefix="/insights",
    tags=["insights"],
)

api_router.include_router(
    agent.router,
    prefix="/agent",
    tags=["agent"],
)
