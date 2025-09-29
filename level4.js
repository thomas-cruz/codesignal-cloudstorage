const CloudStorageInterface = require('./cloudStorageInterface');

class CloudStorage extends CloudStorageInterface {
  constructor() {
    super();
    this.files = Object.create(null);
    this.users = Object.create(null);

    this.users.admin = {
      capacity: Infinity,
      used: 0,
      files: new Set(),
    };
  }

  _isValidName(name) {
    return typeof name === 'string' && name.length > 0;
  }

  _isValidSize(size) {
    return typeof size === 'number' && Number.isFinite(size) && size >= 0;
  }

  _isValidCapacity(capacity) {
    return (
      (typeof capacity === 'number' && Number.isFinite(capacity) && capacity >= 0) ||
      capacity === Infinity
    );
  }

  _hasFile(name) {
    return Object.prototype.hasOwnProperty.call(this.files, name);
  }

  _getFileRecord(name) {
    return this._hasFile(name) ? this.files[name] : null;
  }

  _getUser(userId) {
    return Object.prototype.hasOwnProperty.call(this.users, userId) ? this.users[userId] : null;
  }

  _recordFile(name, size, owner) {
    this.files[name] = { size, owner };
    const user = this._getUser(owner);
    if (user) {
      user.used += size;
      user.files.add(name);
    }
  }

  _removeFile(name) {
    const record = this._getFileRecord(name);
    if (!record) {
      return;
    }

    const user = this._getUser(record.owner);
    if (user) {
      user.used -= record.size;
      if (user.used < 0) {
        user.used = 0;
      }
      user.files.delete(name);
    }

    delete this.files[name];
  }

  addFile(name, size) {
    if (!this._isValidName(name) || !this._isValidSize(size)) {
      return false;
    }

    if (this._hasFile(name)) {
      return false;
    }

    this._recordFile(name, size, 'admin');
    return true;
  }

  copyFile(nameFrom, nameTo) {
    if (!this._isValidName(nameTo) || this._hasFile(nameTo)) {
      return false;
    }

    const record = this._getFileRecord(nameFrom);
    if (!record) {
      return false;
    }

    const user = this._getUser(record.owner);
    if (!user) {
      return false;
    }

    if (user.capacity !== Infinity && user.used + record.size > user.capacity) {
      return false;
    }

    this._recordFile(nameTo, record.size, record.owner);
    return true;
  }

  getFileSize(name) {
    const record = this._getFileRecord(name);
    return record ? record.size : null;
  }

  findFile(prefix, suffix) {
    if (typeof prefix !== 'string' || typeof suffix !== 'string') {
      return [];
    }

    return Object.entries(this.files)
      .filter(([name, record]) =>
        typeof record.size === 'number' &&
        name.startsWith(prefix) &&
        name.endsWith(suffix)
      )
      .sort((a, b) => {
        const sizeDiff = b[1].size - a[1].size;
        if (sizeDiff !== 0) {
          return sizeDiff;
        }
        return a[0].localeCompare(b[0]);
      })
      .map(([name, record]) => `${name}(${record.size})`);
  }

  addUser(userId, capacity) {
    if (!this._isValidName(userId) || userId === 'admin' || !this._isValidCapacity(capacity)) {
      return false;
    }

    if (this._getUser(userId)) {
      return false;
    }

    this.users[userId] = {
      capacity,
      used: 0,
      files: new Set(),
    };
    return true;
  }

  addFileBy(userId, name, size) {
    if (!this._isValidName(name) || !this._isValidSize(size)) {
      return null;
    }

    const user = this._getUser(userId);
    if (!user) {
      return null;
    }

    if (this._hasFile(name)) {
      return null;
    }

    if (user.capacity !== Infinity && user.used + size > user.capacity) {
      return null;
    }

    this._recordFile(name, size, userId);
    return user.capacity === Infinity ? Infinity : user.capacity - user.used;
  }

  updateCapacity(userId, capacity) {
    const user = this._getUser(userId);
    if (!user || !this._isValidCapacity(capacity)) {
      return null;
    }

    user.capacity = capacity;

    if (capacity === Infinity || user.used <= capacity) {
      return 0;
    }

    const candidates = Array.from(user.files)
      .map((name) => ({ name, size: this.files[name].size }))
      .sort((a, b) => {
        if (b.size !== a.size) {
          return b.size - a.size;
        }
        return a.name.localeCompare(b.name);
      });

    let removed = 0;

    for (const { name } of candidates) {
      if (user.used <= capacity) {
        break;
      }
      this._removeFile(name);
      removed += 1;
    }

    return removed;
  }
}

module.exports = CloudStorage;
