// routes/display.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');


// 表示画面（メモ一覧と検索機能）
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const foldersCollection = db.collection('folders');
    const folders = await foldersCollection.find({}).toArray();
    const memosCollection = db.collection('memos');
    const memos = await memosCollection.find({}).toArray();
    res.render('display', { folders, memos }); // フォルダとメモのデータを渡す
  } catch (e) {
    res.status(500).send(e.toString());
  }
});


module.exports = router;
