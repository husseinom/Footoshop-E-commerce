async function loadProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:4000/product/${productId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (!response.ok) throw new Error("Product not found");

        const productArray = await response.json(); // it's an array
        // console.log("Product Details:", productArray);

        if (!Array.isArray(productArray) || productArray.length === 0) {
            throw new Error("No product data");
        }

        // Use the first variant for common fields
        const firstProduct = productArray[0];

        // Fill HTML elements if they exist on the page
        const titleEl = document.getElementById("productTitle");
        const priceEl = document.getElementById("productPrice");
        const descEl = document.getElementById("productDescription");
        const imageEl = document.getElementById("productImage");
        const sizeSelect = document.getElementById("size_product");
        const quantityInput = document.getElementById("quantity");


        if (titleEl) titleEl.textContent = firstProduct.title;
        if (priceEl) priceEl.textContent = `${firstProduct.actual_price} €`;
        if (descEl) descEl.textContent = firstProduct.description ?? "No description available.";
        if (imageEl) imageEl.src = `../../backend/${firstProduct.image_path}`;

        // Populate sizes from product array
        if (sizeSelect) {
            sizeSelect.innerHTML = ""; // Clear previous options
            productArray.forEach(variant => {
                const option = document.createElement("option");
                option.value = variant.size;
                option.textContent = `${variant.size}`;
                
                // Set the stock data attribute from the variant's quantity
                option.dataset.stock = variant.quantity || 0;
                
                sizeSelect.appendChild(option);
            });
            
            // Set initial max quantity based on the first size's stock
            if (quantityInput && sizeSelect.options.length > 0) {
                const firstSizeStock = parseInt(sizeSelect.options[0].dataset.stock);
                quantityInput.max = firstSizeStock;
                quantityInput.value = Math.min(1, firstSizeStock);
                
                // Disable the input if no stock
                quantityInput.disabled = firstSizeStock <= 0;
                
                // Show stock message for initial selected size
                updateStockMessage(firstSizeStock);
            }
            
            // Update quantity max when size changes
            sizeSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const stockForSize = parseInt(selectedOption.dataset.stock);
                
                if (quantityInput) {
                    quantityInput.max = stockForSize;
                    quantityInput.value = Math.min(quantityInput.value, stockForSize);
                    quantityInput.disabled = stockForSize <= 0;
                    
                    // Update stock message when size changes
                    updateStockMessage(stockForSize);
                }
            });
            
            // Add validation to quantity input
            if (quantityInput) {
                quantityInput.addEventListener('input', function() {
                    const max = parseInt(this.max);
                    const value = parseInt(this.value);
                    
                    if (value > max) {
                        this.value = max;
                    } else if (value < 1 || isNaN(value)) {
                        this.value = 1;
                    }
                });
          }
        }
    } catch (err) {
        console.error("Error loading product:", err);
    }
}
function updateStockMessage(stock) {
    // Find existing message or create a new one
    let stockMsgEl = document.getElementById('stockMessage');
    
    if (!stockMsgEl) {
        stockMsgEl = document.createElement('div');
        stockMsgEl.id = 'stockMessage';
        
        // Insert after quantity input
        const quantitySelect = document.querySelector('.quantity-select');
        if (quantitySelect) {
            quantitySelect.appendChild(stockMsgEl);
        }
    }
    
    // Update the message based on stock level
    if (stock <= 0) {
        stockMsgEl.textContent = 'Out of stock';
        stockMsgEl.style.color = '#ff0000';
        stockMsgEl.style.fontWeight = 'bold';
    } else if (stock <= 10) {
      stockMsgEl.textContent = `Only ${stock} left`;
        stockMsgEl.style.color = '#ff0000';
        stockMsgEl.style.fontWeight = 'bold';
    } else {
        stockMsgEl.textContent = ''; // Hide message if plenty in stock
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (productId) {
    loadProductDetails(productId);
    document.querySelectorAll('.add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedSize = document.getElementById("size_product")?.value;
      const selectedQuantity = document.getElementById("quantity")?.value;
      const product = {
        product_id: productId,
        title: button.dataset.title,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
        quantity: selectedQuantity,
        size: selectedSize, // Assuming sizeSelect is defined in the scope
      };
        console.log(product);

      if (typeof addToCart === 'function') {
        addToCart(product);
      } else {
        console.error('Cart functionality not loaded');
      }
    });
});
document.querySelectorAll('.add-wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const product = {
      product_id: productId,
      title: button.dataset.title,
      price: parseFloat(button.dataset.price),
      image: button.dataset.image,
    };

    if (typeof addToWishlist === 'function') {
      addToWishlist(product);
    } else {
      console.error('Wishlist functionality not loaded');
    }
    });
});
  } else {
    console.error("No product ID provided in URL");
  }
});
