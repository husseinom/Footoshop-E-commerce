document.addEventListener("DOMContentLoaded", function () {
    try {
      // DOM Elements with null checks
      const menuToggle = document.getElementById("menuToggle");
      const sidebar = document.getElementById("sidebar");
      const mainContent = document.getElementById("mainContent");
      const themeToggle = document.getElementById("themeToggle");
      const body = document.body;
  
      // Check if essential elements exist
      if (!menuToggle || !sidebar || !mainContent || !themeToggle) {
        throw new Error("Essential elements not found in DOM");
      }
  
      // Theme Management
      function applyTheme(theme) {
        body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }
  
      function getPreferredTheme() {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) return storedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
  
      // User profile dropdown
      const userProfile = document.getElementById("userProfile");
      if (userProfile) {
        userProfile.addEventListener("click", function (e) {
          // Prevent closing when clicking inside dropdown
          if (e.target.closest(".profile-dropdown")) return;
  
          this.classList.toggle("active");
        });
  
        // Close when clicking outside
        document.addEventListener("click", function (e) {
          if (!userProfile.contains(e.target)) {
            userProfile.classList.remove("active");
          }
        });
      }
  
      // Initialize theme
      applyTheme(getPreferredTheme());
  
      // Toggle sidebar
      function toggleSidebar() {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded");
  
        // Mobile behavior
        if (window.innerWidth <= 992) {
          sidebar.classList.toggle("show");
        }
      }
  
      menuToggle.addEventListener("click", toggleSidebar);
  
      // Toggle theme
      themeToggle.addEventListener("click", function () {
        const currentTheme = body.getAttribute("data-theme") || "light";
        applyTheme(currentTheme === "dark" ? "light" : "dark");
      });
  
      // Submenu handling
      const submenuItems = document.querySelectorAll(".has-submenu");
  
      function closeAllSubmenus() {
        submenuItems.forEach((item) => {
          item.classList.remove("open");
        });
      }
  
      submenuItems.forEach((item) => {
        const link = item.querySelector("a");
  
        if (!link) return;
  
        link.addEventListener("click", function (e) {
          // Prevent default only if on mobile or sidebar is collapsed
          if (
            window.innerWidth <= 992 ||
            sidebar.classList.contains("collapsed")
          ) {
            e.preventDefault();
          }
  
          // Close others if this one isn't open
          if (!item.classList.contains("open")) {
            closeAllSubmenus();
          }
  
          // Toggle current
          item.classList.toggle("open");
        });
      });
  
      // Close submenus when clicking outside on mobile
      document.addEventListener("click", function (e) {
        if (
          window.innerWidth <= 992 &&
          !sidebar.contains(e.target) &&
          !e.target.closest(".has-submenu")
        ) {
          closeAllSubmenus();
        }
      });
  
      // Close sidebar when clicking a non-submenu link (mobile)
      const menuLinks = document.querySelectorAll(
        ".menu-item:not(.has-submenu) a"
      );
      menuLinks.forEach((link) => {
        link.addEventListener("click", function () {
          if (window.innerWidth <= 992) {
            sidebar.classList.remove("show");
          }
        });
      });
  
      // Handle window resize
      let resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (window.innerWidth > 992) {
            sidebar.classList.remove("show");
          }
        }, 250);
      });
  
      console.log("Sidebar initialized successfully");
    } catch (error) {
      console.error("Error initializing sidebar:", error);
    }
  });

  const token = localStorage.getItem("auth_token");
  console.log("Token:", token);
  
  // Wait for DOM to load
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("CategoryForm")?.addEventListener("submit", handleAddCategory);
    document.getElementById("ProductForm")?.addEventListener("submit", handleAddProduct);
    // document.getElementById("UserForm")?.addEventListener("submit", handleAddUser);
    fetchAndPopulateCategories();
  });
  
  async function handleAddCategory(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const slug = document.getElementById("slug").value;
    const is_gender = document.getElementById("is_gender-select").value;
  
    try {
      const response = await fetch("http://localhost:4000/category", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ name, slug, is_gender }),
      });
  
      if (!response.ok) throw new Error("Failed to add category");
      const data = await response.json();
      console.log("Category added:", data);
      alert("Category added successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault();
  
    const product_id = document.getElementById("productId").value || null;
    const seller_id = 1; // Assuming the seller is logged in and has an id of 1
    const title = document.getElementById("productTitle").value;
    const created_price = parseFloat(document.getElementById("productPrice").value);
    const actual_price = created_price;
    const condition = document.getElementById("condition-select").value;
    const gender_category_id = parseInt(document.getElementById("genderCategory").value);
    const type_category_id = parseInt(document.getElementById("typeCategory").value);
    const description = document.getElementById("productDescription").value || null;
  
    const size = parseInt(document.getElementById("size").value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const is_primary = parseInt(document.getElementById("primaryImageSelect").value || "0");
  
    const imageFiles = document.getElementById("productImages").files;
    
    const imagesPayload = [];
    for (let i = 0; i < imageFiles.length; i++) {
      imagesPayload.push({
        image_path: "", // backend will fill this in
        display_order: i,
        is_primary: i === is_primary
      });
    }
  
    // Create the product data object
    const productData = {
      product_id,
      seller_id,
      title,
      created_price,
      actual_price,
      condition,
      gender_category_id,
      type_category_id,
      description,
      is_available: true,
      is_approved: true,
      variants: [{ size, quantity }],
      images: imagesPayload
    };
  
    const formData = new FormData();
    formData.append("product", JSON.stringify(productData));
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("images", imageFiles[i]);
    }
  
    try {
      const response = await fetch("http://localhost:4000/products", {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to add product");
  
      const data = await response.json();
      console.log("Product added:", data);
  
      alert("Product added successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
  

// Image preview
const fileInput = document.getElementById("productImages");
const previewContainer = document.getElementById("imagePreviewContainer");
const primarySelect = document.getElementById("primaryImageSelect");
let selectedFiles = [];

fileInput.addEventListener("change", (event) => {
  previewContainer.innerHTML = "";
  primarySelect.innerHTML = "";
  selectedFiles = Array.from(event.target.files);

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDiv = document.createElement("div");
      imageDiv.classList.add("preview-item");

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.innerText = "X";
      removeBtn.classList.add("remove-btn");
      removeBtn.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        updateFileInput();
        imageDiv.remove();
        updatePrimarySelect(); // Update dropdown when image removed
      });

      imageDiv.appendChild(img);
      imageDiv.appendChild(removeBtn);
      previewContainer.appendChild(imageDiv);
    };
    reader.readAsDataURL(file);

    const option = document.createElement("option");
    option.value = index;
    option.text = `Image ${index + 1}`;
    primarySelect.appendChild(option);
  });
});

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;
}

function updatePrimarySelect() {
  primarySelect.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `Image ${index + 1}`;
    primarySelect.appendChild(option);
  });
}
async function fetchAndPopulateCategories() {
  try {
    const genderResponse = await fetch("http://localhost:4000/category?is_gender=true");
    const typeResponse = await fetch("http://localhost:4000/category?is_gender=false");
    
    const genderData = await genderResponse.json();
    const typeData = await typeResponse.json();
    console.log("Gender Data:", genderData);
    console.log("Type Data:", typeData);
    const genderCategories = genderData.gender_categories;
    const typeCategories = typeData.type_categories;

    if (!genderCategories || !typeCategories) {
      throw new Error("One of the category lists is missing");
    }
    console.log("Gender Categories:", genderCategories);
    console.log("Type Categories:", typeCategories);
    const genderSelect = document.getElementById("genderCategory");
    const typeSelect = document.getElementById("typeCategory");

    genderCategories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      genderSelect.appendChild(option);
    });

    typeCategories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      typeSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }
}

async function fetchAllProducts() {
  try {
    const response = await fetch('http://localhost:4000/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
       },
      credentials: 'include',
    });

    const data = await response.json();
    console.log("Fetched data:", data);

    const products = Array.isArray(data) ? data : data.products;
    if (!products || !Array.isArray(products)) {
      throw new Error("Invalid product data");
    }

    const productList = document.getElementById('product-list');
    productList.innerHTML = "";

    products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product-item');
    
      let html = '';
      for (const key in product) {
        html += `<p><strong>${key}</strong>: ${product[key]}</p>`;
      }
      html += `<button class="remove-btn-products" data-id="${product.id}">Remove</button>`;
    
      productDiv.innerHTML = html;
      productList.appendChild(productDiv);
    });

    document.querySelectorAll('.remove-btn-products').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        try {
          const response = await fetch(`http://localhost:4000/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });
          if (response.ok) {
            e.target.parentElement.remove(); // Remove from UI
          } else {
            console.error("Delete failed");
          }
        } catch (err) {
          console.error("Error deleting product:", err);
        }
      });
    });
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}