// app.js
// 環境変数をプロセスにロード
require('dotenv').config();
// 必要なモジュールをインポート
var createError = require('http-errors'); // HTTP エラーの作成をサポートするモジュール
var express = require('express'); // Express フレームワーク本体
var path = require('path'); // ファイルパス操作のためのモジュール
var cookieParser = require('cookie-parser'); // クッキーの解析をサポートするモジュール
var logger = require('morgan'); // ログ出力をサポートするモジュール
var methodOverride = require('method-override'); // method-override モジュールのインポート

// ルーターモジュールをインポート
var indexRouter = require('./routes/index'); // ルートページ用ルーターモジュール
var usersRouter = require('./routes/users'); // ユーザーページ用ルーターモジュール
var displayMemos = require('./routes/displayMemos');
var importMemos = require('./routes/importMemos');
var searchMemos = require('./routes/searchMemos');
var treeSearchMemos = require('./routes/treeSearchMemos')
var folders = require('./routes/folders');
var createRouter = require('./routes/create');
var detailRouter = require('./routes/detail');

var app = express(); // Express アプリケーションを作成

// ビューエンジンの設定
app.set('views', path.join(__dirname, 'views')); // ビューファイルの格納ディレクトリを設定
app.set('view engine', 'pug'); // ビューエンジンを Pug に設定

// ミドルウェアの設定
app.use(logger('dev')); // ロギング用のミドルウェアを設定
app.use(express.json()); // JSON リクエストボディの解析をサポート
app.use(express.urlencoded({ extended: false })); // URL エンコードされたリクエストボディの解析をサポート
app.use(cookieParser()); // クッキーの解析をサポート
app.use(express.static(path.join(__dirname, 'public'))); // 静的ファイルの提供を設定
app.use(methodOverride('_method'));// method-override ミドルウェアの設定ここでは _method キーを使用してオーバーライドを行います

// ルーターの設定
app.use('/', indexRouter); // ルートページ用ルーターを適用
app.use('/users', usersRouter); // ユーザーページ用ルーターを適用
app.use('/display', displayMemos);
app.use('/import', importMemos);
app.use('/folders', folders);
app.use('/search', searchMemos);
app.use('/treeSearch', treeSearchMemos);
app.use('/create', createRouter);
app.use('/detail', detailRouter);

// 404 エラーのハンドリング
app.use(function(req, res, next) {
  next(createError(404)); // 404 エラーを生成して次のミドルウェアに渡す
});

// エラーハンドリング
app.use(function(err, req, res, next) {
  // ローカル変数を設定してエラーメッセージを表示
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // エラーページを表示
  res.status(err.status || 500); // エラーステータスを設定
  res.render('error'); // エラービューを表示
});

module.exports = app; // Express アプリケーションをエクスポート
