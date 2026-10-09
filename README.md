# Banking Transaction Analytics

Full-stack localhost dashboard — FastAPI + SQLite backend, React + TypeScript + Recharts frontend.

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |

## Backend Setup

```bash
cd banking-analytics/backend

# 1. Create & activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed the database  (creates banking.db with 500–800 mock transactions)
python -m app.seed
```

## Run Backend

```bash
# From banking-analytics/backend/ with venv active
uvicorn app.main:app --reload
```

- API root: http://localhost:8000  
- Interactive docs: http://localhost:8000/docs

## Frontend Setup

```bash
cd banking-analytics/frontend
npm install
```

## Run Frontend

```bash
# From banking-analytics/frontend/
npm run dev
```

Dashboard: http://localhost:5173

## Architecture

```
[SQLite DB] ←seed→ [FastAPI :8000] ←REST→ [React Vite :5173]
```

## API Endpoints

| Method | Path | Query Params | Purpose |
|--------|------|-------------|---------|
| GET | `/api/summary` | `account_id?`, `start_date?`, `end_date?` | KPI cards |
| GET | `/api/trend/daily` | `days?=30`, `account_id?` | Daily spend line chart |
| GET | `/api/categories` | `start_date?`, `end_date?`, `account_id?` | Category donut chart |
| GET | `/api/merchants/top` | `limit?=10`, `start_date?`, `end_date?` | Top merchants |
| GET | `/api/transactions` | `page?=1`, `page_size?=20`, `start_date?`, `end_date?`, `category?`, `type?`, `account_id?` | Paginated table |

## Dashboard Widgets

1. **Summary Cards** — Total Transactions, Total Spend, Avg Transaction, Net Cash Flow  
2. **Daily Trend** — 30-day spend line chart  
3. **Category Donut** — Spend breakdown by category  
4. **Top Merchants** — Ranked bar list of top 10 merchants  
5. **Transaction Table** — Paginated, filterable (date / category / type), CSV export  

## Notes

- No authentication required — single-user localhost app  
- Re-seed at any time: `python -m app.seed` (idempotent — clears and re-seeds)  
- Backend must be running before opening the frontend  
