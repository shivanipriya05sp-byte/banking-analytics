"""
Seed script — generates 500-800 realistic mock transactions into banking.db.
Safe to re-run: clears and re-seeds each time.

Run from the backend/ directory:
    python -m app.seed
"""
import random
from datetime import date, timedelta

from app.database import Base, engine, SessionLocal
from app.models.models import Account, Transaction

# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

CATEGORY_MERCHANTS: dict[str, list[str]] = {
    "Food":          ["McDonald's", "Starbucks", "Chipotle", "Whole Foods", "DoorDash", "Uber Eats"],
    "Travel":        ["Delta Airlines", "Marriott Hotels", "Airbnb", "Uber", "Lyft", "Expedia"],
    "Utilities":     ["Con Edison", "AT&T", "Comcast", "Verizon", "National Grid", "Water Dept"],
    "Retail":        ["Amazon", "Walmart", "Target", "Best Buy", "Costco", "Nike"],
    "Entertainment": ["Netflix", "Spotify", "Steam", "AMC Theaters", "Hulu", "Apple TV+"],
    "Healthcare":    ["CVS Pharmacy", "Walgreens", "BlueCross Insurance", "LabCorp", "City Hospital"],
    "Education":     ["Coursera", "Udemy", "Amazon Textbooks", "College Board", "Pearson"],
    "Transfers":     ["Venmo", "PayPal", "Zelle", "Wire Transfer", "ACH Transfer"],
}

CATEGORY_AMOUNT_RANGE: dict[str, tuple[float, float]] = {
    "Food":          (5.0,   120.0),
    "Travel":        (50.0,  800.0),
    "Utilities":     (40.0,  250.0),
    "Retail":        (10.0,  400.0),
    "Entertainment": (5.0,   50.0),
    "Healthcare":    (15.0,  500.0),
    "Education":     (10.0,  300.0),
    "Transfers":     (20.0, 1500.0),
}

CATEGORIES = list(CATEGORY_MERCHANTS.keys())
CHANNELS = ["online", "atm", "branch", "mobile"]
STATUSES = ["success", "success", "success", "pending", "failed"]  # weighted


def _random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def _random_amount(category: str) -> float:
    lo, hi = CATEGORY_AMOUNT_RANGE[category]
    # Skew toward lower end with a rough normal feel
    raw = random.triangular(lo, hi, lo + (hi - lo) * 0.35)
    return round(raw, 2)


def seed() -> None:
    # Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ---- Accounts ----
        accounts = [
            Account(name="Primary Checking",  account_type="checking", currency="USD", balance=12_450.00),
            Account(name="Savings Account",   account_type="savings",  currency="USD", balance=34_200.00),
            Account(name="Business Credit",   account_type="credit",   currency="USD", balance=-4_800.00),
        ]
        db.add_all(accounts)
        db.flush()  # assign IDs

        account_ids = [a.id for a in accounts]

        # ---- Transactions ----
        end_date = date.today()
        start_date = end_date - timedelta(days=365)

        total = random.randint(500, 800)
        txns: list[Transaction] = []

        for _ in range(total):
            category = random.choice(CATEGORIES)
            merchant = random.choice(CATEGORY_MERCHANTS[category])
            amount = _random_amount(category)
            txn_type = "credit" if category == "Transfers" and random.random() < 0.3 else "debit"
            txns.append(Transaction(
                account_id=random.choice(account_ids),
                date=_random_date(start_date, end_date),
                amount=amount,
                type=txn_type,
                status=random.choice(STATUSES),
                category=category,
                merchant_name=merchant,
                channel=random.choice(CHANNELS),
                description=f"{category} purchase at {merchant}",
            ))

        db.add_all(txns)
        db.commit()
        print(f"Seeded {len(accounts)} accounts and {len(txns)} transactions into banking.db")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
