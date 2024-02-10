// routes/display.js
const express = require('express');
const router = express.Router();
const { performVectorSearch } = require('../utils/searchUtils');

// ベクトル検索結果
router.get('/', async (req, res) => {
    const query = req.query.query;

    try {
        const result = await performVectorSearch(query);
        res.render('display', { memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;
