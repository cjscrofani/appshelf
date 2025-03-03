/**
 * folders.js
 * Manages folder operations
 */

import { BookmarkManager } from './bookmarks.js';

/**
 * FolderManager class to handle folder operations
 */
class FolderManager {
  constructor(bookmarkManager) {
    this.bookmarkManager = bookmarkManager || new BookmarkManager();
  }

  /**
   * Get all folders
   * @returns {Array} List of folders
   */
  getAllFolders() {
    return this.bookmarkManager.data.folders;
  }

  /**
   * Find a folder by ID
   * @param {string} folderId - Folder ID to find
   * @returns {Object|null} Folder data and index or null
   */
  findFolder(folderId) {
    if (folderId === 'unorganized') {
      return null; // Unorganized is a special folder that cannot be edited
    }
    
    const index = this.bookmarkManager.data.folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      return {
        folder: this.bookmarkManager.data.folders[index],
        index: index
      };
    }
    return null;
  }

  /**
   * Add a new folder
   * @param {string} name - Folder name
   * @param {string} id - Folder ID
   * @returns {boolean} Success status
   */
  addFolder(name, id) {
    // Check if folder ID already exists
    if (this.bookmarkManager.data.folders.some(f => f.id === id)) {
      return false;
    }
    
    const newFolder = {
      name: name,
      id: id,
      bookmarks: []
    };
    
    this.bookmarkManager.data.folders.push(newFolder);
    return this.bookmarkManager.saveBookmarks();
  }

  /**
   * Update an existing folder
   * @param {string} originalId - Original folder ID
   * @param {Object} updatedFolder - Updated folder data
   * @returns {boolean} Success status
   */
  updateFolder(originalId, updatedFolder) {
    // Validate that the new ID is unique if it's different from the original
    if (originalId !== updatedFolder.id && 
        this.bookmarkManager.data.folders.some(f => f.id === updatedFolder.id)) {
      return false;
    }
    
    const result = this.findFolder(originalId);
    if (!result) {
      return false;
    }
    
    // Update the folder properties while keeping its bookmarks
    const bookmarks = result.folder.bookmarks;
    result.folder.name = updatedFolder.name;
    result.folder.id = updatedFolder.id;
    
    return this.bookmarkManager.saveBookmarks();
  }

  /**
   * Delete a folder
   * @param {string} folderId - Folder ID to delete
   * @returns {boolean} Success status
   */
  deleteFolder(folderId) {
    const index = this.bookmarkManager.data.folders.findIndex(folder => folder.id === folderId);
    if (index !== -1) {
      this.bookmarkManager.data.folders.splice(index, 1);
      return this.bookmarkManager.saveBookmarks();
    }
    return false;
  }

  /**
   * Move bookmarks from a folder to unorganized before deletion
   * @param {string} folderId - Source folder ID
   * @returns {boolean} Success status
   */
  moveBookmarksToUnorganized(folderId) {
    const result = this.findFolder(folderId);
    if (!result) return false;
    
    // Move all bookmarks to unorganized
    this.bookmarkManager.data.unorganized = [
      ...this.bookmarkManager.data.unorganized,
      ...result.folder.bookmarks
    ];
    
    // Remove the folder
    return this.deleteFolder(folderId);
  }
}

export { FolderManager };
