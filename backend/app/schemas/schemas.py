from pydantic import BaseModel
from typing import List
import datetime


class SummaryResponse(BaseModel):
    total_transactions: int
    total_spend: float
    avg_transaction: float
    net_cash_flow: float


class DailyTrendItem(BaseModel):
    date: str
    total_spend: float
    transaction_count: int


class CategoryItem(BaseModel):
    category: str
    total_spend: float
    transaction_count: int


class MerchantItem(BaseModel):
    merchant_name: str
    total_spend: float
    transaction_count: int


class TransactionRow(BaseModel):
    id: int
    account_id: int
    date: str
    amount: float
    type: str
    status: str
    category: str
    merchant_name: str
    channel: str
    description: str | None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    items: List[TransactionRow]
    total: int
    page: int
    page_size: int
