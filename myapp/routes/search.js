// routes/search.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const { getQueryVector } = require('../utils/openaiUtils');

// 検索フォームを表示するルート
router.get('/', (req, res) => {
    // 検索フォームページを表示
    res.render('search_form');
  });

router.get('/result', async (req, res) => {
  const query = req.query.query; // フォームからのクエリを取得
  const queryVector = await getQueryVector(query); // クエリのベクトルを取得

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
    res.render('search_results', { memos: result });
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

module.exports = router;
