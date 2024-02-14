const { MongoClient } = require('mongodb');
const { dbUri } = require('../dbConfig'); // dbConfig.jsからdbUriをインポート
const uri = dbUri;
const client = new MongoClient(uri);

let dbInstance = null; // dbInstance を初期化する

// MongoDB データベースへの接続を管理する関数
async function connectDB() {
  //console.log(dbInstance); // 現在の dbInstance の状態をログに出力

  // 既に接続が確立されている場合、既存の接続を再利用
  if (dbInstance) {
    return dbInstance;            
  }

  try {
    // MongoDB データベースに接続を試みる
    await client.connect();

    // 接続が成功した場合、データベース名 "knowledge" を指定して dbInstance を設定
    dbInstance = client.db("xr-knowledge-base");
    //console.log(dbInstance); // 接続成功時に dbInstance の状態をログに出力
    return dbInstance; // dbInstance を返してアプリケーション内で使用可能にする
  } catch (error) {
    // エラーハンドリング: 接続中にエラーが発生した場合
    console.error("MongoDBに接続中にエラーが発生しました:", error);
    throw error; // エラーを再スローしてハンドリングできるようにする
  }
}

module.exports = { connectDB }; // connectDB 関数をモジュールとしてエクスポート
