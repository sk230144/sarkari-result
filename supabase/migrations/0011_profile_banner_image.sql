-- Custom banner image. When set it replaces the preset gradient; picking a
-- preset again clears it. Files live in the public `avatars` bucket under
-- banners/{user_id}/ and are written only by the API.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

NOTIFY pgrst, 'reload schema';
