/**
 * Fail fast with clear errors if required env vars are missing.
 * In non-production, JWT_SECRET gets an insecure default so `npm run dev` still starts
 * when only MONGODB_URI is configured (common student setup).
 */
function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI?.trim()) missing.push('MONGODB_URI');
  if (missing.length) {
    console.error(
      `[env] Missing: ${missing.join(', ')}. Set MONGODB_URI in backend/.env`
    );
    console.error(
      '[env] Go to MongoDB Atlas (https://cloud.mongodb.com), create a cluster, and copy the connection string.'
    );
    process.exit(1);
  }

  if (!process.env.JWT_SECRET?.trim()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[env] JWT_SECRET is required in production. Set it in backend/.env');
      process.exit(1);
    }
    process.env.JWT_SECRET =
      'dev_only_insecure_jwt_secret_change_in_env_for_production________';
    console.warn(
      '[env] JWT_SECRET not set; using a development default. Add JWT_SECRET to backend/.env before production.'
    );
  }
}

module.exports = validateEnv;
