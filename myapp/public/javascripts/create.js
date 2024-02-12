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
  