// routes/create.js
const express = require('express');
const router = express.Router();
const Memo = require('../models/memo');
const { connectDB } = require('../db');
const { getMemoVector } = require('../utils/openaiUtils');

// 新規作成画面
router.get('/', (req, res) => {
    res.render('create'); // 新規作成フォームのテンプレートを表示
});

// 新規メモの作成
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        const vector = await getMemoVector(content);
        const memo = new Memo( title, content, vector );

        const db = await connectDB();
        const collection = db.collection('memos');
        await collection.insertOne(memo);
        res.redirect('/display'); // 作成後は表示画面にリダイレクト
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;
