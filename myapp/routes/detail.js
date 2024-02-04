// routes/detail.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const { ObjectId } = require('mongodb');
const { getMemoVector } = require('../utils/openaiUtils');

// メモの詳細を表示
router.get('/:id', async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('memos');
        const memo = await collection.findOne({ _id: new ObjectId(req.params.id) });
        res.render('detail', { memo });
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

// メモの編集を処理
router.post('/edit/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const db = await connectDB();
        const collection = db.collection('memos');
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, content } }
        );
        res.redirect(`/detail/${req.params.id}`);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

// メモの再エンベディングを処理
router.post('/reembed/:id', async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('memos');
        const memo = await collection.findOne({ _id: new ObjectId(req.params.id) });
        const vector = await getMemoVector(memo.content);
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { vector } }
        );
        res.redirect(`/detail/${req.params.id}`);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

//削除
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

module.exports = router;
