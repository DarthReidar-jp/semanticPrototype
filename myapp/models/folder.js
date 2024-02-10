class Folder {
    constructor(name, description, memoIds) {
        this.name = name;
        this.description = description || '';
        this.memoIds = memoIds;
    }
}

module.exports = Folder;
