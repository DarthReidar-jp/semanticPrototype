const { getDBCollection } = require('./dbUtils');
const { getQueryVector } = require('./openaiUtils');

// ルートノードを見つける関数
async function findRootNode(query) {
    
    try{
        const queryVector = await getQueryVector(query);
        if (!Array.isArray(queryVector) || !queryVector.every(v => typeof v === 'number')) {
            throw new Error('getQueryVector returned an invalid format. Expected an array of numbers.');
        }
        const collection = await getDBCollection('memos');
        console.log("ルートノードの取得開始");
        const agg =[
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'vector',
                    'queryVector': queryVector,
                    'numCandidates': 1000,
                    'limit': 1
                }
            },
            {
                '$project': {
                    'title': 1,
                    'content': 1,
                    'vector': 1, // vectorフィールドを選択
                    'score': { '$meta': 'vectorSearchScore' }
                }
            },
            {
                '$match': {
                    'score': { '$gte': 0.7 }
                }
            }
        ];
        const result = await collection.aggregate(agg).toArray();
        console.log("ルートノードの取得完了");
        return result[0] || null; // 最も類似度が高いメモを返す

    }catch(e){
        console.error("Error finding root node:", e);
        throw e; // エラーを再スロー
    }
    
}

// 系統樹を構築する関数
async function buildTree(node, ancestors, depth = 0) {
    if (!node || depth > 5 || ancestors.length >= 3 && ancestors.slice(-3).every(val => val._id === node._id)) {
        return null; // 終了条件
    }

    try {
        const collection = await getDBCollection('memos');
        const queryVector = node.vector; // 現在のノードのベクトルを使用
        if (!Array.isArray(node.vector) || !node.vector.every(v => typeof v === 'number')) {
            console.error("Invalid format for queryVector in node:", node);
            console.error("Invalid format for queryVector in node:", node.vector);
            throw new Error('Invalid format for queryVector. Expected an array of numbers.');
        }
        //console.log(node.vector)
        const excludedIds = [node._id, ...ancestors.map(a => a._id)]; // 自身と先祖のIDを除外
        console.log("ノードの取得開始",excludedIds);
        const agg =[
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'vector',
                    'queryVector': queryVector,
                    'numCandidates': 1000,
                    'limit': 3,
                }
            },
            {
                '$project': {
                    'title': 1,
                    'content': 1,
                    'vector': 1, // vectorフィールドを選択
                    'score': { '$meta': 'vectorSearchScore' }
                }
            },
            {
                '$match': {
                    'score': { '$gte': 0.7 },
                    '_id': { '$nin': excludedIds }
                }
            }
        ];
        
        const results = await collection.aggregate(agg).toArray();
        console.log("ルートノードの取得完了");
        // 子ノードに対して再帰的に処理
        const children = [];
        for (const r of results) {
            if (r.score < 0.7) break; // スコアの閾値をチェック
            const childTree = await buildTree(r, [...ancestors, node], depth + 1);
            if (childTree) children.push(childTree);
        }

        return {
            node,
            children
        };
    } catch (e) {
        console.error("Error building tree:", e);
        throw e; // エラーを再スロー 
    }
    
}

// ベクトル検索に基づく系統樹構築を開始する関数
async function performVectorSearchTree(query) {
    try {
        let root = await findRootNode(query); // ルートノードを見つける
        if (!root) return null; // ルートノードが見つからない場合はnullを返す

        let tree = await buildTree(root, []); // 系統樹を構築する
        return tree;
    } catch (e) {
        console.error("Error performing vector search tree:", e);
        return null; // エラーが発生した場合はnullを返す
    }
}

module.exports = { performVectorSearchTree };
