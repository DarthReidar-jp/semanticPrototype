function addAllMemosToFolder() {
    const memoElements = document.querySelectorAll('.memo');
    const memoIds = Array.from(memoElements).map(el => el.dataset.memoId);
    const folderName = prompt("Enter the name for the new folder:");
  
    if (!folderName) {
      return; // フォルダ名が入力されなかった場合は処理を終了
    }
  
    fetch('/display/folders', { // URLを正しいパスに更新
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          memoIds: memoIds,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Folder created successfully:', data);
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      
      
  }
  