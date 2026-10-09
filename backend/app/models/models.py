from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)   # checking | savings | credit
    currency = Column(String, default="USD")
    balance = Column(Float, default=0.0)

    transactions = relationship("Transaction", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)           # credit | debit
    status = Column(String, nullable=False)         # success | pending | failed
    category = Column(String, nullable=False, index=True)
    merchant_name = Column(String, nullable=False)
    channel = Column(String, nullable=False)        # online | atm | branch | mobile
    description = Column(String, nullable=True)

    account = relationship("Account", back_populates="transactions")
