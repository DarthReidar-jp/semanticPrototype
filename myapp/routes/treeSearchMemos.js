// routes/treeSearchMemos.js
const express = require('express');
const router = express.Router();
const { performVectorSearchTree } = require('../utils/treeSearchUtils');

function printTree(node, depth = 0) {
    // ノードがnullでないことを確認
    if (!node) return;
  
    // 現在のノードの情報をインデントを用いて出力
    console.log(`${' '.repeat(depth * 2)}ノード: ${node.node.title}`);
  
    // 子ノードがある場合、それぞれの子ノードに対して再帰的にこの関数を呼び出す
    if (node.children && node.children.length > 0) {
      console.log(`${' '.repeat(depth * 2)} 子ノード:`);
      node.children.forEach(child => printTree(child, depth + 1));
    }
  }
  

// ベクトル検索結果
router.get('/', async (req, res) => {
    const query = req.query.query;

    try {
        const result = await performVectorSearchTree(query);
        // ツリー構造をコンソールに出力
        printTree(result);
        res.render('treeSearchDisplay', { memos: result }); // 結果を表示画面に再利用
    } catch (e) {
        res.status(500).send(e.toString());
    }
});



module.exports = router;
