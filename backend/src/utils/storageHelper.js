const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const uploadsRoot = path.join(__dirname, '../../uploads');

const isSupabaseStorageEnabled = () =>
  process.env.STORAGE_PROVIDER === 'supabase' &&
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_BUCKET;

const getSupabaseClient = () => {
  if (!isSupabaseStorageEnabled()) {
    return null;
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const buildSafeFilename = (originalname = 'archivo') => {
  const extension = path.extname(originalname) || '.jpg';
  const baseName = path
    .basename(originalname, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'archivo';

  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${baseName}${extension}`;
};

const uploadFileToStorage = async (file, folder = 'tatuajes') => {
  if (!file) {
    return '';
  }

  if (!isSupabaseStorageEnabled()) {
    return `/uploads/${file.filename}`;
  }

  const client = getSupabaseClient();
  const bucket = process.env.SUPABASE_BUCKET;
  const relativePath = `${folder}/${buildSafeFilename(file.originalname)}`;

  const { error } = await client.storage.from(bucket).upload(relativePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(bucket).getPublicUrl(relativePath);
  return data.publicUrl;
};

const getSupabasePathFromUrl = (value = '') => {
  if (!value || !process.env.SUPABASE_URL || !process.env.SUPABASE_BUCKET) {
    return null;
  }

  const basePrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`;

  if (!value.startsWith(basePrefix)) {
    return null;
  }

  return value.slice(basePrefix.length);
};

const safeDeleteStoredFile = async (value) => {
  if (!value) {
    return;
  }

  if (value.startsWith('/uploads/')) {
    const absolutePath = path.join(uploadsRoot, value.replace('/uploads/', ''));

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    return;
  }

  const storagePath = getSupabasePathFromUrl(value);

  if (storagePath && isSupabaseStorageEnabled()) {
    const client = getSupabaseClient();
    await client.storage.from(process.env.SUPABASE_BUCKET).remove([storagePath]);
  }
};

const ensureStorageReady = async () => {
  if (!isSupabaseStorageEnabled()) {
    return;
  }

  const client = getSupabaseClient();
  const bucket = process.env.SUPABASE_BUCKET;
  const { data: buckets, error } = await client.storage.listBuckets();

  if (error) {
    throw error;
  }

  const exists = buckets.some((item) => item.name === bucket);

  if (!exists) {
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });

    if (createError) {
      throw createError;
    }
  }
};

module.exports = {
  ensureStorageReady,
  isSupabaseStorageEnabled,
  uploadFileToStorage,
  safeDeleteStoredFile,
};
