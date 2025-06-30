// Replace all localhost API calls with dynamic URLs
// Run this in browser console after config.js is loaded

const filesToUpdate = [
  'admin.js', 'allproducts.js', 'cart.js', 'login.js', 
  'main.js', 'singleproduct.js', 'wishlist.js'
];

// This will be done manually in each file
console.log('Update the following API calls to use window.API_BASE_URL:');
console.log('Replace "http://localhost:4000" with window.API_BASE_URL');

// Example:
// OLD: fetch("http://localhost:4000/products")
// NEW: fetch(window.API_BASE_URL + "/products")
