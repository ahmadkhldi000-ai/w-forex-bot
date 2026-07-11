-- ====================================================================
--  W-FOREX-BOT · PostgreSQL Database Schema (Reference Design)
--  ------------------------------------------------------------------
--  Target: PostgreSQL 14+
--  Scale: thousands of users, millions of trade rows, high-frequency
--         inserts from the MT5 Web Connector.
--
--  Conventions
--  -----------
--  • Primary keys: BIGINT GENERATED ALWAYS AS IDENTITY (compact, fast
--    joins, sequential B-tree inserts). Public-facing IDs can be
--    surfaced via a separate cuid/uuid column where needed.
--  • Timestamps: TIMESTAMPTZ, stored in UTC.
--  • Monetary values: NUMERIC(18,2) — exact, no float drift.
--  • Prices/lots:  DOUBLE PRECISION (price data; precision controlled
--    at the application layer per-symbol digits).
--  • Enums declared as native PG ENUMs (rigid, indexed, self-doc).
--  • Every FK carries an explicit ON DELETE policy.
--  • Trade history is partitioned by month for scalability (see
--    closed_trades). Open trades stay in a small hot table.
-- ====================================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ====================================================================
--  ENUMS
-- ====================================================================
CREATE TYPE user_role        AS ENUM ('USER', 'VIP', 'PREMIUM');
CREATE TYPE user_status      AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE mt5_conn_state   AS ENUM ('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR');
CREATE TYPE trade_type       AS ENUM ('BUY', 'SELL');
CREATE TYPE trade_status     AS ENUM ('PENDING', 'OPEN', 'CLOSED');
CREATE TYPE subs_tier        AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE subs_status      AS ENUM ('TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE');
CREATE TYPE payment_status   AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'EXPIRED');
CREATE TYPE payment_method   AS ENUM ('USDT_TRC20', 'USDT_ERC20', 'BTC', 'ETH', 'TRX');
CREATE TYPE billing_cycle    AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');
CREATE TYPE notif_type       AS ENUM ('SYSTEM', 'PAYMENT', 'SUBSCRIPTION', 'TRADE', 'RISK');
CREATE TYPE log_level        AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- ====================================================================
--  1. USERS
-- ====================================================================
CREATE TABLE users (
    id              BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       TEXT         NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    email           TEXT         NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    name            TEXT,
    phone           TEXT,
    avatar_url      TEXT,
    role            user_role   NOT NULL DEFAULT 'USER',
    status          user_status NOT NULL DEFAULT 'PENDING',
    risk_accepted   BOOLEAN      NOT NULL DEFAULT FALSE,
    risk_accepted_at TIMESTAMPTZ,
    -- account linkage / compliance
    country         TEXT,
    last_login_at   TIMESTAMPTZ,
    last_login_ip   INET,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_status     ON users (status);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_created_at ON users (created_at);
-- email already unique-indexed above


-- ====================================================================
--  2. MT5 ACCOUNTS
--  One user may link several MT5 accounts (copy-trading targets).
--  The Web Connector streams live balance/equity/drawdown here.
--  login + server is the natural unique key from MT5.
-- ====================================================================
CREATE TABLE mt5_accounts (
    id              BIGINT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       TEXT           NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    user_id         BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    label           TEXT           NOT NULL,                  -- "Main Prop Firm"
    login           TEXT           NOT NULL,                  -- MT5 account number
    server          TEXT           NOT NULL,                  -- "ICMarkets-Live"
    password_enc    TEXT           NOT NULL,                  -- AES-256 at app layer

    -- trading profile
    currency        TEXT           NOT NULL DEFAULT 'USD',
    leverage        INT            NOT NULL DEFAULT 100,
    balance         NUMERIC(18,2)  NOT NULL DEFAULT 0,
    equity          NUMERIC(18,2)  NOT NULL DEFAULT 0,
    margin          NUMERIC(18,2)  NOT NULL DEFAULT 0,
    free_margin     NUMERIC(18,2)  NOT NULL DEFAULT 0,

    -- live risk metrics (updated by connector)
    drawdown        NUMERIC(18,2)  NOT NULL DEFAULT 0,
    drawdown_pct    NUMERIC(18,2)  NOT NULL DEFAULT 0,

    -- connection state
    conn_state      mt5_conn_state NOT NULL DEFAULT 'DISCONNECTED',
    is_master       BOOLEAN        NOT NULL DEFAULT FALSE,    -- copy source
    is_active       BOOLEAN        NOT NULL DEFAULT FALSE,    -- currently traded
    last_connected_at TIMESTAMPTZ,
    last_error      TEXT,

    created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT uq_mt5_login_server UNIQUE (login, server)
);

CREATE INDEX idx_mt5_user_id      ON mt5_accounts (user_id);
CREATE INDEX idx_mt5_is_active    ON mt5_accounts (is_active);
CREATE INDEX idx_mt5_is_master    ON mt5_accounts (is_master);
CREATE INDEX idx_mt5_conn_state   ON mt5_accounts (conn_state);


-- ====================================================================
--  3. OPEN TRADES  (hot table — small, constantly updated)
--  Only currently-open positions live here. On close, the row is
--  moved to closed_trades (DELETE + INSERT) inside a transaction,
--  keeping this table lean for fast dashboard queries.
-- ====================================================================
CREATE TABLE open_trades (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mt5_ticket      BIGINT        NOT NULL UNIQUE,             -- MT5 position ticket
    user_id         BIGINT        REFERENCES users(id)         ON DELETE SET NULL,
    mt5_account_id  BIGINT        NOT NULL REFERENCES mt5_accounts(id) ON DELETE CASCADE,

    symbol          TEXT          NOT NULL,
    type            trade_type    NOT NULL,
    volume          DOUBLE PRECISION NOT NULL DEFAULT 0,
    open_price      DOUBLE PRECISION NOT NULL,
    current_price   DOUBLE PRECISION NOT NULL DEFAULT 0,
    sl              DOUBLE PRECISION,
    tp              DOUBLE PRECISION,

    -- live PnL (recomputed/updated by connector modify events)
    profit          NUMERIC(18,2) NOT NULL DEFAULT 0,
    swap            NUMERIC(18,2) NOT NULL DEFAULT 0,
    commission      NUMERIC(18,2) NOT NULL DEFAULT 0,

    open_time       TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_open_user        ON open_trades (user_id);
CREATE INDEX idx_open_account     ON open_trades (mt5_account_id);
CREATE INDEX idx_open_symbol      ON open_trades (symbol);
CREATE INDEX idx_open_open_time   ON open_trades (open_time);


-- ====================================================================
--  4. CLOSED TRADES  (history — large, append-mostly)
--  Partitioned BY RANGE on close_time (monthly). This is the key
--  scalability mechanism: millions of closed trades stay fast because
--  queries hit only the relevant partitions, and old partitions can be
--  detached/archived without downtime.
-- ====================================================================
CREATE TABLE closed_trades (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY,
    mt5_ticket      BIGINT        NOT NULL,
    user_id         BIGINT,
    mt5_account_id  BIGINT,

    symbol          TEXT          NOT NULL,
    type            trade_type    NOT NULL,
    volume          DOUBLE PRECISION NOT NULL DEFAULT 0,
    open_price      DOUBLE PRECISION NOT NULL,
    close_price     DOUBLE PRECISION NOT NULL,
    sl              DOUBLE PRECISION,
    tp              DOUBLE PRECISION,

    profit          NUMERIC(18,2) NOT NULL DEFAULT 0,
    swap            NUMERIC(18,2) NOT NULL DEFAULT 0,
    commission      NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_profit      NUMERIC(18,2) NOT NULL DEFAULT 0,
    pips            NUMERIC(10,1) NOT NULL DEFAULT 0,
    duration_sec    INT           NOT NULL DEFAULT 0,

    open_time       TIMESTAMPTZ   NOT NULL,
    close_time      TIMESTAMPTZ   NOT NULL,

    PRIMARY KEY (id, close_time)
) PARTITION BY RANGE (close_time);

-- Bootstrap partitions (create future ones via pg_cron / scheduled job)
CREATE TABLE closed_trades_2026_07 PARTITION OF closed_trades
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE closed_trades_2026_08 PARTITION OF closed_trades
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE closed_trades_default PARTITION OF closed_trades DEFAULT;

-- Non-unique indexes (PK already covers id+close_time)
CREATE INDEX idx_closed_user        ON closed_trades (user_id);
CREATE INDEX idx_closed_account     ON closed_trades (mt5_account_id);
CREATE INDEX idx_closed_symbol      ON closed_trades (symbol);
CREATE INDEX idx_closed_close_time  ON closed_trades (close_time DESC);
-- FKs are added per-partition (PG limitation for partitioned tables)
ALTER TABLE closed_trades_2026_07
    ADD CONSTRAINT fk_closed_07_user    FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_closed_07_account FOREIGN KEY (mt5_account_id) REFERENCES mt5_accounts(id) ON DELETE CASCADE;
ALTER TABLE closed_trades_2026_08
    ADD CONSTRAINT fk_closed_08_user    FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_closed_08_account FOREIGN KEY (mt5_account_id) REFERENCES mt5_accounts(id) ON DELETE CASCADE;


-- ====================================================================
--  5. PERFORMANCE  (time-series snapshots)
--  One row per account snapshot pushed by the connector. Powers equity
--  curves, drawdown charts, and rolling stats. Partitioned monthly like
--  closed_trades for the same scalability reason.
-- ====================================================================
CREATE TABLE performance (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY,
    mt5_account_id  BIGINT        NOT NULL,

    balance         NUMERIC(18,2) NOT NULL,
    equity          NUMERIC(18,2) NOT NULL,
    margin          NUMERIC(18,2) NOT NULL,
    drawdown        NUMERIC(18,2) NOT NULL DEFAULT 0,
    drawdown_pct    NUMERIC(18,2) NOT NULL DEFAULT 0,

    open_trades     INT           NOT NULL DEFAULT 0,
    win_rate        NUMERIC(5,2)  NOT NULL DEFAULT 0,
    realized_pnl    NUMERIC(18,2) NOT NULL DEFAULT 0,
    floating_pnl    NUMERIC(18,2) NOT NULL DEFAULT 0,

    snapshot_time   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    PRIMARY KEY (id, snapshot_time)
) PARTITION BY RANGE (snapshot_time);

CREATE TABLE performance_2026_07 PARTITION OF performance
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE performance_2026_08 PARTITION OF performance
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE performance_default PARTITION OF performance DEFAULT;

CREATE INDEX idx_perf_account_time ON performance (mt5_account_id, snapshot_time DESC);
ALTER TABLE performance_2026_07
    ADD CONSTRAINT fk_perf_07_account FOREIGN KEY (mt5_account_id) REFERENCES mt5_accounts(id) ON DELETE CASCADE;
ALTER TABLE performance_2026_08
    ADD CONSTRAINT fk_perf_08_account FOREIGN KEY (mt5_account_id) REFERENCES mt5_accounts(id) ON DELETE CASCADE;


-- ====================================================================
--  6. SUBSCRIPTIONS
-- ====================================================================
CREATE TABLE subscriptions (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       TEXT          NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    user_id         BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    tier            subs_tier     NOT NULL,
    status          subs_status   NOT NULL DEFAULT 'ACTIVE',
    billing_cycle   billing_cycle NOT NULL DEFAULT 'MONTHLY',

    amount          NUMERIC(18,2) NOT NULL DEFAULT 0,
    currency        TEXT          NOT NULL DEFAULT 'USD',

    start_date      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    end_date        TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,

    -- convenience: when the next payment is due
    next_billing_at TIMESTAMPTZ,

    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_subs_user_id     ON subscriptions (user_id);
CREATE INDEX idx_subs_status      ON subscriptions (status);
CREATE INDEX idx_subs_end_date    ON subscriptions (end_date);
CREATE INDEX idx_subs_next_bill   ON subscriptions (next_billing_at);


-- ====================================================================
--  7. PAYMENTS
-- ====================================================================
CREATE TABLE payments (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       TEXT          NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    user_id         BIGINT        REFERENCES users(id)         ON DELETE SET NULL,
    subscription_id BIGINT        REFERENCES subscriptions(id) ON DELETE SET NULL,

    gateway         TEXT          NOT NULL DEFAULT 'paymento', -- paymento | stripe
    gateway_tx_id   TEXT          UNIQUE,                      -- gateway transaction id

    amount          NUMERIC(18,2) NOT NULL,
    currency        TEXT          NOT NULL DEFAULT 'USD',
    method          payment_method,
    status          payment_status NOT NULL DEFAULT 'PENDING',

    guest_email     TEXT,                                       -- guest checkout
    ipn_received    BOOLEAN       NOT NULL DEFAULT FALSE,
    ipn_verified    BOOLEAN       NOT NULL DEFAULT FALSE,
    ipn_payload     JSONB,                                      -- raw webhook audit

    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_payments_user_id     ON payments (user_id);
CREATE INDEX idx_payments_subs_id     ON payments (subscription_id);
CREATE INDEX idx_payments_status      ON payments (status);
CREATE INDEX idx_payments_created_at  ON payments (created_at);


-- ====================================================================
--  8. NOTIFICATIONS
-- ====================================================================
CREATE TABLE notifications (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type            notif_type    NOT NULL DEFAULT 'SYSTEM',
    title           TEXT          NOT NULL,
    message         TEXT          NOT NULL,
    is_read         BOOLEAN       NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    -- optional link to a related resource
    resource_type   TEXT,                                       -- 'payment' | 'trade' ...
    resource_id     TEXT,

    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user_id        ON notifications (user_id);
CREATE INDEX idx_notif_user_unread    ON notifications (user_id, is_read);
CREATE INDEX idx_notif_created_at     ON notifications (created_at DESC);


-- ====================================================================
--  9. AUDIT LOGS  (compliance)
-- ====================================================================
CREATE TABLE audit_logs (
    id              BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    admin_id        BIGINT,                                    -- admins live in separate table
    action          TEXT          NOT NULL,                    -- 'USER_LOGIN' | 'PAYMENT_REFUND' ...
    resource        TEXT,                                       -- 'user' | 'payment' | 'subscription'
    resource_id     TEXT,

    level           log_level     NOT NULL DEFAULT 'INFO',
    details         JSONB,
    ip_address      INET,
    user_agent      TEXT,

    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user_id        ON audit_logs (user_id);
CREATE INDEX idx_audit_admin_id       ON audit_logs (admin_id);
CREATE INDEX idx_audit_action         ON audit_logs (action);
CREATE INDEX idx_audit_created_at     ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_resource       ON audit_logs (resource, resource_id);


-- ====================================================================
--  TRIGGERS — keep updated_at fresh on every row
-- ====================================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_touch        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_mt5_touch          BEFORE UPDATE ON mt5_accounts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_subs_touch         BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_payments_touch     BEFORE UPDATE ON payments     FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_open_trades_touch  BEFORE UPDATE ON open_trades  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- ====================================================================
--  PARTITION MAINTENANCE (run monthly via pg_cron or CI job)
--  Creates next month's partitions before they're needed so inserts
--  never hit the DEFAULT partition (which would hurt performance).
-- ====================================================================
CREATE OR REPLACE FUNCTION create_monthly_partitions(target_date DATE DEFAULT now()::date)
RETURNS VOID AS $$
DECLARE
    part_name TEXT;
    start_d DATE;
    end_d   DATE;
BEGIN
    -- closed_trades
    start_d := date_trunc('month', target_date)::date;
    end_d   := (start_d + INTERVAL '1 month')::date;
    part_name := 'closed_trades_' || to_char(start_d, 'YYYY_MM');
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF closed_trades FOR VALUES FROM (%L) TO (%L)', part_name, start_d, end_d);

    -- performance
    part_name := 'performance_' || to_char(start_d, 'YYYY_MM');
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF performance FOR VALUES FROM (%L) TO (%L)', part_name, start_d, end_d);
END;
$$ LANGUAGE plpgsql;
