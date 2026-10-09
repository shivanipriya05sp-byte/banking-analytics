from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Transaction
from app.schemas.schemas import (
    SummaryResponse,
    DailyTrendItem,
    CategoryItem,
    MerchantItem,
    TransactionRow,
    TransactionListResponse,
)

router = APIRouter(prefix="/api", tags=["analytics"])


def _base_query(db: Session, account_id: Optional[int], start_date: Optional[str], end_date: Optional[str]):
    """Return a query filtered by optional account, start/end dates."""
    q = db.query(Transaction)
    if account_id:
        q = q.filter(Transaction.account_id == account_id)
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    return q


# ---------------------------------------------------------------------------
# GET /api/summary
# ---------------------------------------------------------------------------
@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    account_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = _base_query(db, account_id, start_date, end_date)

    total_transactions = q.count()
    total_spend = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "debit"
    )
    avg_transaction = db.query(func.coalesce(func.avg(Transaction.amount), 0))
    credits = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "credit"
    )
    debits = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "debit"
    )

    # Apply same filters
    for sub in (total_spend, avg_transaction, credits, debits):
        if account_id:
            sub = sub.filter(Transaction.account_id == account_id)
        if start_date:
            sub = sub.filter(Transaction.date >= start_date)
        if end_date:
            sub = sub.filter(Transaction.date <= end_date)

    total_spend_val = float(db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "debit",
        *([Transaction.account_id == account_id] if account_id else []),
        *([Transaction.date >= start_date] if start_date else []),
        *([Transaction.date <= end_date] if end_date else []),
    ).scalar() or 0)

    avg_val = float(q.with_entities(func.coalesce(func.avg(Transaction.amount), 0)).scalar() or 0)

    credits_val = float(db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "credit",
        *([Transaction.account_id == account_id] if account_id else []),
        *([Transaction.date >= start_date] if start_date else []),
        *([Transaction.date <= end_date] if end_date else []),
    ).scalar() or 0)

    debits_val = float(db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.type == "debit",
        *([Transaction.account_id == account_id] if account_id else []),
        *([Transaction.date >= start_date] if start_date else []),
        *([Transaction.date <= end_date] if end_date else []),
    ).scalar() or 0)

    return SummaryResponse(
        total_transactions=total_transactions,
        total_spend=round(total_spend_val, 2),
        avg_transaction=round(avg_val, 2),
        net_cash_flow=round(credits_val - debits_val, 2),
    )


# ---------------------------------------------------------------------------
# GET /api/trend/daily
# ---------------------------------------------------------------------------
@router.get("/trend/daily", response_model=list[DailyTrendItem])
def get_daily_trend(
    days: int = Query(default=30, ge=1, le=365),
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    from datetime import date, timedelta
    cutoff = (date.today() - timedelta(days=days)).isoformat()

    q = (
        db.query(
            Transaction.date.label("date"),
            func.sum(Transaction.amount).label("total_spend"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .filter(Transaction.date >= cutoff, Transaction.type == "debit")
    )
    if account_id:
        q = q.filter(Transaction.account_id == account_id)

    rows = q.group_by(Transaction.date).order_by(Transaction.date).all()
    return [
        DailyTrendItem(
            date=str(r.date),
            total_spend=round(float(r.total_spend), 2),
            transaction_count=r.transaction_count,
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /api/categories
# ---------------------------------------------------------------------------
@router.get("/categories", response_model=list[CategoryItem])
def get_categories(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = _base_query(db, account_id, start_date, end_date).filter(Transaction.type == "debit")
    rows = (
        q.with_entities(
            Transaction.category,
            func.sum(Transaction.amount).label("total_spend"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    return [
        CategoryItem(
            category=r.category,
            total_spend=round(float(r.total_spend), 2),
            transaction_count=r.transaction_count,
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /api/merchants/top
# ---------------------------------------------------------------------------
@router.get("/merchants/top", response_model=list[MerchantItem])
def get_top_merchants(
    limit: int = Query(default=10, ge=1, le=50),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Transaction).filter(Transaction.type == "debit")
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)

    rows = (
        q.with_entities(
            Transaction.merchant_name,
            func.sum(Transaction.amount).label("total_spend"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .group_by(Transaction.merchant_name)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
        .all()
    )
    return [
        MerchantItem(
            merchant_name=r.merchant_name,
            total_spend=round(float(r.total_spend), 2),
            transaction_count=r.transaction_count,
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# GET /api/transactions
# ---------------------------------------------------------------------------
@router.get("/transactions", response_model=TransactionListResponse)
def get_transactions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = _base_query(db, account_id, start_date, end_date)
    if category:
        q = q.filter(Transaction.category == category)
    if type:
        q = q.filter(Transaction.type == type)

    total = q.count()
    items = (
        q.order_by(Transaction.date.desc(), Transaction.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return TransactionListResponse(
        items=[
            TransactionRow(
                id=t.id,
                account_id=t.account_id,
                date=str(t.date),
                amount=t.amount,
                type=t.type,
                status=t.status,
                category=t.category,
                merchant_name=t.merchant_name,
                channel=t.channel,
                description=t.description,
            )
            for t in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )
