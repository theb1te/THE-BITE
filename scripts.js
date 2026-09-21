/* =========================================================
   THE BITE · scripts.js
   Aquí va la interacción del sitio. No es necesario repetir
   este código dentro de cada HTML.
   ========================================================= */


const CONFIG = {
  brand: "THE BITE",
  slogan: "La bite de las bites"
};


/* ---------- MENÚ MÓVIL ---------- */
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");


if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });


  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navMenu.classList.remove("open"));
  });
}


/* ---------- TEMA CLARO / OSCURO ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  if (themeIcon) themeIcon.textContent = theme === "light" ? "☀" : "☾";
  localStorage.setItem("dragonTheme", theme);
}


const savedTheme = localStorage.getItem("dragonTheme") || "dark";
applyTheme(savedTheme);


themeToggle?.addEventListener("click", () => {
  const newTheme = document.documentElement.classList.contains("light") ? "dark" : "light";
  applyTheme(newTheme);
});


/* ---------- AÑO AUTOMÁTICO ---------- */
document.querySelectorAll(".current-year").forEach(element => {
  element.textContent = new Date().getFullYear();
});


/* ---------- ANIMACIONES AL HACER SCROLL ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });


document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));


/* ---------- CARRITO ---------- */
let cart = JSON.parse(localStorage.getItem("dragonCart")) || [];


function saveCart() {
  localStorage.setItem("dragonCart", JSON.stringify(cart));
  updateCartCount();
}


function updateCartCount() {
  const count = document.getElementById("cartCount");
  if (count) {
    count.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}


function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}


function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  saveCart();
  renderCart();
}


document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.name, Number(button.dataset.price));
    button.textContent = "¡Agregado!";
    setTimeout(() => button.textContent = "Agregar", 900);
  });
});


function renderCart() {
  let panel = document.getElementById("cartPanel");


  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "cartPanel";
    panel.className = "cart-panel";
    panel.innerHTML = `
      <header>
        <h2>Tu carrito</h2>
        <button class="icon-button" id="closeCart" type="button" aria-label="Cerrar carrito">×</button>
      </header>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-total">
        <span>Total</span><strong id="cartTotal">$0</strong>
      </div>
    `;
    document.body.appendChild(panel);


    const overlay = document.createElement("div");
    overlay.id = "cartOverlay";
    overlay.className = "cart-overlay";
    document.body.appendChild(overlay);


    document.getElementById("closeCart").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
  }


  const items = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");


  if (!cart.length) {
    items.innerHTML = `<p style="color:var(--muted);font-size:.8rem;">Tu carrito está vacío.</p>`;
  } else {
    items.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div>${item.quantity} × ${formatPrice(item.price)}</div>
        </div>
        <button type="button" data-remove="${index}" aria-label="Eliminar ${item.name}">×</button>
      </div>
    `).join("");


    items.querySelectorAll("[data-remove]").forEach(button => {
      button.addEventListener("click", () => {
        cart.splice(Number(button.dataset.remove), 1);
        saveCart();
        renderCart();
      });
    });
  }


  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalElement.textContent = formatPrice(total);
}


function openCart() {
  renderCart();
  document.getElementById("cartPanel")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}


function closeCart() {
  document.getElementById("cartPanel")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}


document.getElementById("openCart")?.addEventListener("click", openCart);
updateCartCount();


/* ---------- FILTRO DE PRODUCTOS ---------- */
const productFilter = document.getElementById("productFilter");


productFilter?.addEventListener("change", event => {
  const category = event.target.value;


  document.querySelectorAll(".product-card").forEach(card => {
    card.style.display =
      category === "all" || card.dataset.category === category
        ? ""
        : "none";
  });
});


/* ---------- CHATBOT SIMPLE ---------- */
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");


function addMessage(text, type) {
  if (!chatMessages) return;
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


function botAnswer(question) {
  const q = question.toLowerCase();


  if (q.includes("producto") || q.includes("catálogo") || q.includes("catalogo")) {
    return "Puedes revisar nuestro catálogo en la sección Productos. Allí encontrarás las opciones disponibles y sus precios.";
  }


  if (q.includes("precio") || q.includes("vale") || q.includes("cuesta")) {
    return "Los precios aparecen directamente en las tarjetas de cada producto. Si necesitas una cotización específica, puedes escribirnos desde Contacto.";
  }


  if (q.includes("compr") || q.includes("pedido")) {
    return "Selecciona un producto, agrégalo al carrito y luego contáctanos para confirmar disponibilidad y coordinar la compra.";
  }


  if (q.includes("contact") || q.includes("whatsapp") || q.includes("instagram")) {
    return "Encuentra nuestros canales de contacto en la sección Contacto. Allí puedes consultar correo, redes y horario de atención.";
  }


  return "Puedo ayudarte con productos, precios, pedidos y formas de contacto. Prueba con una de esas opciones.";
}


chatForm?.addEventListener("submit", event => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;


  addMessage(question, "user");
  chatInput.value = "";


  setTimeout(() => addMessage(botAnswer(question), "bot"), 450);
});


document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    addMessage(question, "user");
    setTimeout(() => addMessage(botAnswer(question), "bot"), 450);
  });
});


/* ---------- FORMULARIO DE CONTACTO ---------- */
document.getElementById("contactForm")?.addEventListener("submit", event => {
  event.preventDefault();


  const message = document.getElementById("contactMessage");
  if (message) {
    message.textContent = "Mensaje preparado. Para recibirlo realmente debes conectar este formulario a un servicio de formularios o a un backend.";
  }


  event.target.reset();
});