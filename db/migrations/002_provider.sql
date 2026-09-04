ALTER TABLE snapshots
ADD COLUMN provider VARCHAR(20) NOT NULL;

CREATE INDEX idx_snapshots_user_provider
    ON snapshots(user_id, provider);