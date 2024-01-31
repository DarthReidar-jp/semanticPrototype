const express = require('express');
const router = express.Router();
const Memo = require('../models/memo');
const { connectDB } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection('memos');
    const memos = await collection.find({}).toArray();
    res.render('memo_form', { memos }); //pugテンプレートにmemosを渡す
  } catch (e) {
    res.status(500).send(e.toString());
  }
});


router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const memo = new Memo(title, content);
    const db = await connectDB();
    const collection = db.collection('memos');
    await collection.insertOne(memo);
    res.redirect('/');
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

module.exports = router;