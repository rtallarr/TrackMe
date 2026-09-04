ALTER TABLE users
ADD COLUMN password_hash TEXT NOT NULL;

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_snapshots (
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, snapshot_id)
);

<-- no lo cree-->
CREATE INDEX idx_card_snapshots_snapshot_id
    ON card_snapshots(snapshot_id);

<-- no lo cree-->
CREATE INDEX idx_sessions_user_id
    ON sessions(user_id);

<-- no lo cree-->
CREATE INDEX idx_sessions_expires_at
    ON sessions(expires_at);