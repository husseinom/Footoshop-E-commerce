async function fetchAndPopulateCategories() {
    try {
        const genderResponse = await fetch("http://localhost:4000/category?is_gender=true");
        const typeResponse = await fetch("http://localhost:4000/category?is_gender=false");

        const genderData = await genderResponse.json();
        const typeData = await typeResponse.json();

        const genderCategories = genderData.gender_categories;
        const typeCategories = typeData.type_categories;

        if (!genderCategories || !typeCategories) {
            throw new Error("One of the category lists is missing");
        }

        const genderContainer = document.getElementById("categoryFilters");
        const typeContainer = document.getElementById("subCategoryFilters");

        // Clear containers
        genderContainer.innerHTML = '';
        typeContainer.innerHTML = '';

        // Populate gender categories
        genderCategories.forEach(category => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="category" value="${category.id}"> ${category.name}
            `;
            genderContainer.appendChild(label);
            genderContainer.appendChild(document.createElement('br'));
        });

        // Populate type categories
        typeCategories.forEach(category => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="subCategory" value="${category.id}"> ${category.name}
            `;
            typeContainer.appendChild(label);
            typeContainer.appendChild(document.createElement('br'));
        });

    } catch (err) {
        console.error("Failed to fetch categories:", err);
    }
}
function setupSliders() {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const minSize = document.getElementById('minSize');
    const maxSize = document.getElementById('maxSize');
  
    minPrice.oninput = () => document.getElementById('minPriceValue').textContent = minPrice.value;
    maxPrice.oninput = () => document.getElementById('maxPriceValue').textContent = maxPrice.value;
    minSize.oninput = () => document.getElementById('minSizeValue').textContent = minSize.value;
    maxSize.oninput = () => document.getElementById('maxSizeValue').textContent = maxSize.value;
}

function applyFilters() {
    const selectedCategories = [...document.querySelectorAll('input[name="category"]:checked')].map(el => el.value);
    console.log("Selected Categories:", selectedCategories);
    const selectedSubCategories = [...document.querySelectorAll('input[name="subCategory"]:checked')].map(el => el.value);
    console.log("Selected Subcategories:", selectedSubCategories);
    const priceMin = parseInt(document.getElementById('minPrice').value);
    const priceMax = parseInt(document.getElementById('maxPrice').value);
    const sizeMin = parseInt(document.getElementById('minSize').value);
    const sizeMax = parseInt(document.getElementById('maxSize').value);
  
    // Build query string
    const params = new URLSearchParams();
    selectedCategories.forEach(cat => params.append('categories', cat));
    selectedSubCategories.forEach(sub => params.append('subCategories', sub));
    params.append('priceMin', priceMin);
    params.append('priceMax', priceMax);
    params.append('sizeMin', sizeMin);
    params.append('sizeMax', sizeMax);
  
  
    // Make request
    fetch(`http://localhost:4000/products/filter?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        console.log('Filtered Products:', data);
        renderProducts(data);
      })
      .catch(err => console.error('Error fetching filtered products:', err));
}
function renderProducts(products) {

    const wrapper = document.getElementById("productGrid");
        wrapper.innerHTML = ""; // Clear previous products

        // Loop through all the products to create cards
        products.forEach(product => {
            const cardHTML = createProductCard(product); // Use the reusable function
            const card = document.createElement("div");
            card.innerHTML = cardHTML;
            wrapper.appendChild(card);
        });
}
async function loadAllProducts() {
    try {
        const params = new URLSearchParams(window.location.search);
        const categoryId = params.get("CategoryId"); // Gender category
        const typeId = params.get("TypeId"); // Type category
        console.log("CategoryId:", categoryId);
        console.log("TypeId:", typeId);

        // Build the API endpoint based on the query parameters
        let endpoint;
        if (categoryId) {
            endpoint = `http://localhost:4000/products/gender?CategoryId=${categoryId}`; // Fetch products by gender
        } else if (typeId) {
            endpoint = `http://localhost:4000/products/type?TypeId=${typeId}`; // Fetch products by type
        } else {
            endpoint = `http://localhost:4000/allproducts`; // Fetch all products
        }

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const products = await response.json();
        console.log("All Products:", products);

        if (!Array.isArray(products)) {
            throw new Error("Expected an array of products but got: " + JSON.stringify(products));
        }

        const wrapper = document.getElementById("productGrid");
        wrapper.innerHTML = ""; // Clear previous products

        // Loop through all the products to create cards
        products.forEach(product => {
            const cardHTML = createProductCard(product); // Use the reusable function
            const card = document.createElement("div");
            card.innerHTML = cardHTML;
            wrapper.appendChild(card);
        });

        // Add event listeners for "Add to Cart" buttons
      document.querySelectorAll('.wishlist-link').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const product = {
          product_id: parseInt(button.dataset.productId),
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

  } catch (err) {
    console.error("Error loading latest products:", err);
  }
}
  
window.addEventListener('DOMContentLoaded', () => {
    fetchAndPopulateCategories();
    loadAllProducts();
    setupSliders();
});


