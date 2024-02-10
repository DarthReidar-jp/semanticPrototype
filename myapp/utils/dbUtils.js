// utils/dbUtils.js
const { connectDB } = require('../db');

async function getDBCollection(collectionName) {
  const db = await connectDB();
  return db.collection(collectionName);
}

module.exports = { getDBCollection };
