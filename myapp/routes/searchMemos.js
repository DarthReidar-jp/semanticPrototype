// routes/display.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const { getQueryVector } = require('../utils/openaiUtils');

// ベクトル検索結果
router.get('/', async (req, res) => {
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
                  'numCandidates': 100,
                  'limit':10
              }
          },
          {
              '$project': {
                  'title': 1, // ここで含めたいフィールドを指定
                  'content': 1, // 含めたい他のフィールド
                  // 他に含めたいフィールドがあればここに追加
                  'score': { '$meta': 'vectorSearchScore' } // スコアを追加
              }
          },
          {
            '$match': {
                'score': { '$gte': 0.7 } // スコアが0.7以上のドキュメントのみをマッチ
            }
          },
          {
              '$sort': { 'score': -1 } // スコア順にソート
          }
        ];
        const result = await collection.aggregate(agg).toArray();
        res.render('display', { memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;