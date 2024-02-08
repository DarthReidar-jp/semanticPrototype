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
    const foldersCollection = db.collection('folders');
    const folders = await foldersCollection.find({}).toArray();
    const memosCollection = db.collection('memos');
    const memos = await memosCollection.find({}).toArray();
    res.render('display', { folders, memos }); // フォルダとメモのデータを渡す
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

//Jsonインポート機能
// アップロードされたファイルを一時的に保存するディレクトリ
const upload = multer({ dest: 'uploads/' }); 
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



// フォルダ作成エンドポイント
router.post('/folders', async (req, res) => {
  try {
    const { name, memoIds } = req.body;

    // リクエストデータの検証
    //if (!name || !Array.isArray(memoIds) || memoIds.length === 0) {
    //  return res.status(400).send({ message: 'Invalid request data. Name and memoIds are required.' });
    //}

    const db = await connectDB();
    const foldersCollection = db.collection('folders');
    const memosCollection = db.collection('memos');

    // 新しいフォルダを作成
    const folder = { name, memoIds, createdAt: new Date() }; // createdAtを追加してフォルダ作成時間を記録
    const folderResult = await foldersCollection.insertOne(folder);
    const folderId = folderResult.insertedId;

    // 対応するメモのfolderIdsにこのフォルダIDを追加
    await Promise.all(memoIds.map(memoId =>
      memosCollection.updateOne({ _id: new ObjectId(memoId) }, { $push: { folderIds: folderId.toString() } })
    ));

    res.status(201).send({ message: 'Folder created successfully', folderId: folderId });
  } catch (e) {
    console.error('Error creating folder:', e); // エラーログの詳細化
    res.status(500).send({ message: 'Internal Server Error', error: e.message });
  }
});

// フォルダ内のメモ取得エンドポイント
router.get('/folders/:folderId/', async (req, res) => {
  try {
      const { folderId } = req.params;
      const db = await connectDB();
      const foldersCollection = db.collection('folders');
      const folders = await foldersCollection.find({}).toArray();
      const memosCollection = db.collection('memos');
      const result = await memosCollection.find({ folderIds: folderId }).toArray();
      res.render('display', { folders, memos: result }); // 結果を表示画面に再利用
  } catch (e) {
      res.status(500).send(e.toString());
  }
});


module.exports = router;
