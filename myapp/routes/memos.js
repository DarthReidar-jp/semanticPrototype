const express = require('express');
const router = express.Router();
const Memo = require('../models/memo'); // Memo モデルをインポート
const { connectDB } = require('../db'); // データベース接続関数をインポート
const { ObjectId } = require('mongodb');
const { getMemoVector } = require('../utils/openaiUtils');

// メモ一覧を表示するルート
router.get('/', async (req, res) => {
  try {
    const db = await connectDB(); // データベースに接続
    const collection = db.collection('memos'); // 'memos' コレクションを取得
    const memos = (await collection.find({}).toArray()).map(memo => ({
      _id:memo._id,
      title: memo.title,
      content: memo.content
      // ベクトルは除外
    })); // 全てのメモを取得
    res.render('memo_form', { memos }); // 'memo_form' テンプレートに memos を渡して表示
  } catch (e) {
    res.status(500).send(e.toString()); // エラーが発生した場合はエラーページを表示
  }
});

// 新しいメモを作成するルート
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body; // リクエストボディからタイトルと内容を取得
    const vector = await getMemoVector(content)//メモのベクトルを取得
    const memo = new Memo(title, content, vector); // Memo モデルを使って新しいメモを作成

    const db = await connectDB(); // データベースに接続
    const collection = db.collection('memos'); // 'memos' コレクションを取得
    await collection.insertOne(memo); // メモをデータベースに挿入
    res.redirect('/memos'); // メモを追加した後のサイト
  } catch (e) {
    res.status(500).send(e.toString()); // エラーが発生した場合はエラーページを表示
  }
});


// メモを削除するルート
router.post('/delete/:id', async (req, res) => {
  try {
    console.log('削除リクエスト受信:', req.params.id); // デバッグ: リクエストIDのログを出力
    const db = await connectDB();
    const collection = db.collection('memos');
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/memos');
  } catch (e) {
    console.error('削除中のエラー:', e); // エラー発生時のログを出力
    res.status(500).send(e.toString());
  }
});



module.exports = router; // ルーターをエクスポート
