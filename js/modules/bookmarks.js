/**
 * bookmarks.js
 * Manages bookmark data and operations
 */

import { Storage, StorageKeys } from './storage.js';

/**
 * Default bookmark data to use when no stored data exists
 */
const DEFAULT_BOOKMARKS = {
  folders: [
    {
      name: "Development",
      id: "dev",
      bookmarks: [
        { name: "GitHub", url: "https://github.com" },
        { name: "Stack Overflow", url: "https://stackoverflow.com" },
        { name: "MDN Web Docs", url: "https://developer.mozilla.org" }
      ]
    },
    {
      name: "Entertainment",
      id: "entertainment",
      bookmarks: [
        { name: "YouTube", url: "https://www.youtube.com" },
        { name: "Netflix", url: "https://www.netflix.com" },
        { name: "Spotify", url: "https://www.spotify.com" }
      ]
    }
  ],
  unorganized: [
    { name: "Google", url: "https://www.google.com" },
    { name: "Wikipedia", url: "https://www.wikipedia.org" }
  ]
};

/**
 * BookmarkManager class to handle bookmark operations
 */
class BookmarkManager {
  constructor() {
    this.data = this.loadBookmarks();
  }

  /**
   * Load bookmarks from storage
   * @returns {Object} Bookmark data
   */
  loadBookmarks() {
    const bookmarks = Storage.load(StorageKeys.BOOKMARKS, DEFAULT_BOOKMARKS);
    
    // Validate data structure
    if (!this.validateBookmarkData(bookmarks)) {
      return DEFAULT_BOOKMARKS;
    }
    
    return bookmarks;
  }

  /**
   * Validate bookmark data structure
   * @param {Object} data - Bookmark data to validate
   * @returns {boolean} Validity status
   */
  validateBookmarkData(data) {
    return data && 
           data.folders && Array.isArray(data.folders) && 
           data.unorganized && Array.isArray(data.unorganized);
  }

  /**
   * Save bookmarks to storage
   * @returns {boolean} Success status
   */
  saveBookmarks() {
    return Storage.save(StorageKeys.BOOKMARKS, this.data);
  }

  /**
   * Add a new bookmark
   * @param {string} name - Bookmark name
   * @param {string} url - Bookmark URL
   * @param {string} folderId - Target folder ID ('unorganized' for no folder)
   * @param {string|null} image - Custom image URL (optional)
   * @returns {boolean} Success status
   */
  addBookmark(name, url, folderId = 'unorganized', image = null) {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newBookmark = { name, url, image };

    if (folderId === 'unorganized') {
      this.data.unorganized.push(newBookmark);
    } else {
      const folder = this.data.folders.find(f => f.id === folderId);
      if (!folder) return false;
      folder.bookmarks.push(newBookmark);
    }

    return this.saveBookmarks();
  }

  /**
   * Find a bookmark by URL and folder
   * @param {string} url - Bookmark URL
   * @param {string} folderId - Folder ID
   * @returns {Object|null} Found bookmark info or null
   */
  findBookmark(url, folderId) {
    if (folderId === 'unorganized') {
      const index = this.data.unorganized.findIndex(b => b.url === url);
      return index !== -1 ? {
        bookmark: this.data.unorganized[index],
        folder: null,
        folderIndex: null,
        bookmarkIndex: index
      } : null;
    } else {
      const folderIndex = this.data.folders.findIndex(f => f.id === folderId);
      if (folderIndex === -1) return null;
      
      const folder = this.data.folders[folderIndex];
      const bookmarkIndex = folder.bookmarks.findIndex(b => b.url === url);
      
      return bookmarkIndex !== -1 ? {
        bookmark: folder.bookmarks[bookmarkIndex],
        folder,
        folderIndex,
        bookmarkIndex
      } : null;
    }
  }

  /**
   * Update an existing bookmark
   * @param {string} originalUrl - Original bookmark URL
   * @param {string} originalFolderId - Original folder ID
   * @param {Object} updatedBookmark - Updated bookmark data
   * @param {string} newFolderId - New folder ID
   * @returns {boolean} Success status
   */
  updateBookmark(originalUrl, originalFolderId, updatedBookmark, newFolderId) {
    // Remove from original location
    this.deleteBookmark(originalUrl, originalFolderId);
    
    // Add to new location
    if (newFolderId === 'unorganized') {
      this.data.unorganized.push(updatedBookmark);
    } else {
      const folder = this.data.folders.find(f => f.id === newFolderId);
      if (!folder) return false;
      folder.bookmarks.push(updatedBookmark);
    }
    
    return this.saveBookmarks();
  }

  /**
   * Delete a bookmark
   * @param {string} url - Bookmark URL
   * @param {string} folderId - Folder ID
   * @returns {boolean} Success status
   */
  deleteBookmark(url, folderId) {
    if (folderId === 'unorganized') {
      const index = this.data.unorganized.findIndex(b => b.url === url);
      if (index !== -1) {
        this.data.unorganized.splice(index, 1);
      }
    } else {
      const folder = this.data.folders.find(f => f.id === folderId);
      if (folder) {
        const index = folder.bookmarks.findIndex(b => b.url === url);
        if (index !== -1) {
          folder.bookmarks.splice(index, 1);
        }
      }
    }
    
    return this.saveBookmarks();
  }

  /**
   * Export bookmarks to JSON file
   */
  exportBookmarks() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * Import bookmarks from JSON data
   * @param {Object} importedData - JSON bookmark data
   * @returns {boolean} Success status
   */
  importBookmarks(importedData) {
    // Validate the structure
    if (!this.validateBookmarkData(importedData)) {
      return false;
    }
    
    this.data = importedData;
    return this.saveBookmarks();
  }

  /**
   * Helper function to get a favicon URL
   * @param {string} url - Website URL
   * @param {number} size - Icon size
   * @returns {string} Favicon URL
   */
  getFaviconUrl(url, size = 128) {
    const domain = this.extractDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }

  /**
   * Extract domain from URL
   * @param {string} url - Full URL
   * @returns {string} Domain
   */
  extractDomain(url) {
    try {
      const a = document.createElement('a');
      a.href = url;
      return a.hostname;
    } catch (e) {
      console.error("Error extracting domain:", e);
      return url;
    }
  }
}

export { BookmarkManager, DEFAULT_BOOKMARKS };
