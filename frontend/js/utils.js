function createProductCard(product) {
    return `
        <div class="card">
            <div class="card_top">
                <a href="singleproduct.html?id=${product.id}" class="card_image_link">
                    <img src="../../backend/${product.image_path}" alt="${product.title}" class="card_img">
                </a>
                <div class="card_tag">New</div>
                <div class="card_top_icons">
                    <a href="#" 
                    class="card_icon wishlist-link"
                    data-product-id="${product.id}"
                    data-title="${product.title}"
                    data-price="${product.actual_price}"
                    data-image="${product.image_path}">
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