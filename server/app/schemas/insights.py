from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class InsightBase(BaseModel):
    insight_type: str
    per_message_sentiment: Optional[str] = None
    upsell_opportunity: Optional[str] = None
    service_gap: Optional[str] = None
    conversation_sentiment: Optional[str] = None
    channel_sentiment_trend: Optional[str] = None
    churn_risk: Optional[str] = None
    customer_segment_lead_score: Optional[str] = None
    aspect_based_sentiment: Optional[Dict[str, Any]] = None
    trending_topics: Optional[List[str]] = None
    traffic_rate: Optional[str] = None
    traffic_to_conversion_rate: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = {}


class InsightCreate(InsightBase):
    customer_id: int


class InsightResponse(InsightBase):
    id: int
    customer_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardMetricsResponse(BaseModel):
    total_insights: int
    high_churn_risk_count: int
    sentiment_distribution: Dict[str, int]
    top_trending_topics: List[str]
    upsell_opportunities_count: int
    recent_service_gaps: List[str]
