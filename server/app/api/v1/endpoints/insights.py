from collections import Counter
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.insights import Insight
from app.schemas.insights import DashboardMetricsResponse, InsightResponse

router = APIRouter()


@router.get(
    "/",
    response_model=List[InsightResponse],
    summary="List all recorded insights",
    description="Fetch a paginated list of insights, optionally filtered by customer and date range.",
)
async def list_insights(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, description="Skip N records"),
    limit: int = Query(100, description="Limit records returned"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    start_date: Optional[datetime] = Query(None, description="Filter insights created after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter insights created before this date"),
) -> List[Insight]:
    query = select(Insight).order_by(Insight.created_at.desc())

    if customer_id is not None:
        query = query.where(Insight.customer_id == customer_id)
    if start_date is not None:
        query = query.where(Insight.created_at >= start_date)
    if end_date is not None:
        query = query.where(Insight.created_at <= end_date)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/metrics",
    response_model=DashboardMetricsResponse,
    summary="Get aggregated dashboard metrics",
    description="Fetch aggregated statistics from insights across the given date range.",
)
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    start_date: Optional[datetime] = Query(None, description="Start date for metric calculation"),
    end_date: Optional[datetime] = Query(None, description="End date for metric calculation"),
) -> dict:
    # Build base query for filtering
    base_query = select(Insight)
    if start_date:
        base_query = base_query.where(Insight.created_at >= start_date)
    if end_date:
        base_query = base_query.where(Insight.created_at <= end_date)

    # We will fetch the needed raw data to process metrics. 
    # For a high-traffic production app, these should ideally be pure SQL aggregations,
    # but pulling the filtered result set allows easier dict/list reductions here.
    result = await db.execute(base_query)
    insights = result.scalars().all()

    total_insights = len(insights)
    high_churn_risk_count = 0
    sentiment_distribution = Counter()
    topic_counter = Counter()
    upsell_opportunities_count = 0
    recent_service_gaps = []

    for ins in insights:
        # Churn risk
        if ins.churn_risk and "high" in ins.churn_risk.lower():
            high_churn_risk_count += 1
            
        # Sentiment tally (preferring conversation over message baseline)
        sentiment = ins.conversation_sentiment or ins.per_message_sentiment
        if sentiment:
            # Clean up the string a bit for standard counting
            clean_sentiment = sentiment.strip().lower()
            sentiment_distribution[clean_sentiment] += 1
            
        # Topics tally
        if ins.trending_topics and isinstance(ins.trending_topics, list):
            for topic in ins.trending_topics:
                topic_counter[topic.strip()] += 1
                
        # Upsell opportunities
        if ins.upsell_opportunity:
            upsell_opportunities_count += 1
            
        # Service gaps
        if ins.service_gap:
            recent_service_gaps.append(ins.service_gap)

    # Sort recent service gaps so we just show the 5 most recent
    # (Since insights are appended chronologically, they are reverse sorted earlier, but here we read sequentially. 
    # They arrived in order of DB read, which is default asc unless specified. Let's return the last 5.)
    recent_service_gaps = recent_service_gaps[-5:]
    recent_service_gaps.reverse() # newest first

    top_topics = [topic for topic, count in topic_counter.most_common(5)]

    return {
        "total_insights": total_insights,
        "high_churn_risk_count": high_churn_risk_count,
        "sentiment_distribution": dict(sentiment_distribution),
        "top_trending_topics": top_topics,
        "upsell_opportunities_count": upsell_opportunities_count,
        "recent_service_gaps": recent_service_gaps,
    }
