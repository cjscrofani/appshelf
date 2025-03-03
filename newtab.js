/**
 * newtab.js
 * Entry point for the App Shelf new tab page
 * Initializes the application when a new tab is opened
 */

// Import the App class (the main application controller)
import { App } from './js/app.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a new instance of the App
  const appShelf = new App();
  
  // Initialize the application
  appShelf.init();
  
  // Focus the search box for immediate use
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    // Set a slight delay to ensure focus works reliably across browsers
    setTimeout(() => {
      searchBox.focus();
    }, 50);
  }
  
  // Log that the new tab page has been loaded
  console.log('App Shelf: New tab page loaded');
});
