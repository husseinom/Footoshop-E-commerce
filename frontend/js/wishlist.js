let wishlist = [];


// Add this new function to fetch wishlist data
async function fetchWishlistFromServer() {

    
    try {
        const response = await fetch(`http://localhost:4000/wishlist`, {
            method: 'GET',
            mode:'cors',
            headers:{
                'Content-Type': 'application/json',},
            credentials:'include',
        });
        if (!response.ok) {
            if (response.status === 401) {
                showToast('Please log in to view your wishlist');
                // Optional: Redirect to login page
                window.location.href = "login.html";
                return;
            }
            throw new Error('Failed to fetch wishlist');
        }
        const data = await response.json();
        
        // Merge server wishlist with local wishlist
        if (data.wishlist) {
            // Update local storage with server data
            wishlist = data.wishlist;
            // Update display
            updateWishlistCount();
            displayWishlistItems();
        }
    } catch (error) {
        console.error('Error fetching wishlist:', error);
    }
}

function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function addToWishlist(product) {
    const productExists = wishlist.some(item => item.product_id === product.product_id);
    if (productExists) {
        showToast('Already Exist'); // Show toast if the product is already in the wishlist
        return; // Exit the function early
    }
    try {
      const response = await fetch(`http://localhost:4000/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.product_id,
        }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log(data);
      wishlist = data.wishlist;
      fetchWishlistFromServer();
      console.log(wishlist);
      updateWishlistCount();
      showToast('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add product to wishlist, maybe item already exists');
    }
}

async function removeFromWishlist(productId) {
    try {
        const response = await fetch(`http://localhost:4000/wishlist`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ productId}),
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from wishlist');
        }

        const data = await response.json();
        console.log(data);
        wishlist = data.wishlist; // Update local wishlist with server response
        updateWishlistCount();
        displayWishlistItems();
        showToast('Item removed from wishlist!');
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        // showToast('Failed to remove item from wishlist');
    }
}

function updateWishlistCount() {
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

function displayWishlistItems() {
    const wishlistContainer = document.querySelector('.wishlist-items-container');  // Ensure this is the correct element in your wishlist.html
    
    if (!wishlistContainer) return;
    wishlistContainer.innerHTML = ''; // Clear previous wishlist items

    
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty!</p>';
        
    } else {
        wishlist.forEach(item => {
            

            const wishlistItemHTML = `
                <div class="wishlist_item">
                    <span class="wishlist_item_title">${item.product.title}</span>
                    <img src="../../backend/${item.product.image_path}" alt="${item.product.title}" class="wishlist_img">
                    <i class="fa-solid fa-trash remove_btn" data-id="${item.product.id}" data-size="${item.size}" style="cursor: pointer;"></i>
                    <div class="wishlist_item_price">${item.product.actual_price}$</div>
                    
                    
                </div>`;

            wishlistContainer.insertAdjacentHTML('beforeend', wishlistItemHTML);
        });
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove_btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                removeFromWishlist(productId);
            });
        });
        
    }
}

// Call the function when the page is loaded
window.addEventListener('DOMContentLoaded', fetchWishlistFromServer);


// Initialize wishlist display
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('wishlist.html')) {
        fetchWishlistFromServer();
    }
    if (typeof initWebSocket === 'function') {
        initWebSocket();
    }
});