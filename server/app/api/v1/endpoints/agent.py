from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.agent_configs import AgentConfig

router = APIRouter()


class InstructionsUpdate(BaseModel):
    instructions: List[str]


@router.get("/config")
async def get_agent_config(db: AsyncSession = Depends(get_db)):
    """Fetch custom agent instructions."""
    result = await db.execute(select(AgentConfig).order_by(AgentConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()
    
    if config and config.custom_instructions is not None:
        return {"instructions": config.custom_instructions}
    
    return {"instructions": ["Default instruction set"]}


@router.post("/config")
async def update_agent_config(data: InstructionsUpdate, db: AsyncSession = Depends(get_db)):
    """Update custom agent instructions."""
    result = await db.execute(select(AgentConfig).order_by(AgentConfig.id.desc()).limit(1))
    config = result.scalar_one_or_none()
    
    if config:
        config.custom_instructions = data.instructions
    else:
        config = AgentConfig(custom_instructions=data.instructions)
        db.add(config)
        
    await db.commit()
    return {"status": "success", "instructions": config.custom_instructions}
