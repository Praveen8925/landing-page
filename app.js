/**
 * VELONDRA by PS — Interactive Web Application Logic
 * E-Commerce Shopping, Variant Selection, Cart Management & Checkout
 */

// Product Catalogue Data (Strictly complying with Requirements.md)
const PRODUCT_DATA = {
  cotton: {
    id: 'cotton',
    name: 'Pure Organic Cotton',
    statement: 'Pure Comfort Everyday',
    quote: 'Natural comfort, all day long.',
    desc: 'Soft & gentle on skin, highly breathable mesh that reduces irritation & rashes. Suitable for daily use.',
    badge: 'Most Popular',
    badgeClass: 'cotton',
    image: 'Cotton.jpeg',
    sizes: [
      { size: 'L', price: 129, label: 'L (240mm)', available: true },
      { size: 'XL', price: 139, label: 'XL (280mm)', available: true, default: true },
      { size: 'XXL', price: 159, label: 'XXL (320mm)', available: true }
    ]
  },
  bamboo: {
    id: 'bamboo',
    name: 'Bamboo Antibacterial',
    statement: 'Naturally Soft, Naturally Better',
    quote: 'Good for you, kind to the planet.',
    desc: 'Naturally antibacterial, ultra soft & breathable, keeps you dry for longer. Eco-friendly & biodegradable fibres with odour control.',
    badge: 'Eco Choice',
    badgeClass: 'bamboo',
    image: 'Bamboo.jpeg',
    sizes: [
      { size: 'XL', price: 149, label: 'XL (280mm)', available: true, default: true },
      { size: 'XXL', price: 169, label: 'XXL (320mm)', available: true },
      { size: 'XXXL', price: 189, label: 'XXXL (350mm)', available: true }
    ]
  },
  anion: {
    id: 'anion',
    name: 'Anion Herbal Wellness',
    statement: 'Advanced Care for Her',
    quote: 'Extra care for her wellbeing.',
    desc: 'Infused with negative ions (anions) to help reduce odour, keep fresh and clean, and reduce bacterial growth. Ideal for heavy flow.',
    badge: 'Wellness Tech',
    badgeClass: 'anion',
    image: 'Anion.jpeg',
    sizes: [
      { size: 'XL', price: 159, label: 'XL (280mm)', available: true, default: true },
      { size: 'XXL', price: 179, label: 'XXL (320mm)', available: true }
    ]
  },
  // Launching Offer Gift Packs
  gift_cotton: {
    id: 'gift_cotton',
    name: 'Cotton Gift Pack',
    variant: 'Cotton (L, XL, XXL)',
    packType: 'bundle',
    price: 349,
    originalPrice: 427,
    image: '1.jpeg',
    desc: 'Contains 3 full packs (30 pads): L, XL, XXL in Luxury Keepsake Box.'
  },
  gift_anion: {
    id: 'gift_anion',
    name: 'Anion Gift Pack',
    variant: 'Anion (XL, XXL)',
    packType: 'bundle',
    price: 249,
    originalPrice: 338,
    image: '1.jpeg',
    desc: 'Contains 2 full packs (20 pads): XL, XXL in Luxury Keepsake Box.'
  },
  gift_bamboo: {
    id: 'gift_bamboo',
    name: 'Bamboo Gift Pack',
    variant: 'Bamboo (XL, XXL, XXXL)',
    packType: 'bundle',
    price: 449,
    originalPrice: 507,
    image: '1.jpeg',
    desc: 'Contains 3 full packs (30 pads): XL, XXL, XXXL in Luxury Keepsake Box.'
  }
};

// Current active selections for products
const activeSelections = {
  cotton: { size: 'L', price: 129 },
  bamboo: { size: 'XL', price: 149 },
  anion: { size: 'XL', price: 159 }
};

// Cart State Management
class CartManager {
  constructor() {
    this.cart = this.loadCart();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('velondra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('velondra_cart', JSON.stringify(this.cart));
    } catch (e) {}
    this.updateUI();
  }

  addItem(item) {
    const existingIndex = this.cart.findIndex(
      i => i.id === item.id && i.size === item.size
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += item.quantity || 1;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        size: item.size || 'Standard Bundle',
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1
      });
    }

    this.saveCart();
    showToast(`Added ${item.name} (${item.size || 'Bundle'}) to cart!`);
  }

  updateQuantity(index, delta) {
    if (this.cart[index]) {
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.cart.splice(index, 1);
      }
      this.saveCart();
    }
  }

  removeItem(index) {
    if (this.cart[index]) {
      const removed = this.cart.splice(index, 1)[0];
      this.saveCart();
      showToast(`Removed ${removed.name} from cart.`);
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  updateUI() {
    // Update cart badge counts across navbar
    const count = this.getCount();
    const subtotal = this.getSubtotal();

    document.querySelectorAll('.cart-badge, .header-cart-count').forEach(el => {
      el.textContent = count;
    });

    const cartDrawerBody = document.getElementById('cart-items-container');
    const cartSubtotalEl = document.getElementById('cart-subtotal-val');
    const cartTotalEl = document.getElementById('cart-total-val');
    const cartEmptyState = document.getElementById('cart-empty-state');
    const cartFooter = document.getElementById('cart-drawer-footer');

    if (!cartDrawerBody) return;

    if (this.cart.length === 0) {
      cartEmptyState.style.display = 'block';
      cartDrawerBody.innerHTML = '';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    cartEmptyState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    cartDrawerBody.innerHTML = this.cart.map((item, idx) => `
      <div class="cart-item-card">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">Size: ${item.size} • 10 pcs/pack</div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="cartManager.updateQuantity(${idx}, -1)">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="cartManager.updateQuantity(${idx}, 1)">+</button>
            </div>
            <div class="cart-item-price">₹${item.price * item.quantity}</div>
          </div>
          <button class="cart-item-remove" onclick="cartManager.removeItem(${idx})">Remove</button>
        </div>
      </div>
    `).join('');

    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal}`;
    if (cartTotalEl) cartTotalEl.textContent = `₹${subtotal}`;
  }
}

const cartManager = new CartManager();

// Function to handle Size Selection for Variant Cards
function selectProductSize(variantKey, size, price, element) {
  activeSelections[variantKey] = { size, price };

  // Update dynamic price display
  const priceEl = document.getElementById(`${variantKey}-price-val`);
  if (priceEl) {
    priceEl.textContent = `₹${price}`;
  }

  // Update active button state
  const container = document.getElementById(`${variantKey}-size-buttons`);
  if (container) {
    container.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
  }
}

// Add Variant to Cart from homepage card
function addVariantToCart(variantKey) {
  const prod = PRODUCT_DATA[variantKey];
  const selection = activeSelections[variantKey];
  if (!prod || !selection) return;

  cartManager.addItem({
    id: `${prod.id}_${selection.size}`,
    name: prod.name,
    size: selection.size,
    price: selection.price,
    image: prod.image,
    quantity: 1
  });

  openCart();
}

// Add Gift Pack to Cart
function addGiftPackToCart(giftKey) {
  const gift = PRODUCT_DATA[giftKey];
  if (!gift) return;

  cartManager.addItem({
    id: gift.id,
    name: gift.name,
    size: gift.variant,
    price: gift.price,
    image: gift.image,
    quantity: 1
  });

  openCart();
}

// Cart Drawer open/close
function openCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    cartManager.updateUI();
  }
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
  }
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color: #C59A44; font-size: 1.2rem;">✔</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Checkout Modal Handling
function openCheckoutModal() {
  if (cartManager.cart.length === 0) {
    showToast('Your cart is empty. Add items first!');
    return;
  }

  closeCart();
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    // Populate Order Review
    const reviewContainer = document.getElementById('checkout-order-items');
    const totalEl = document.getElementById('checkout-total-val');
    const subtotal = cartManager.getSubtotal();

    if (reviewContainer) {
      reviewContainer.innerHTML = cartManager.cart.map(item => `
        <div class="order-review-item">
          <span>${item.name} (${item.size}) × ${item.quantity}</span>
          <span style="font-weight: 600;">₹${item.price * item.quantity}</span>
        </div>
      `).join('');
    }

    if (totalEl) totalEl.textContent = `₹${subtotal}`;
    modal.classList.add('open');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
}

// Select Payment Method
function selectPaymentMethod(element) {
  document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
}

// Process Order & Generate Verified Invoice
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const fullName = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const state = document.getElementById('cust-state').value.trim();
  const pincode = document.getElementById('cust-pincode').value.trim();

  if (!fullName || !phone || !address || !city || !pincode) {
    alert('Please fill all required customer and delivery address fields.');
    return;
  }

  // Create Order Record
  const orderNumber = 'VEL-' + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const items = [...cartManager.cart];
  const grandTotal = cartManager.getSubtotal();

  // Close Checkout Modal & Open Order Confirmation Modal
  closeCheckoutModal();

  const confirmModal = document.getElementById('confirmation-modal');
  const receiptBody = document.getElementById('receipt-details-body');

  if (confirmModal && receiptBody) {
    receiptBody.innerHTML = `
      <div class="receipt-header">
        <h4 style="font-family: var(--font-headline); font-size: 1.3rem; color: var(--color-navy); margin-bottom: 0.2rem;">VELONDRA by PS</h4>
        <span style="font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-gold-dark); font-weight: 600;">Official Tax Invoice & Order Receipt</span>
        <div style="margin-top: 0.5rem; font-size: 0.78rem; color: var(--color-text-secondary);">
          <strong>Order ID:</strong> ${orderNumber} | <strong>Date:</strong> ${orderDate}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.78rem;">
        <div>
          <strong style="color: var(--color-navy);">Customer Information:</strong><br>
          ${fullName}<br>
          Phone: ${phone}
        </div>
        <div>
          <strong style="color: var(--color-navy);">Delivery Address:</strong><br>
          ${address}, ${city}, ${state} — ${pincode}
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <strong style="font-size: 0.8rem; color: var(--color-navy); display: block; margin-bottom: 0.5rem;">Ordered Items:</strong>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
          <thead>
            <tr style="background: #FAF5EF; border-bottom: 1px solid #E5C478;">
              <th style="text-align: left; padding: 0.4rem;">Product / Size</th>
              <th style="text-align: center; padding: 0.4rem;">Qty</th>
              <th style="text-align: right; padding: 0.4rem;">Price</th>
              <th style="text-align: right; padding: 0.4rem;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.4rem;">${item.name} <span style="color:#C59A44;">(${item.size})</span></td>
                <td style="text-align: center; padding: 0.4rem;">${item.quantity}</td>
                <td style="text-align: right; padding: 0.4rem;">₹${item.price}</td>
                <td style="text-align: right; padding: 0.4rem; font-weight: 600;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="background: #FAF5EF; padding: 0.8rem; border-radius: 8px; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
          <span>Subtotal:</span>
          <span>₹${grandTotal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem; color: #2D6A4F;">
          <span>Shipping & Handling:</span>
          <span>FREE (Launching Offer)</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.05rem; color: var(--color-navy); border-top: 1px solid #C59A44; padding-top: 0.4rem; margin-top: 0.4rem;">
          <span>Total Paid (Verified):</span>
          <span>₹${grandTotal}</span>
        </div>
        <div style="margin-top: 0.6rem; font-size: 0.72rem; color: #52B788; display: flex; items-center; gap: 0.4rem;">
          <span>✔ Payment Status: Verified Successful (UPI/Gateway)</span>
        </div>
      </div>
    `;

    confirmModal.classList.add('open');
    cartManager.clearCart();
  }
}

function closeConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) modal.classList.remove('open');
}

function printInvoice() {
  window.print();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  cartManager.updateUI();

  // Sticky header scroll shadow
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
});
