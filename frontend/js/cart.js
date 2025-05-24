let cart = [];

// Add this new function to fetch cart data with cache busting
async function fetchCartFromServer() {
    try {
        console.log("Fetching cart from server...");
        
        // Add a timestamp to prevent caching
        const cacheBuster = new Date().getTime();
        
        const response = await fetch(`http://localhost:4000/cart?t=${cacheBuster}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Cart data from server:", data);
        
        // Check if we have valid cart data
        if (data && data.cart && Array.isArray(data.cart)) {
            // Update local cart with server data
            cart = data.cart;
            console.log("Cart updated from server:", cart);
            
            // Update UI
            displayCartItems();
            updateCartCount();
        } else {
            console.error("Invalid cart data received:", data);
            // If server sent empty cart, update local cart to empty as well
            cart = [];
            displayCartItems();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        // Don't clear cart on error, just leave it as is
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
    try {
      const response = await fetch(`http://localhost:4000/cart`, {
        method: 'POST',
        headers: {
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
    try {
        const response = await fetch(`http://localhost:4000/cart`, {
            method: 'DELETE',
            headers: {
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

// Update the updateCartItemQuantity function to reload the cart more aggressively
async function updateCartItemQuantity(index, newQuantity) {
    try {
        // Get the item being updated
        const item = cart[index];
        
        // Check if the item has a product property (from server) or is the product itself (local storage)
        const productId = item.product ? item.product.id : item.product_id;
        
        // Show a temporary loading indicator
        const inputElement = document.querySelector(`.cart_item_quantity[data-index="${index}"]`);
        if (inputElement) {
            inputElement.disabled = true;
        }
        
        console.log(`Updating cart item: index=${index}, product=${productId}, size=${item.size}, quantity=${newQuantity}`);
        
        // Update UI optimistically to show the new quantity immediately
        const originalQuantity = item.quantity;
        item.quantity = newQuantity;
        displayCartItems();
        
        // Send update to server
        const response = await fetch(`http://localhost:4000/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                size: item.size,
                quantity: newQuantity
            }),
            credentials: 'include',
        });

        // Handle response based on status
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            
            // Revert the optimistic update
            item.quantity = originalQuantity;
            
            // If server returned info about stock limit
            if (errorData.availableStock !== undefined) {
                showToast(`Only ${errorData.availableStock} items available in stock`);
            } else {
                showToast(errorData.message || 'Failed to update quantity');
            }
            
            // Re-enable input
            if (inputElement) {
                inputElement.disabled = false;
            }
            
            // Refresh cart from server to ensure consistency
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
            await fetchCartFromServer();
            return;
        }

        // Success - get the response data
        const data = await response.json();
        console.log("Cart update response:", data);
        
        // Add a small delay to ensure the database has time to update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Always refresh from server after a successful update
        await fetchCartFromServer();
        
        // Show success message
        showToast('Cart updated successfully');
        
        // Re-enable input
        if (inputElement) {
            inputElement.disabled = false;
        }
        
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        showToast('Failed to update quantity');
        
        // Re-enable any disabled inputs
        const inputElement = document.querySelector(`.cart_item_quantity[data-index="${index}"]`);
        if (inputElement) {
            inputElement.disabled = false;
        }
        
        // Refresh cart from server to ensure consistency
        await fetchCartFromServer();
    }
}

function displayCartItems() {
    const cartContainer = document.querySelector('.cart-items-container');
    const cartTotalElement = document.querySelector('.cart_total_p');
    if (!cartContainer || !cartTotalElement) return;
    cartContainer.innerHTML = '';

    let totalAmount = 0;
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty!</p>';
        cartTotalElement.textContent = 'Total: $0.00';
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.quantity * item.product.actual_price;
            totalAmount += subtotal;

            const cartItemHTML = `
                <div class="cart_item">
                    <span class="cart_item_title">${item.product.title}</span>
                    <img src="../../backend/${item.product.image_path}" alt="${item.product.title}" class="cart_img">
                    <div class="cart_item_price">${item.product.actual_price}$</div>
                    <div class="cart_item_size">${item.size}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" class="cart_item_quantity" min="1" data-index="${index}">
                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                    </div>
                    <i class="fa-solid fa-trash remove_btn" data-id="${item.product.id}" data-size="${item.size}" style="cursor: pointer;"></i>
                    <p class="cart_item_total">${subtotal.toFixed(2)}$</p>
                </div>`;

            cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        // Add event listeners to quantity inputs
        document.querySelectorAll('.cart_item_quantity').forEach((input) => {
            input.addEventListener('change', (e) => {
                e.preventDefault();
                const index = parseInt(e.target.getAttribute('data-index'));
                const newQuantity = parseInt(e.target.value);
                
                // Basic validation
                if (newQuantity >= 1) {
                    updateCartItemQuantity(index, newQuantity);
                } else {
                    // Reset to minimum quantity
                    e.target.value = 1;
                    updateCartItemQuantity(index, 1);
                }
            });
        });

        // Add event listeners for plus/minus buttons
        document.querySelectorAll('.minus-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                const currentQuantity = cart[index].quantity;
                if (currentQuantity > 1) {
                    updateCartItemQuantity(index, currentQuantity - 1);
                }
            });
        });

        document.querySelectorAll('.plus-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                const currentQuantity = cart[index].quantity;
                updateCartItemQuantity(index, currentQuantity + 1);
                // The server will handle validation if this exceeds stock
            });
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove_btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.getAttribute('data-id');
                const size = btn.getAttribute('data-size');
                removeFromCart(productId, size);
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