/**
 * modal.js
 * Manages modals for the App Shelf extension
 */

import { UI } from '../modules/ui.js';
import { BookmarkManager } from '../modules/bookmarks.js';
import { FolderManager } from '../modules/folders.js';

/**
 * Modal Manager class to handle all modals
 */
class ModalManager {
  constructor() {
    this.callbacks = {
      onAddBookmark: null,
      onEditBookmark: null,
      onDeleteBookmark: null,
      onAddFolder: null,
      onEditFolder: null,
      onDeleteFolder: null,
      onSaveSettings: null
    };
    
    this.bookmarkManager = new BookmarkManager();
    this.folderManager = new FolderManager(this.bookmarkManager);
  }

  /**
   * Initialize modals
   * @param {Object} callbacks - Callback functions
   */
  init(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };
    
    // Set up add bookmark modal
    this.setupAddBookmarkModal();
    
    // Set up edit bookmark modal
    this.setupEditBookmarkModal();
    
    // Set up add folder modal
    this.setupAddFolderModal();
    
    // Set up edit folder modal
    this.setupEditFolderModal();
    
    // Set up settings modal
    this.setupSettingsModal();
  }

  /**
   * Set up the add bookmark modal
   */
  setupAddBookmarkModal() {
    const addBookmarkModal = UI.getElement('addBookmarkModal');
    const closeBookmarkModal = UI.getElement('closeBookmarkModal');
    const cancelBookmark = UI.getElement('cancelBookmark');
    const saveBookmark = UI.getElement('saveBookmark');
    const addBookmarkForm = UI.getElement('addBookmarkForm');
    
    if (!addBookmarkModal || !closeBookmarkModal || !cancelBookmark || 
        !saveBookmark || !addBookmarkForm) {
      console.error('Add bookmark modal elements not found');
      return;
    }
    
    // Close modal handlers
    [closeBookmarkModal, cancelBookmark].forEach(el => {
      el.addEventListener('click', () => {
        UI.removeClass(addBookmarkModal, 'show');
        addBookmarkForm.reset();
      });
    });
    
    // Close when clicking on backdrop
    addBookmarkModal.addEventListener('click', (e) => {
      if (e.target === addBookmarkModal) {
        UI.removeClass(addBookmarkModal, 'show');
        addBookmarkForm.reset();
      }
    });
    
    // Save bookmark
    saveBookmark.addEventListener('click', () => {
      const name = UI.getElement('bookmarkName').value.trim();
      const url = UI.getElement('bookmarkUrl').value.trim();
      const folder = UI.getElement('bookmarkFolder').value;
      const image = UI.getElement('bookmarkImage').value.trim() || null;
      
      if (!name || !url) {
        UI.showToast('Please fill in all required fields', 'error');
        return;
      }
      
      if (this.callbacks.onAddBookmark) {
        if (this.callbacks.onAddBookmark(name, url, folder, image)) {
          UI.removeClass(addBookmarkModal, 'show');
          addBookmarkForm.reset();
        }
      }
    });
  }

  /**
   * Show add bookmark modal
   */
  showAddBookmarkModal() {
    this.populateFolderSelect();
    UI.showModal('addBookmarkModal');
  }

  /**
   * Populate folder select options
   * @param {string} [currentFolderId='unorganized'] - Currently selected folder ID
   */
  populateFolderSelect(currentFolderId = 'unorganized') {
    const selectElement = UI.getElement('bookmarkFolder') || UI.getElement('editBookmarkFolder');
    if (!selectElement) return;
    
    // Clear existing options except unorganized
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    
    // Add folder options
    this.folderManager.getAllFolders().forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      selectElement.appendChild(option);
    });
    
    // Set current folder as selected
    selectElement.value = currentFolderId;
  }

  /**
   * Set up the edit bookmark modal
   */
  setupEditBookmarkModal() {
    const editBookmarkModal = UI.getElement('editBookmarkModal');
    const closeEditBookmarkModal = UI.getElement('closeEditBookmarkModal');
    const cancelEditBookmark = UI.getElement('cancelEditBookmark');
    const saveEditBookmark = UI.getElement('saveEditBookmark');
    const deleteBookmarkBtn = UI.getElement('deleteBookmarkBtn');
    
    if (!editBookmarkModal || !closeEditBookmarkModal || !cancelEditBookmark || 
        !saveEditBookmark || !deleteBookmarkBtn) {
      console.error('Edit bookmark modal elements not found');
      return;
    }
    
    // Close modal handlers
    [closeEditBookmarkModal, cancelEditBookmark].forEach(el => {
      el.addEventListener('click', () => {
        UI.removeClass(editBookmarkModal, 'show');
      });
    });
    
    // Close when clicking on backdrop
    editBookmarkModal.addEventListener('click', (e) => {
      if (e.target === editBookmarkModal) {
        UI.removeClass(editBookmarkModal, 'show');
      }
    });
    
    // Save edited bookmark
    saveEditBookmark.addEventListener('click', () => {
      const originalUrl = UI.getElement('editBookmarkOriginalUrl').value;
      const originalFolder = UI.getElement('editBookmarkOriginalFolder').value;
      const name = UI.getElement('editBookmarkName').value.trim();
      const url = UI.getElement('editBookmarkUrl').value.trim();
      const folder = UI.getElement('editBookmarkFolder').value;
      const image = UI.getElement('editBookmarkImage').value.trim() || null;
      
      if (!name || !url) {
        UI.showToast('Please fill in all required fields', 'error');
        return;
      }
      
      // Ensure URL has protocol
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      const updatedBookmark = {
        name: name,
        url: fullUrl,
        image: image
      };
      
      if (this.callbacks.onEditBookmark) {
        if (this.callbacks.onEditBookmark(originalUrl, originalFolder, updatedBookmark, folder)) {
          UI.removeClass(editBookmarkModal, 'show');
        }
      }
    });
    
    // Delete bookmark
    deleteBookmarkBtn.addEventListener('click', () => {
      const originalUrl = UI.getElement('editBookmarkOriginalUrl').value;
      const originalFolder = UI.getElement('editBookmarkOriginalFolder').value;
      const name = UI.getElement('editBookmarkName').value;
      
      UI.confirm(`Are you sure you want to delete "${name}"?`).then(confirmed => {
        if (confirmed && this.callbacks.onDeleteBookmark) {
          if (this.callbacks.onDeleteBookmark(originalUrl, originalFolder, name)) {
            UI.removeClass(editBookmarkModal, 'show');
          }
        }
      });
    });
  }

  /**
   * Show edit bookmark modal
   * @param {string} url - Bookmark URL
   * @param {string} folderId - Folder ID
   */
  showEditBookmarkModal(url, folderId) {
    const result = this.bookmarkManager.findBookmark(url, folderId);
    if (!result) {
      console.error('Bookmark not found for editing');
      return;
    }
    
    const bookmark = result.bookmark;
    
    // Store original values for reference
    UI.getElement('editBookmarkOriginalUrl').value = bookmark.url;
    UI.getElement('editBookmarkOriginalFolder').value = folderId;
    
    // Fill the form with bookmark data
    UI.getElement('editBookmarkName').value = bookmark.name || '';
    UI.getElement('editBookmarkUrl').value = bookmark.url || '';
    UI.getElement('editBookmarkImage').value = bookmark.image || '';
    
    // Populate folder select
    this.populateFolderSelect(folderId);
    
    // Show the modal
    UI.showModal('editBookmarkModal');
  }

  /**
   * Set up the add folder modal
   */
  setupAddFolderModal() {
    const addFolderModal = UI.getElement('addFolderModal');
    const closeFolderModal = UI.getElement('closeFolderModal');
    const cancelFolder = UI.getElement('cancelFolder');
    const saveFolder = UI.getElement('saveFolder');
    const addFolderForm = UI.getElement('addFolderForm');
    
    if (!addFolderModal || !closeFolderModal || !cancelFolder || 
        !saveFolder || !addFolderForm) {
      console.error('Add folder modal elements not found');
      return;
    }
    
    // Close modal handlers
    [closeFolderModal, cancelFolder].forEach(el => {
      el.addEventListener('click', () => {
        UI.removeClass(addFolderModal, 'show');
        addFolderForm.reset();
      });
    });
    
    // Close when clicking on backdrop
    addFolderModal.addEventListener('click', (e) => {
      if (e.target === addFolderModal) {
        UI.removeClass(addFolderModal, 'show');
        addFolderForm.reset();
      }
    });
    
    // Save folder
    saveFolder.addEventListener('click', () => {
      const name = UI.getElement('folderName').value.trim();
      const id = UI.getElement('folderId').value.trim();
      
      if (!name || !id) {
        UI.showToast('Please fill in all required fields', 'error');
        return;
      }
      
      if (this.callbacks.onAddFolder) {
        if (this.callbacks.onAddFolder(name, id)) {
          UI.removeClass(addFolderModal, 'show');
          addFolderForm.reset();
        }
      }
    });
  }

  /**
   * Show add folder modal
   */
  showAddFolderModal() {
    UI.showModal('addFolderModal');
  }

  /**
   * Set up the edit folder modal
   */
  setupEditFolderModal() {
    const editFolderModal = UI.getElement('editFolderModal');
    const closeEditFolderModal = UI.getElement('closeEditFolderModal');
    const cancelEditFolder = UI.getElement('cancelEditFolder');
    const saveEditFolder = UI.getElement('saveEditFolder');
    const deleteFolderBtn = UI.getElement('deleteFolderBtn');
    
    if (!editFolderModal || !closeEditFolderModal || !cancelEditFolder || 
        !saveEditFolder || !deleteFolderBtn) {
      console.error('Edit folder modal elements not found');
      return;
    }
    
    // Close edit folder modal handlers
    [closeEditFolderModal, cancelEditFolder].forEach(el => {
      el.addEventListener('click', () => {
        UI.removeClass(editFolderModal, 'show');
      });
    });
    
    // Close when clicking on backdrop
    editFolderModal.addEventListener('click', (e) => {
      if (e.target === editFolderModal) {
        UI.removeClass(editFolderModal, 'show');
      }
    });
    
    // Save edited folder
    saveEditFolder.addEventListener('click', () => {
      // Get form data
      const originalId = UI.getElement('editFolderOriginalId').value;
      const name = UI.getElement('editFolderName').value.trim();
      const id = UI.getElement('editFolderId').value.trim();
      
      if (!name || !id) {
        UI.showToast('Please fill in all required fields', 'error');
        return;
      }
      
      const updatedFolder = {
        name: name,
        id: id
      };
      
      if (this.callbacks.onEditFolder) {
        if (this.callbacks.onEditFolder(originalId, updatedFolder)) {
          UI.removeClass(editFolderModal, 'show');
        }
      }
    });
    
    // Delete folder
    deleteFolderBtn.addEventListener('click', () => {
      const originalId = UI.getElement('editFolderOriginalId').value;
      const name = UI.getElement('editFolderName').value;
      
      UI.confirm(`Are you sure you want to delete the "${name}" folder?`).then(confirmed => {
        if (confirmed && this.callbacks.onDeleteFolder) {
          if (this.callbacks.onDeleteFolder(originalId, name)) {
            UI.removeClass(editFolderModal, 'show');
          }
        }
      });
    });
  }

  /**
   * Show edit folder modal
   * @param {string} folderId - Folder ID
   */
  showEditFolderModal(folderId) {
    const result = this.folderManager.findFolder(folderId);
    if (!result) {
      console.error('Folder not found for editing or cannot be edited');
      return;
    }
    
    const folder = result.folder;
    
    // Store original ID for reference
    UI.getElement('editFolderOriginalId').value = folder.id;
    
    // Fill the form with folder data
    UI.getElement('editFolderName').value = folder.name || '';
    UI.getElement('editFolderId').value = folder.id || '';
    
    // Show the modal
    UI.showModal('editFolderModal');
  }

  /**
   * Set up the settings modal
   */
  setupSettingsModal() {
    const settingsModal = UI.getElement('settingsModal');
    const closeSettingsModal = UI.getElement('closeSettingsModal');
    const cancelSettings = UI.getElement('cancelSettings');
    const saveSettingsBtn = UI.getElement('saveSettings');
    
    if (!settingsModal || !closeSettingsModal || !cancelSettings || !saveSettingsBtn) {
      console.error('Settings modal elements not found');
      return;
    }
    
    // Close settings modal
    [closeSettingsModal, cancelSettings].forEach(el => {
      el.addEventListener('click', () => {
        UI.removeClass(settingsModal, 'show');
      });
    });
    
    // Close when clicking on backdrop
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        UI.removeClass(settingsModal, 'show');
      }
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', () => {
      // Get form values
      const bookmarkTarget = document.querySelector('input[name="bookmarkTarget"]:checked').value;
      
      const settings = {
        bookmarkTarget: bookmarkTarget
      };
      
      if (this.callbacks.onSaveSettings) {
        this.callbacks.onSaveSettings(settings);
        UI.removeClass(settingsModal, 'show');
      }
    });
  }

  /**
   * Show settings modal
   */
  showSettingsModal() {
    UI.showModal('settingsModal');
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(modal => {
      UI.removeClass(modal, 'show');
    });
  }
}

export { ModalManager };
