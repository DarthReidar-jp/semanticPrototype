const express = require('express');
const router = express.Router();
const { getDBCollection } = require('../utils/dbUtils');
const { ObjectId } = require('mongodb');


// フォルダ作成エンドポイント
router.post('/', async (req, res) => {
    console.log("Received request data:", req.body); // リクエストボディの内容をログ出力
    try {
      const { name, memoIds } = req.body;
  
      // リクエストデータの検証
      if (!name || !Array.isArray(memoIds) || memoIds.length === 0) {
        return res.status(400).send({ message: 'Invalid request data. Name and memoIds are required.' });
      }
  
      const foldersCollection = await getDBCollection('folders');
      const memosCollection = await getDBCollection('memos');
  
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
  router.get('/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;
        const foldersCollection = await getDBCollection('folders');
        const folders = await foldersCollection.find({}).toArray();
        const memosCollection = await getDBCollection('memos');
        const result = await memosCollection.find({ folderIds: folderId }).toArray();
        res.render('display', { folders, memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
  });
  
  
  module.exports = router;
  