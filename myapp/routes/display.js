// routes/display.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { connectDB } = require('../db');
const { ObjectId } = require('mongodb');
const { getQueryVector } = require('../utils/openaiUtils');
const { getMemoVector } = require('../utils/openaiUtils');

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

const upload = multer({ dest: 'uploads/' }); // アップロードされたファイルを一時的に保存するディレクトリ
// JSONインポート機能のルート
router.post('/import', upload.single('jsonFile'), async (req, res) => {
    try {
      const db = await connectDB();
      const collection = db.collection('memos');
      const fileData = fs.readFileSync(req.file.path);
      const memos = JSON.parse(fileData);
  
      // データ検証を行う
      if (!Array.isArray(memos)) {
        throw new Error('Uploaded file must be an array of memos');
      }
  
      const validMemos = memos.filter(memo => memo.title && memo.content);
      if (validMemos.length !== memos.length) {
        throw new Error('Some memos are missing a title or content');
      }
  
      // データベースにメモを保存
      await Promise.all(validMemos.map(async (memo) => {
        // Memoモデルに従って新しいメモを作成
        await collection.insertOne({
          title: memo.title,
          content: memo.content,
          // ベクトルデータが必要な場合はここで生成
          vector: await getMemoVector(memo.content)
        });
      }));
  
      fs.unlinkSync(req.file.path);
      res.redirect('/display');
    } catch (e) {
      res.status(500).send(e.message);
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
                  'numCandidates': 100,
                  'limit':5
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
        res.render('search', { memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;
