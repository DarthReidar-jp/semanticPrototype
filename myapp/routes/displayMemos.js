// routes/displayMemos.js
const express = require('express');
const router = express.Router();
const { getAllFoldersAndMemos } = require('../utils/dataFetchUtils');

// 表示画面（メモ一覧）
router.get('/', async (req, res) => {
  try {
    const { folders, memos } = await getAllFoldersAndMemos();
    res.render('display', { folders, memos }); // フォルダとメモのデータを渡す
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

module.exports = router;

