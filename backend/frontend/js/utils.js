// Utility function to get the correct image URL
function getImageUrl(imagePath) {
    if (!imagePath) return '';
    
    // If imagePath already starts with http or /, use it as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
        return imagePath;
    }
    
    // Convert Windows backslashes to forward slashes
    imagePath = imagePath.replace(/\\/g, '/');
    
    // For development and production, images are served from /assets/
    if (imagePath.startsWith('assets/')) {
        return `/${imagePath}`;
    } else {
        // If the path doesn't start with assets/, add it
        return `/assets/${imagePath}`;
    }
}

function createProductCard(product) {
    return `
        <div class="card">
            <div class="card_top">
                <a href="singleproduct.html?id=${product.id}" class="card_image_link">
                    <img src="${getImageUrl(product.image_path)}" alt="${product.title}" class="card_img">
                </a>
                <div class="card_tag">New</div>
                <div class="card_top_icons">
                    <a href="#" 
                    class="card_icon wishlist-link"
                    data-product-id="${product.id}"
                    data-title="${product.title}"
                    data-price="${product.actual_price}"
                    data-image="${getImageUrl(product.image_path)}">
                    <i class="fas fa-heart"></i></a>
                </div>
            </div>
            <div class="card_body">
                <h3 class="card_title">${product.title}</h3>
                <p class="card_price">${product.actual_price}$</p>
            </div>
        </div>
    `;
}

// API utility function
function getApiUrl(endpoint) {
    const baseUrl = window.API_BASE_URL || 'https://footoshop-backend.fly.dev';
    return `${baseUrl}${endpoint}`;
}