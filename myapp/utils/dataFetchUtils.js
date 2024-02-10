// utils/dataFetchUtils.js
const { getDBCollection } = require('./dbUtils');

async function getAllFolders() {
  try {
    const foldersCollection = await getDBCollection('folders');
    const folders = await foldersCollection.find({}).toArray();
    return { folders}; // フォルダとメモのデータをオブジェクトとして返す
  } catch (e) {
    throw new Error(e.message); // エラーをキャッチして再投げる
  }
}

async function getAllMemos() {
  try {
    const memosCollection = await getDBCollection('memos');
    const memos = await memosCollection.find({}).toArray();
    return { memos }; // フォルダとメモのデータをオブジェクトとして返す
  } catch (e) {
    throw new Error(e.message); // エラーをキャッチして再投げる
  }
}

async function getAllFoldersAndMemos() {
  try {
    const foldersCollection = await getDBCollection('folders');
    const folders = await foldersCollection.find({}).toArray();
    const memosCollection = await getDBCollection('memos');
    const memos = await memosCollection.find({}).toArray();
    return { folders, memos }; // フォルダとメモのデータをオブジェクトとして返す
  } catch (e) {
    throw new Error(e.message); // エラーをキャッチして再投げる
  }
}

module.exports = { getAllFolders};
module.exports = { getAllMemos };
module.exports = { getAllFoldersAndMemos };
