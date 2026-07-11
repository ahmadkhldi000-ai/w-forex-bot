# W Forex Bot — PostgreSQL Database Design

A production-grade schema for the W Forex Bot platform: **9 core tables**, explicit
relationships, primary/foreign keys, indexes, and a partitioning strategy that
scales to **thousands of users and millions of trade rows**.

> The canonical DDL lives in [`schema.sql`](./schema.sql). This document explains
> the *why* behind every decision.

---

## 1. Tables at a glance

| # | Table | Role | PK | Partitioned? |
|---|---|---|---|---|
| 1 | `users` | Platform accounts | `id` (BIGINT identity) | — |
| 2 | `mt5_accounts` | Linked MT5 trading accounts | `id` | — |
| 3 | `open_trades` | Currently-open positions (**hot**) | `id` | — |
| 4 | `closed_trades` | Historical trades (**cold/archive**) | `(id, close_time)` | ✅ monthly |
| 5 | `performance` | Equity/drawdown time-series | `(id, snapshot_time)` | ✅ monthly |
| 6 | `subscriptions` | User plan/entitlement | `id` | — |
| 7 | `payments` | Transactions / gateway records | `id` | — |
| 8 | `notifications` | User inbox | `id` | — |
| 9 | `audit_logs` | Compliance trail | `id` | — |

---

## 2. Entity-Relationship Diagram (text)

```
                       ┌─────────────┐
                       │    users    │
                       │─────────────│
                ┌──────│ id (PK)     │──────┐──────────┐──────────┐
                │      │ email (UQ)  │      │          │          │
                │      │ role/status │      │          │          │
                │      └─────────────┘      │          │          │
                │            ▲              │          │          │
        1:N (CASCADE)        │       1:N    │   1:N    │    1:N   │
                │            │ (SET NULL)   │(CASCADE) │   (CASCADE)
                │            │              │          │          │
        ┌───────┴──────┐ ┌───┴──────────┐ ┌─┴────────┐ │  ┌───────┴──────┐
        │ mt5_accounts │ │   payments   │ │ subscrip.│ │  │ notifications│
        │──────────────│ │──────────────│ │──────────│ │  │──────────────│
        │ id (PK)      │ │ id (PK)      │ │ id (PK)  │ │  │ id (PK)      │
        │ user_id (FK) │ │ user_id (FK) │ │ user_id  │ │  │ user_id (FK) │
        │ login+server │ │ subs_id (FK) │ │   (FK)   │ │  └──────────────┘
        │ (UQ)         │ │ gateway_tx   │ │ tier     │ │
        │ balance/equity│ │   (UQ)       │ │ status   │ │   payments also
        └──────┬───────┘ └──────────────┘ └─────┬────┘ │   links → subscriptions
               │                                │      │
        1:N (CASCADE)                    1:N (SET NULL)
               │                                │
       ┌───────┴────────┐               ┌───────┴────────┐
       │  open_trades   │ ──move on────▶│ closed_trades  │  (partitioned)
       │────────────────│    close      │────────────────│
       │ id (PK)        │               │ id             │
       │ mt5_ticket(UQ) │               │ close_time  } PK
       │ mt5_account_id │               │ profit/duration│
       │ user_id (FK)   │               │ partition: month│
       └────────────────┘               └────────────────┘

       ┌────────────────────┐          ┌──────────────────┐
       │   performance      │          │   audit_logs     │
       │────────────────────│          │──────────────────│
       │ id                 │          │ id (PK)          │
       │ snapshot_time   }PK│          │ user_id (FK)     │
       │ mt5_account_id(FK) │          │ admin_id         │
       │ partition: month   │          │ action / details │
       └────────────────────┘          └──────────────────┘
```

---

## 3. Key design decisions

### 3.1 BIGINT identity keys (not UUIDs)
Public-facing IDs are exposed via a separate `public_id` (UUID) column where needed
(e.g. shareable payment links), but **joins and PKs use `BIGINT GENERATED ALWAYS
AS IDENTITY`**. Rationale:
- **8 bytes** vs 16 for UUID → smaller indexes, faster joins, more rows per page.
- **Sequential** → B-tree inserts never cause page splits (critical under the
  high write rate of `open_trades` and `performance`).
- Hot tables (`open_trades`) get tiny, dense indexes.

### 3.2 Open vs Closed trades split
The current platform keeps all trades in one table with a `status` enum. For
scale, the design **splits them**:
- `open_trades` is a **small hot table** (dozens–hundreds of rows). Every dashboard
  load and every connector `trade_modify` updates it. Staying small = fast.
- `closed_trades` is a **large cold table** (millions of rows). It's append-mostly
  and never updated, so it's the perfect candidate for **partitioning**.

When a trade closes, a single transaction does `DELETE FROM open_trades ... RETURNING *`
then `INSERT INTO closed_trades ...`. Atomic, no orphans.

### 3.3 Partitioning strategy (the scalability core)
`closed_trades` and `performance` are **range-partitioned by month**. Why:
- **Query pruning** — "show me last week's trades" hits only one or two partitions,
  not the full history.
- **Archival** — old months detach in milliseconds (`DETACH PARTITION`) and move
  to cold storage without downtime.
- **Vacuum/maintenance** runs per-partition, not on a giant monolith.
- A `create_monthly_partitions()` function (in the DDL) pre-creates next month's
  partitions via `pg_cron` or a CI job so inserts **never land in the DEFAULT
  partition** (which would silently hurt performance).

**Capacity math:** at 1 trade/user/day across 5,000 users = ~150k trades/month ≈
~1.8M/year. One partition per month keeps each at ~150k rows — trivially fast.
Even at 10× that, a monthly partition stays under 2M rows.

### 3.4 Money vs price types
- **Money** (`balance`, `profit`, `amount`) → `NUMERIC(18,2)`. Exact, no rounding
  drift in financial reporting.
- **Prices/volumes** (`open_price`, `volume`) → `DOUBLE PRECISION`. Price
  precision is symbol-dependent (5/3 digits) and controlled at the app layer;
  DOUBLE is standard for tick data and halves storage vs NUMERIC.

### 3.5 Foreign keys & delete policies
Every FK has an explicit `ON DELETE`:
| Child | Parent | Policy | Why |
|---|---|---|---|
| `mt5_accounts.user_id` | `users` | CASCADE | user gone → purge their accounts |
| `open_trades.user_id` | `users` | SET NULL | keep the trade row for history/audit |
| `open_trades.mt5_account_id` | `mt5_accounts` | CASCADE | account deleted → drop live positions |
| `closed_trades.*` | `users/mt5_accounts` | SET NULL / CASCADE | never lose financial history |
| `payments.user_id` | `users` | SET NULL | financial record survives user deletion |
| `notifications.user_id` | `users` | CASCADE | inbox is personal, purged with user |

> Partitioned tables (`closed_trades`, `performance`) carry FKs **per partition**
> — a PostgreSQL requirement for partitioned parents.

### 3.6 Indexing strategy
- **Every FK column is indexed** (Postgres doesn't auto-index FKs).
- **Composite** where access patterns warrant it: `(user_id, is_read)` on
  notifications (unread-count queries), `(mt5_account_id, snapshot_time DESC)` on
  performance (equity-curve fetches).
- **Descending** time indexes (`created_at DESC`, `close_time DESC`) for the common
  "latest first" pagination pattern.
- Unique constraints double as covering indexes (`email`, `mt5_ticket`,
  `gateway_tx_id`, `login+server`).

### 3.7 Timestamps & UTC
All temporal columns are `TIMESTAMPTZ`, stored in UTC, with an
`updated_at` auto-touched by the `touch_updated_at()` trigger. This prevents
timezone bugs across the global user base and the MT5 server clock.

---

## 4. Per-table detail

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT identity | PK |
| `public_id` | TEXT UQ | UUID for external refs |
| `email` | TEXT UQ | login key |
| `password_hash` | TEXT | bcrypt hash |
| `role` | user_role | USER / VIP / PREMIUM |
| `status` | user_status | PENDING / ACTIVE / SUSPENDED / DELETED |
| `risk_accepted` | BOOLEAN | compliance gate |
| `last_login_ip` | INET | native IP type |

### `mt5_accounts`
Unique on `(login, server)` — the natural MT5 key. Holds live `balance/equity/
margin/drawdown` updated by the Web Connector. `is_master` flags the copy-trading
source; `is_active` the currently-traded account.

### `open_trades`
`mt5_ticket` is `UNIQUE` (MT5 guarantees uniqueness). Hot, small. Carries live
`profit/swap/commission` updated on every `trade_modify` event.

### `closed_trades`
Partitioned by `close_time`. Adds `net_profit`, `pips`, `duration_sec` — pre-computed
at close time so reports don't recompute. Composite PK `(id, close_time)` because
partitioning requires the partition key in the PK.

### `performance`
Time-series snapshot table (equity curve source). One row per connector push
(`full_sync` / `account` event). Partitioned monthly.

### `subscriptions`
`next_billing_at` index drives the "who to charge today" cron query. `end_date`
drives expiry sweeps.

### `payments`
`gateway_tx_id` UNIQUE prevents double-processing of webhook IPNs. `ipn_payload`
as `JSONB` stores the raw gateway callback for dispute/audit.

### `notifications`
Composite index `(user_id, is_read)` for the ubiquitous "unread count" badge query.

### `audit_logs`
`JSONB details` for flexible audit payloads. Indexed by `action`, `resource`,
and `created_at DESC`. `admin_id` is a plain BIGINT (admins live in a separate
`admins` table, kept out of this design scope).

---

## 5. Scalability checklist (thousands of users)

| Concern | Mitigation |
|---|---|
| Trade history grows unbounded | Monthly partitioning on `closed_trades` |
| Equity snapshots grow fast | Monthly partitioning on `performance` |
| Hot dashboard reads on live data | `open_trades` stays tiny (active positions only) |
| FK join overhead | BIGINT sequential keys + indexed FK columns |
| Webhook idempotency | `gateway_tx_id UNIQUE` + `ipn_payload` audit |
| Timezone correctness | `TIMESTAMPTZ` everywhere, UTC storage |
| Index bloat | Partition-level VACUUM/REINDEX; avoid indexes on low-cardinality columns alone |
| Concurrent writes from connector | `mt5_ticket UNIQUE` + upserts (no duplicate inserts) |
| Future growth | `create_monthly_partitions()` auto-provisions partitions |
| Reporting load | Cold partitions queryable without touching hot `open_trades` |

---

## 6. Example scaling queries

**Unread notification count (indexed):**
```sql
SELECT count(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE;
```

**Equity curve (last 24h, partition-pruned):**
```sql
SELECT snapshot_time, equity, drawdown_pct
FROM performance
WHERE mt5_account_id = $1
  AND snapshot_time > now() - INTERVAL '24 hours'
ORDER BY snapshot_time;
```

**User P&L this month (single partition scan):**
```sql
SELECT symbol,
       count(*) AS trades,
       sum(net_profit) AS pnl,
       avg(duration_sec) AS avg_hold
FROM closed_trades
WHERE user_id = $1
  AND close_time >= date_trunc('month', now())
GROUP BY symbol
ORDER BY pnl DESC;
```

**Daily active accounts (maintenance):**
```sql
SELECT count(DISTINCT mt5_account_id)
FROM open_trades
WHERE updated_at > now() - INTERVAL '24 hours';
```

---

## 7. Applying this design

This `schema.sql` is the **reference design** for a clean PostgreSQL deployment.
The live application currently uses Prisma (`../schema.prisma`), which models the
same domain with a single `Trade` table. To adopt this split/partitioned design:

1. Run `schema.sql` against a fresh database, **or**
2. Migrate incrementally: add `open_trades`/`closed_trades`, backfill from `trades`,
   then partition (Prisma supports raw migrations alongside its schema).

Either way, the table structure, relationships, indexes, and partitioning strategy
above are the target architecture for scaling to thousands of users.
