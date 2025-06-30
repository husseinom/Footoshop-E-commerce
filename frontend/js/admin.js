async function verifyRole(){
  try{
    const response = await fetch("http://localhost:4000/admin", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // This sends the cookie
    });
    
    const data = await response.json();
    console.log(data);
    
    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }
    
    if (response.status === 403) {
      window.location.href = "main.html";
      return;
    }
    
    if (response.status === 200){
      console.log("User is admin");
    }

  } catch (err) {
    console.error("Error verifying token:", err);
  }
}



// Keep initSidebar as a standalone function so it can be called from anywhere
function initSidebar() {
  try {
    // DOM Elements with null checks
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Check if essential elements exist
    if (!menuToggle || !sidebar || !mainContent || !themeToggle) {
      console.warn("Some sidebar elements not found, this might be expected on some pages");
      return;
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
    return true;
  } catch (error) {
    console.error("Error initializing sidebar:", error);
    return false;
  }
}

// KEEP ONLY ONE DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin page loaded");
  
  // 1. Always verify role first
  verifyRole();
  
  // 2. Initialize sidebar (now defined as a separate function that can be called anywhere)
  initSidebar();
  
  // 3. Add form event handlers
  document.getElementById("CategoryForm")?.addEventListener("submit", handleAddCategory);
  document.getElementById("ProductForm")?.addEventListener("submit", handleAddProduct);
  
  // 4. Set up image preview handlers if the elements exist
  // if (document.getElementById("productImages")) {
  //   setupImagePreviewHandlers();
  // }
  
  // 5. Get the current page path and load page-specific content
  const currentPath = window.location.pathname;
  console.log("Current page path:", currentPath);
  
  if (currentPath.includes("productsAdmin.html")) {
    console.log("On products admin page");
    fetchAllProducts();
  }
  else if (currentPath.includes("usersAdmin.html")) {
    console.log("On users admin page");
    fetchAllUserData();
  }
  else if (currentPath.includes("admin.html")) {
    console.log("On main admin page");
    fetchAndPopulateCategories();
  }
  
  // 6. Always initialize WebSocket on admin pages
  initAdminWebSocket();
});

// Add this new function to handle image previews
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
  

// Image preview setup - ONLY run if elements exist
const fileInput = document.getElementById("productImages");
const previewContainer = document.getElementById("imagePreviewContainer");
const primarySelect = document.getElementById("primaryImageSelect");

// Only set up image preview if all elements exist
if (fileInput && previewContainer && primarySelect) {
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
    console.log("Fetching products...");
    const response = await fetch("http://localhost:4000/products", {
      method: "GET",
      headers: getAuthHeader(),
      credentials: "include" // This is crucial - it sends cookies
    });
    
    if (response.status === 401) {
      console.log("Authentication failed - redirecting to login");
      window.location.href = "login.html";
      return;
    }
    
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

// WebSocket code
let adminWs = null;

function initAdminWebSocket() {
  try {
    // Close existing connection if any
    if (adminWs && adminWs.readyState !== WebSocket.CLOSED) {
      adminWs.close();
    }
    
    console.log("Initializing admin WebSocket connection...");
    
    // Connect to the WebSocket endpoint - don't add token in URL, rely on cookies
    adminWs = new WebSocket('ws://localhost:4000/ws/connect');
    
    adminWs.onopen = () => {
      console.log("WebSocket connection opened successfully!");
      
      // No need to send token explicitly - the cookie is used for auth
    };
    
    adminWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        // Handle different message types
        if (data.type === "welcome") {
          console.log("WebSocket welcome message:", data);
        } 
        else if (data.type === "connected_users_update") {
          console.log("Connected users updated:", data.users);
          // Call function to update UI if element exists
          const usersList = document.getElementById('connected-users-list');
          if (usersList) {
            updateConnectedUsersList(data.users);
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    adminWs.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      // Try to reconnect after a delay
      setTimeout(initAdminWebSocket, 5000);
    };
    
    adminWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
  }
}

// Function to fetch all user data
async function fetchAllUserData() {
  try {
    // Fetch registered users
    const registeredResponse = await fetch("http://localhost:4000/admin/users", {
      method: "GET",
      headers: getAuthHeader(),
      credentials: "include"
    });
    
    if (!registeredResponse.ok) {
      throw new Error(`Error fetching registered users: ${registeredResponse.status}`);
    }
    
    const registeredUsers = await registeredResponse.json();
    console.log("Registered Users:", registeredUsers);
    
    // Fetch connected users 
    const connectedResponse = await fetch("http://localhost:4000/admin/connected-users", {
      method: "GET",
      headers: getAuthHeader(),
      credentials: "include"
    });
    
    if (!connectedResponse.ok) {
      throw new Error(`Error fetching connected users: ${connectedResponse.status}`);
    }
    
    const connectedUsers = await connectedResponse.json();
    console.log("Connected Users:", connectedUsers);
    
    // Process and display both sets of users
    displayUsers(registeredUsers, connectedUsers);
    
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

// Update the displayRegisteredUsers function
function displayRegisteredUsers(users) {
  const usersList = document.getElementById('users-list');
  if (!usersList) {
    console.error("users-list element not found in DOM");
    return;
  }
  
  usersList.innerHTML = '';
  
  if (!users || users.length === 0) {
    usersList.innerHTML = '<p>No registered users found</p>';
    return;
  }
  
  users.forEach(user => {
    try {
      const userItem = document.createElement('div');
      userItem.classList.add('user-item');
      
      // Determine online status - will be updated by WebSocket later
      const isOnline = false; // Default to offline
      
      // Format date if available
      const createdDate = user.created_at ? 
        new Date(user.created_at).toLocaleDateString() : 'Unknown';
      
      userItem.innerHTML = `
        <div class="user-info">
          <h3>${user.username || 'User'}</h3>
          <p class="user-email">${user.email || 'No email'}</p>
          <div class="user-details">
            <span class="user-role ${user.role === 'admin' ? 'admin-role' : ''}">${user.role || 'user'}</span>
            <span class="user-status ${isOnline ? 'online' : 'offline'}">${isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <p class="user-id">ID: ${user.id} • Joined: ${createdDate}</p>
        </div>
        <div class="user-actions">
          <button class="remove-user-btn" data-id="${user.id}">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </div>
      `;
      
      usersList.appendChild(userItem);
      
      // Store user ID as data attribute for status updates
      userItem.dataset.userId = user.id;
    } catch (error) {
      console.error("Error creating user item:", error);
    }
  });
  
  // Add event listeners for user actions
  document.querySelectorAll('.remove-user-btn').forEach(button => {
    button.addEventListener('click', deleteUser);
  });
}

// Function to delete a user
async function deleteUser(event) {
  const userId = event.target.dataset.id;
  if (!confirm(`Are you sure you want to delete the user with ID ${userId}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:4000/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    
    // On success, remove the user from UI
    const userItem = event.target.closest('.user-item');
    if (userItem) {
      // Add fade out animation
      userItem.style.transition = 'all 0.3s ease';
      userItem.style.opacity = '0';
      userItem.style.transform = 'translateX(20px)';
      
      // Remove from DOM after animation
      setTimeout(() => {
        userItem.remove();
      }, 300);
    }
    
    showToast('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    showToast(`Failed to delete user: ${error.message}`);
  }
}

// Helper function to show toast messages
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


// Update the updateConnectedUsersList function
function updateConnectedUsersList(connectedUsers) {
  console.log("Updating connected users list:", connectedUsers);
  
  // First, update the connected users panel if it exists
  const connectedUsersList = document.getElementById('connected-users-list');
  if (connectedUsersList) {
    connectedUsersList.innerHTML = '';
    
    if (!connectedUsers || connectedUsers.length === 0) {
      connectedUsersList.innerHTML = '<p>No users currently connected</p>';
    } else {
      connectedUsers.forEach(user => {
        try {
          const userItem = document.createElement('div');
          userItem.classList.add('user-item', 'new-connection');
          
          // Calculate how long they've been connected if connectionTime is available
          let connectionInfo = '';
          if (user.connectionTime) {
            const connectedTime = new Date(user.connectionTime);
            const now = new Date();
            const minutesConnected = Math.floor((now - connectedTime) / (1000 * 60));
            connectionInfo = minutesConnected > 0 ? 
              `• Connected for ${minutesConnected} min` : 
              '• Just connected';
          }
          
          userItem.innerHTML = `
            <span class="username">
              <i class="fas fa-circle" style="color: #4caf50; font-size: 10px; margin-right: 8px;"></i>
              ${user.username}
            </span>
            <span class="connection-time">${connectionInfo}</span>
            <span class="role ${user.isAdmin ? 'admin-role' : 'user-role'}">${user.isAdmin ? 'Admin' : 'User'}</span>
          `;
          connectedUsersList.appendChild(userItem);
          
          // Remove the highlight animation after it plays
          setTimeout(() => {
            userItem.classList.remove('new-connection');
          }, 2000);
          
        } catch (e) {
          console.error("Error creating connected user item:", e);
        }
      });
    }
  }
  
  // Also update the online/offline status in the main users list
  const userItems = document.querySelectorAll('.user-item[data-user-id]');
  if (userItems.length > 0) {
    // First mark all as offline
    userItems.forEach(item => {
      const statusElement = item.querySelector('.user-status');
      if (statusElement) {
        statusElement.className = 'user-status offline';
        statusElement.textContent = 'Offline';
      }
    });
    
    // Then mark connected ones as online
    connectedUsers.forEach(connectedUser => {
      const userItem = document.querySelector(`.user-item[data-user-id="${connectedUser.userId}"]`);
      if (userItem) {
        const statusElement = userItem.querySelector('.user-status');
        if (statusElement) {
          statusElement.className = 'user-status online';
          statusElement.textContent = 'Online';
        }
      }
    });
  }
}

// Add this function - it was called but not defined
function displayUsers(registeredUsers, connectedUsers) {
  // First, display registered users
  displayRegisteredUsers(registeredUsers);
  
  // Then update online status based on connected users
  updateConnectedUsersList(connectedUsers);
  
  // Update online status indicators (they were already updated in updateConnectedUsersList)
  console.log(`Displayed ${registeredUsers.length} registered users and ${connectedUsers.length} connected users`);
}

function getAuthHeader() {
  return {
    "Content-Type": "application/json",
    // Don't try to access token from localStorage - cookies will be sent automatically
  };
}

