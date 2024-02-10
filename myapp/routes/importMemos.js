
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { connectDB } = require('../db');
const { getMemoVector } = require('../utils/openaiUtils');

//Jsonインポート機能
// アップロードされたファイルを一時的に保存するディレクトリ
const upload = multer({ dest: 'uploads/' }); 
// JSONインポート機能のルート
router.post('/', upload.single('jsonFile'), async (req, res) => {
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
  module.exports = router;