const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/zoo_management';

async function checkLocal() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to local MongoDB');
    const adminDocs = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();
    console.log('Admin users found:', adminDocs.length);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', '));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkLocal();
