let cart = [];

function getUserId() {
    return localStorage.getItem('auth_token');
}
// Add this new function to fetch cart data
async function fetchCartFromServer() {

    const token = getUserId(); // Get user ID from local storage
    try {
        const response = await fetch(`http://localhost:4000/cart`, {
            method: 'GET',
            mode:'cors',
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',},
            credentials:'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        
        // Merge server cart with local cart
        if (data.cart) {
            // Update local storage with server data
            cart = data.cart;
            // Update display
            updateCartCount();
            displayCartItems();
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
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

async function addToCart(product) {
    const token = getUserId();
    try {
      const response = await fetch(`http://localhost:4000/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: product.quantity,
          size: product.size,
        }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log(data);
      cart = data.cart;
      fetchCartFromServer();
      console.log(cart);
      updateCartCount();
      showToast('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add product to cart');
    }
}

async function removeFromCart(productId, size) {
    const token = getUserId();
    try {
        const response = await fetch(`http://localhost:4000/cart`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ productId, size }),
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }

        const data = await response.json();
        console.log(data);
        cart = data.cart; // Update local cart with server response
        showToast('Item removed from cart!');
        updateCartCount();
        displayCartItems();
        
    } catch (error) {
        console.error('Error removing from cart:', error);
        // showToast('Failed to remove item from cart');
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function displayCartItems() {
    const cartContainer = document.querySelector('.cart-items-container');  // Ensure this is the correct element in your cart.html
    const cartTotalElement = document.querySelector('.cart_total_p'); // Element to display the total price
    if (!cartContainer || !cartTotalElement) return;
    cartContainer.innerHTML = ''; // Clear previous cart items

    let totalAmount = 0; // Initialize total amount
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty!</p>';
        cartTotalElement.textContent = 'Total: $0.00';
    } else {
        cart.forEach(item => {
            const subtotal = item.quantity * item.product.actual_price;
            totalAmount += subtotal;

            const cartItemHTML = `
                <div class="cart_item">
                    <span class="cart_item_title">${item.product.title}</span>
                    <img src="../../backend/${item.product.image_path}" alt="${item.product.title}" class="cart_img">
                    <div class="cart_item_price">${item.product.actual_price}$</div>
                    <div class="cart_item_size">${item.size}</div>
                    <input type="number" value="${item.quantity}" class="cart_item_quantity" min="1">
                    <i class="fa-solid fa-trash remove_btn" data-id="${item.product.id}" data-size="${item.size}" style="cursor: pointer;"></i>
                    <p class="cart_item_total">${subtotal.toFixed(2)}$</p>
                    
                </div>`;

            cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });
        document.querySelectorAll('.cart_item_quantity').forEach((input, index) => {
            input.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                    cart[index].quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    displayCartItems(); // Re-render with updated values
                }
            });
        });
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove_btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                const size = btn.getAttribute('data-size');
                console.log(size);
                removeFromCart(productId,size);
            });
        });

        // Update the total price
        cartTotalElement.textContent = `Total: $${totalAmount.toFixed(2)}`;

        
    }
}

// Call the function when the page is loaded
window.addEventListener('DOMContentLoaded', fetchCartFromServer);


// Update the updateCartTotal function as well
function updateCartTotal() {
    if (!cart.items) return;
    
    const total = cart.items.reduce((sum, item) => {
        return sum + (item.product.current_price * item.quantity);
    }, 0);

    const totalElement = document.querySelector('.cart_total_p');
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
}

function updateQuantity(index, quantity) {
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// Initialize cart display
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('cart.html')) {
        fetchCartFromServer();
    }
});