// routes/display.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const { getQueryVector } = require('../utils/openaiUtils');

// 表示画面（メモ一覧と検索機能）
router.get('/', async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('memos');
        const memos = await collection.find({}).toArray();
        res.render('display', { memos }); // 一覧表示のテンプレートを表示
    } catch (e) {
        res.status(500).send(e.toString());
    }
});



// ベクトル検索結果
router.get('/search', async (req, res) => {
    const query = req.query.query;
    const queryVector = await getQueryVector(query);

    try {
        const db = await connectDB();
        const collection = db.collection('memos');
        const agg = [
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'vector',
                    'queryVector': queryVector,
                    'numCandidates': 50,
                    'limit': 3
                }
            },
        ];
        const result = await collection.aggregate(agg).toArray();
        res.render('display', { memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;
