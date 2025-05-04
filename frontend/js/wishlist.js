let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function showWishlistToast(message) {
    let toast = document.querySelector('.wishlist-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast wishlist-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function addToWishlist(product) {
    // Check if product already exists in wishlist
    const existingItem = wishlist.find(item => 
        item.name === product.name && 
        item.price === product.price
    );

    if (existingItem) {
        showWishlistToast('Product is already in your wishlist!');
        return;
    }

    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    showWishlistToast('Product added to wishlist!');
}

function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlistItems();
}

function updateWishlistCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.length;
    }
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistCount.textContent = wishlist.length;
    }
}


function displayWishlistItems() {
    const wishlistContainer = document.querySelector('.wishlist');
    const wishlistHeader = document.querySelector('.wishlist_header');
    
    // Only try to display items if we're on the wishlist page
    if (!wishlistContainer || !wishlistHeader) return;

    // Clear existing items
    const existingItems = document.querySelectorAll('.wishlist_item');
    existingItems.forEach(item => item.remove());

    if (wishlist.length === 0) {
        wishlistHeader.insertAdjacentHTML('afterend', `
            <div class="wishlist_item">
                <p class="wishlist_empty" style="text-align: center; width: 100%;">Your wishlist is empty</p>
            </div>
        `);
        return;
    }

    const wishlistItems = wishlist.map((item, index) => {
        const price = parseFloat(item.price.replace('$', ''));
        
        return `
            <div class="wishlist_item">
                <span class="wishlist_item_title">${item.name}</span>
                <img src="${item.image}" alt="${item.name}" class="wishlist_img">
                <button class="remove-item" onclick="removeFromWishlist(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="wishlist_item_price">$${price.toFixed(2)}</div>
                
                
            </div>
        `;
    }).join('');

    wishlistHeader.insertAdjacentHTML('afterend', wishlistItems);

}

document.addEventListener('DOMContentLoaded', () => {
    displayWishlistItems();
    // Update wishlist count on page load
    updateWishlistCount();

    // Add click handlers to heart icons
    document.querySelectorAll('.card .fa-heart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.card');
            if (!card) return;
            
            const product = {
                name: card.querySelector('.card_title').textContent,
                price: card.querySelector('.card_price').textContent,
                image: card.querySelector('.card_img').getAttribute('src')
            };
            
            addToWishlist(product);
        });
    });
});


