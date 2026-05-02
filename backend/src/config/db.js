const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
      console.error('[db] MONGODB_URI is missing in backend/.env');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
    });

    console.log(
      `[db] MongoDB connected successfully: ${conn.connection.host} (database: ${conn.connection.name})`
    );
  } catch (err) {
<<<<<<< HEAD
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    console.error(
      '[db] Check MONGODB_URI value and MongoDB Atlas network/database user settings.'
    );
=======
    const msg = String(err?.message || '');
    console.error('MongoDB connection error:', msg);
    console.error('');
    console.error('Fix:');
    if (/querySrv|ENOTFOUND|getaddrinfo/i.test(msg)) {
      console.error('  • DNS / hostname: Atlas could not be resolved. This is usually not an IP whitelist issue.');
      console.error('  • In Atlas → Database → Connect, copy the connection string again (cluster name must match).');
      console.error('  • Confirm the cluster exists, is not paused, and your network allows DNS (try another Wi‑Fi/VPN/off).');
      console.error('  • If SRV DNS keeps failing, use the non-SRV string from Atlas (“Drivers” often lists mongodb://… with host:port).');
    } else {
      console.error('  • Atlas → Network Access → add your current IP (or 0.0.0.0/0 for dev only).');
      console.error('  • Check MONGODB_URI in backend/.env matches Atlas (user, password, and cluster host).');
    }
    console.error('');
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
    process.exit(1);
  }
};

module.exports = connectDB;
