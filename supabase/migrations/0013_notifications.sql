-- Notifications are built from events that already exist (messages,
-- endorsements, profile views, referrals); this only records when the user
-- last opened the bell, so anything newer counts as unread. Written by the
-- API with the service role.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_seen_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
