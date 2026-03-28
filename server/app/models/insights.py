from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.session import Base


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False) # 'message_level', 'conversation_level'
    
    # Message-level specifics
    per_message_sentiment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    upsell_opportunity: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    service_gap: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Conversation-level specifics
    conversation_sentiment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    channel_sentiment_trend: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    churn_risk: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    customer_segment_lead_score: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    aspect_based_sentiment: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    trending_topics: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    traffic_rate: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    traffic_to_conversion_rate: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    extra_data: Mapped[dict] = mapped_column(JSONB, default={}, server_default="{}")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
