// Swiper JS

  function getDirection() {
    var windowWidth = window.innerWidth;
    var direction = window.innerWidth <= 760 ? 'vertical' : 'horizontal';

    return direction;
  }

// Animation
ScrollReveal().reveal(".top_nav", {
  origin:"top",
  distance: "20px",
  opacity: 0,
});
ScrollReveal().reveal(".nav", {
  origin:"top",
  distance: "20px",
  opacity: 0,
  delay: 100,
});

ScrollReveal().reveal(".header", {
  origin:"top",
  distance: "20px",
  opacity: 0,
  delay: 200,
});

ScrollReveal().reveal(".section", {
  origin:"top",
  distance: "20px",
  opacity: 0,
  duration: 800,
  delay: 200,
});

ScrollReveal().reveal(".footer", {
  origin:"top",
  distance: "20px",
  opacity: 0,
  duration: 800,
  delay: 200,
});

// Product Interactions

async function loadLatestProducts() {
  try {
    const response = await fetch("http://localhost:4000/products/latest?limit=10" ,{
      method: 'GET',
      headers: { 'Content-Type': 'application/json',
       },
      credentials: 'include',
    });
    const products = await response.json();

    const wrapper = document.getElementById("swiper-wrapper");
    wrapper.innerHTML = ""; // Clear placeholder content

    for (const product of products) {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = createProductCard(product); // Use the reusable function
      wrapper.appendChild(slide);
    }

    // Reinitialize Swiper if necessary
    const swiper = new Swiper(".swiper", {
      slidesPerView: 4,
      direction: getDirection(),
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      on: {
        resize: function () {
          swiper.changeDirection(getDirection());
        },
      },
    });

    document.querySelectorAll('.wishlist-link').forEach(button => {
      button.addEventListener('click', (e) => {
        console.log("Click event triggered");
        e.preventDefault();
        console.log("preventDefault() called");
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

window.addEventListener("DOMContentLoaded", loadLatestProducts);

document.addEventListener('DOMContentLoaded', function() {
  // Initialize user WebSocket connection - this should be defined in websockets-manager.js
  if (typeof initWebSocket === 'function') {
    initWebSocket();
  } else {
    console.warn('WebSocket initialization function not found');
  }
  
  // Rest of your DOMContentLoaded code...
  const profileLink = document.getElementById('profile-link');
  if (profileLink) {
    profileLink.addEventListener('click', handleProfileClick);
  }
});

// Simple function to handle profile click
async function handleProfileClick(event) {
  try {
    const response = await fetch("http://localhost:4000/admin", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    
    const data = await response.json();
    
    // If unauthorized (no token/expired), go to login
    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }
    
    // If forbidden (not admin), stay on main page
    if (response.status === 403) {
      // User is logged in but not admin, could redirect to a user dashboard
      window.location.href = "main.html";
      return;
    }
    
    // If status is 200, user is admin
    if (response.status === 200) {
      window.location.href = "admin.html";
      return;
    }
  } catch (err) {
    console.error("Error checking role:", err);
    // If any error, go to login
    window.location.href = "login.html";
  }
}

// Add click event listener to profile element
