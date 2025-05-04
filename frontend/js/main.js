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
      slide.innerHTML = `
        <div class="card">
          <div class="card_top">
            <img src="../../backend/${product.image_path}" alt="${product.title}" class="card_img">
            <div class="card_tag">New</div>
            <div class="card_top_icons">
              <a href="#" 
                 class="card_icon add-to-cart" 
                 data-product-id="${product.id}"
                 data-title="${product.title}"
                 data-price="${product.actual_price}"
                 data-image="${product.image_path}">
                 <i class="fas fa-shopping-cart"></i>
              </a>
              <a href="#" class="card_icon"><i class="fas fa-heart"></i></a>
            </div>
          </div>
          <div class="card_body">
            <h3 class="card_title">${product.title}</h3>
            <p class="card_price">${product.actual_price}$</p>
          </div>
        </div>
      `;
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

    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const product = {
          product_id: parseInt(button.dataset.productId),
          title: button.dataset.title,
          price: parseFloat(button.dataset.price),
          image: button.dataset.image,
          quantity: 1,
          size: 42
        };
    
        if (typeof addToCart === 'function') {
          addToCart(product);
        } else {
          console.error('Cart functionality not loaded');
        }
      });
    });

  } catch (err) {
    console.error("Error loading latest products:", err);
  }

}

window.addEventListener("DOMContentLoaded", loadLatestProducts);