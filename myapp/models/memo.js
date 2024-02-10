class Memo {
  
  constructor(title, content, vector, folderIds = []) {
      this.title = title;
      this.content = content;
      this.vector = vector;
      this.folderIds = folderIds;
  
    }
}
module.exports = Memo;