$(document).ready(function(){
    $('textarea').on('input', function () {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    }).on('keypress', function(e){
      if(e.which == 13){
        $(this).height(function(i,h){
          return h + 20; // 20pxが1行の高さと仮定
        });
      }
    });

      // テキストエリアを選択
    var textarea = $('textarea.content');
    
    // テキストエリアのサイズを初期化
    function resizeTextarea() {
      textarea.each(function () {
        $(this).css('height', 'auto');
        $(this).css('height', this.scrollHeight + 'px');
      });
    }

    // テキストエリアのサイズ調整を行う
    textarea.on('input', function () {
      resizeTextarea();
    });

    // ページ読み込み時にテキストエリアのサイズ調整を行う
    resizeTextarea();

    // タイトル入力欄に何か入力されたときコンテンツ入力欄を表示
    $('input.title').on('input', function() {
        $('textarea.content').parent().removeClass('d-none');
    });
    // タイトル入力欄でエンターキーが押されたときの処理
    $('input.title').on('keydown', function(e) {
        if(e.key === 'Enter') {
        e.preventDefault(); // フォームの送信を防ぐ
        $('textarea.content').focus(); // コンテンツ入力欄にフォーカスを移動
        }
    });
  });
  