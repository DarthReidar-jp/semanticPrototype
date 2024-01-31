const { MongoClient } = require('mongodb');
const { dbUri } = require('../dbConfig'); // dbConfig.jsからdbUriをインポート
const uri = dbUri;
const client = new MongoClient(uri);

let dbInstance = null; // dbInstance を初期化する

async function connectDB() {
  console.log(dbInstance)
  if (dbInstance) {
    return dbInstance;
  }

  try {
    await client.connect();
    dbInstance = client.db("knowledge");
    console.log(dbInstance)
    return dbInstance;
  } catch (error) {
    console.error("MongoDBに接続中にエラーが発生しました:", error);
    throw error; // エラーを再スローしてハンドリングできるようにする
  }
}

module.exports = { connectDB };