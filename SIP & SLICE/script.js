/* ===================================================================
   SIP & SLICE — SITE LOGIC
   -------------------------------------------------------------------
   How this file is organized:
   1. DATA             - deal categories & menu items/prices.
                          *** Edit prices/items here, nothing else. ***
   2. CART STATE       - the in-memory shopping cart (add/remove/qty)
   3. RENDER DEALS     - tabs, deal cards, Mega Party banner, add-ons
   4. RENDER MENU      - tabbed menu (sized / simple / options rows)
   5. CHECKOUT         - delivery/pickup toggle + place order form
                          *** Zapier webhook logic — do not change. ***
   6. INIT             - runs everything once the page loads

   NOTE: "Place Order" sends the order to two Zapier webhooks (Google
   Sheets + Gmail) and shows an on-screen confirmation. See the
   ZAPIER_WEBHOOKS constant below.
=================================================================== */


/* ============ DATA: DEALS (from the Sip & Slice deals card) ============ */
const dealCategories = [
  {
    key:'pizza', label:'Pizza Deals',
    deals:[
      {id:'pd1', num:1, name:'Reg Pizza + Zinger Combo', items:['1 Regular Pizza','1 Zinger Burger','1 Regular Fries','1 Regular Drink'], price:1200},
      {id:'pd2', num:2, name:'Medium Pizza Duo Pack', items:['1 Medium Pizza','2 Zinger Burgers','6 Nuggets','1 x 1.5L Drink'], price:2100},
      {id:'pd3', num:3, name:'Family Medium Pizza Feast', items:['2 Medium Pizzas','2 Zinger Burgers','2 Regular Fries','1 x 1.5L Drink'], price:3100},
      {id:'pd4', num:4, name:'Medium Pizza + Zinger Duo', items:['1 Medium Pizza','1 Zinger Burger','1 Litre Drink'], price:1650},
      {id:'pd5', num:5, name:'Pizza & Hot Wings Combo', items:['1 Medium Pizza','5 Hot Wings','1 Regular Fries','1 Litre Drink'], price:1050},
      {id:'pd6', num:6, name:'Pizza & Wings Deal', items:['1 Regular Pizza','5 Hot Wings','1 Regular Drink'], price:1960},
      {id:'pd7', num:7, name:'Large Pizza + Pasta Combo', items:['1 Large Pizza','1 Regular Pasta','1 Litre Drink'], price:1950},
      {id:'pd8', num:8, name:'Large Pizza + Patty Combo', items:['1 Large Pizza','1 Patty Burger','1 Regular Fries','1 x 1.5L Drink'], price:1950},
    ]
  },
  {
    key:'burger', label:'Burger Deals',
    deals:[
      {id:'bd9', num:9, name:'Patty Burger Meal', items:['1 Patty Burger','1 Regular Fries','1 Regular Drink'], price:470},
      {id:'bd10', num:10, name:'Zinger Burger Meal', items:['1 Zinger Burger','1 Regular Fries','1 Regular Drink'], price:550},
      {id:'bd11', num:11, name:'Double Patty Deal', items:['2 Patty Burgers','1 Regular Fries','2 Regular Drinks'], price:700},
      {id:'bd12', num:12, name:'Zinger Squad Pack', items:['4 Zinger Burgers','1 Regular Fries','6 Nuggets','1 Litre Drink'], price:2100},
      {id:'bd13', num:13, name:'Triple Patty Deal', items:['3 Patty Burgers','1 Litre Drink'], price:999},
      {id:'bd14', num:14, name:'Zinger Burger Bundle', items:['5 Zinger Burgers','1 x 1.5L Drink'], price:1900},
      {id:'bd15', num:15, name:'Twin Zinger Deal', items:['2 Zinger Burgers','2 Regular Drinks'], price:1000},
    ]
  },
  {
    key:'shawarma', label:'Shawarma & Roll Deals',
    deals:[
      {id:'sd16', num:16, name:'Zinger Shawarma Duo', items:['2 Zinger Shawarma','2 Regular Drinks'], price:700},
      {id:'sd17', num:17, name:'Zinger & Shawarma Combo', items:['1 Zinger Burger','1 Chicken Shawarma','1 Large Fries','6 Nuggets','1 Litre Drink'], price:1200},
      {id:'sd18', num:18, name:'Shawarma & Roll Combo', items:['1 Zinger Shawarma','1 Zinger Roll Paratha','1 Regular Drink'], price:700},
      {id:'sd19', num:19, name:'Shawarma Family Pack', items:['5 Chicken Shawarma','1 Litre Drink'], price:1000},
      {id:'sd20', num:20, name:'Roll & Patty Combo', items:['2 Zinger Roll Paratha','2 Patty Burgers','1 Regular Fries','2 Regular Drinks'], price:1450},
    ]
  },
  {
    key:'combo', label:'Combo & Mix Deals',
    deals:[
      {id:'cd21', num:21, name:'Zinger Trio Pack', items:['3 Zinger Burgers','1 Medium Fries','1 x 1.5L Drink'], price:1400},
      {id:'cd22', num:22, name:'Zinger & Chicken Combo', items:['1 Zinger Burger','1 Chicken Piece','1 Regular Fries','1 Regular Drink'], price:750},
      {id:'cd23', num:23, name:'Double Zinger & Chicken', items:['2 Zinger Burgers','2 Chicken Pieces','2 Regular Fries','1 Litre Drink'], price:1400},
    ]
  },
];

const partyDeal = {
  id:'mega-party', name:'Mega Party Deal',
  items:['2 XL Pizzas','4 Zinger Burgers','2 x 1.5L Drinks','Hall charges FREE'],
  price:5500
};

const addOns = [
  {name:'Extra Cheese', price:100},
  {name:'Extra Patty', price:150},
  {name:'Extra Zinger', price:200},
  {name:'Extra Sauce', price:50},
];

/* ============ DATA: MENU (from the Sip & Slice menu card) ============ */
const menuData = {
  pizza: {
    label:'Pizza',
    type:'sized',
    sizes:['Small','Medium','Large','X-Large'],
    rows:[
      {name:'Chicken Tikka Pizza', prices:[650,1200,1500,1999]},
      {name:'Fajita Pizza', prices:[650,1200,1500,1999]},
      {name:'Vegetable Pizza', prices:[650,1200,1500,1999]},
      {name:'Cheese Lover', prices:[650,1200,1500,1999]},
    ],
    extraRows:[
      {name:'Chicken Supreme Pizza', sizes:['Medium','Large','X-Large'], prices:[1400,1800,2300]},
      {name:'Crown Pizza', sizes:['Medium','Large','X-Large'], prices:[1400,1800,2300]},
    ],
    notes:[
      {name:'Pizza Paratha', price:550},
      {name:'Sip & Slice Special (12 Inch)', price:2000},
    ]
  },
  burgers: {
    label:'Burger Zone',
    type:'simple',
    rows:[
      {name:'Petty Burger', price:290},
      {name:'Zinger Burger', price:390},
      {name:'Sip & Slice Special (Signature Burger)', price:500},
      {name:'Mighty Burger', price:600},
      {name:'Double Decker Burger', price:600, isNew:true},
    ]
  },
  shawarmaRolls: {
    label:'Shawarma & Rolls',
    type:'simple',
    rows:[
      {name:'Regular Shwarma', price:250},
      {name:'Zinger Shwarma', price:350},
      {name:'Regular Roll Paratha', price:300},
      {name:'Zinger Roll Paratha', price:350},
      {name:'Malai Kabab Roll', price:350},
      {name:'Bihari Spin Roll', price:350},
      {name:'Creamy Spin Roll', price:350},
      {name:'Crunchy Spin Roll', price:400},
    ]
  },
  wings: {
    label:'Wings & Hotshot',
    type:'options',
    rows:[
      {name:'Hot Wings', options:[{label:'6 Pcs',price:450},{label:'10 Pcs',price:800}]},
      {name:'BBQ Wings', options:[{label:'5 Pcs',price:450},{label:'10 Pcs',price:800}]},
      {name:'Oven Bake Wings', options:[{label:'6 Pcs',price:450},{label:'10 Pcs',price:800}]},
      {name:'Hotshot', options:[{label:'6 Pcs',price:350},{label:'10 Pcs',price:650}]},
    ]
  },
  pasta: {
    label:'Pasta',
    type:'simple',
    rows:[
      {name:'Flaming Pasta', price:500},
      {name:'Cheesy Pasta', price:550},
      {name:'Crunchy Pasta', price:600},
    ]
  },
  sides: {
    label:'Fries & Sides',
    type:'options',
    rows:[
      {name:'Loaded Fries', options:[{label:'Regular',price:450},{label:'Large',price:700}]},
      {name:'Fries', options:[{label:'Regular',price:250},{label:'Large',price:350}]},
      {name:'Nuggets', options:[{label:'6 Pcs',price:400},{label:'12 Pcs',price:700}]},
      {name:'Chicken Pieces', options:[{label:'1 Pc',price:200},{label:'5 Pcs',price:1000},{label:'10 Pcs',price:1900}]},
      {name:'Chicken Cheese Stick', options:[{label:'Medium',price:700},{label:'Large',price:1100}]},
    ]
  },
  drinks: {
    label:'Drinks',
    type:'options',
    rows:[
      {name:'Soft Drink', options:[{label:'Small 300ml',price:80},{label:'Large 1 Litre',price:150},{label:'1.5 Litre',price:200}]},
    ]
  }
};

/* ============ CART STATE ============ */
let cart = []; // {id, name, price, qty}

function addToCart(id, name, price){
  const existing = cart.find(i => i.id === id);
  if(existing){ existing.qty += 1; }
  else { cart.push({id, name, price, qty:1}); }
  renderCart();
  openCart();
}
function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ cart = cart.filter(i => i.id !== id); }
  renderCart();
}
function removeItem(id){
  cart = cart.filter(i => i.id !== id);
  renderCart();
}
function cartTotal(){
  return cart.reduce((sum,i) => sum + i.price*i.qty, 0);
}
function cartCount(){
  return cart.reduce((sum,i) => sum + i.qty, 0);
}

function renderCart(){
  const count = cartCount();
  document.getElementById('navCartCount').textContent = count;

  const rowsHtml = cart.map(i => `
    <div class="cart-item">
      <div><span class="ci-name">${i.name}</span></div>
      <div class="qty-control">
        <button onclick="changeQty('${i.id}',-1)">&minus;</button>
        <span>${i.qty}</span>
        <button onclick="changeQty('${i.id}',1)">+</button>
      </div>
      <div class="ci-price">Rs. ${i.price*i.qty}</div>
      <button class="ci-remove" onclick="removeItem('${i.id}')">&times;</button>
    </div>
  `).join('');

  const emptyHtml = '<div class="cart-empty">Your cart is empty. Add a deal or a menu item to get started.</div>';

  document.getElementById('drawerBody').innerHTML = cart.length ? rowsHtml : emptyHtml;
  document.getElementById('orderList').innerHTML = cart.length ? rowsHtml : emptyHtml;

  const total = cartTotal();
  document.getElementById('drawerTotal').textContent = 'Rs. ' + total;
  document.getElementById('orderTotal').textContent = 'Rs. ' + total;
  document.getElementById('drawerTotalRow').style.display = cart.length ? 'flex' : 'none';
  document.getElementById('orderTotalRow').style.display = cart.length ? 'flex' : 'none';
}

function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}

/* ============ NAV (mobile) ============ */
function toggleNav(){
  document.getElementById('navLinks').classList.toggle('open');
}

/* ============ RENDER DEALS ============ */
function renderDeals(){
  const tabsEl = document.getElementById('dealTabs');
  const panelsEl = document.getElementById('dealPanels');

  tabsEl.innerHTML = dealCategories.map((c,idx) => `
    <button class="deal-tab ${idx===0?'active':''}" data-key="${c.key}" onclick="switchDealTab('${c.key}')">${c.label}</button>
  `).join('');

  panelsEl.innerHTML = dealCategories.map((c,idx) => `
    <div class="deal-panel ${idx===0?'active':''}" data-panel="${c.key}" style="${idx===0?'':'display:none;'}">
      <div class="deal-grid">
        ${c.deals.map(d => `
          <div class="deal-card">
            <div class="deal-num">${d.num}</div>
            <h3>${d.name}</h3>
            <ul>${d.items.map(it => `<li>${it}</li>`).join('')}</ul>
            <div class="deal-foot">
              <span class="price">Rs. ${d.price}</span>
              <button class="add-btn" onclick="addToCart('${d.id}', '${d.name.replace(/'/g,"\\'")}', ${d.price})">Add to order</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Mega Party banner
  document.getElementById('partyBanner').innerHTML = `
    <div class="party-text">
      <span class="section-tag">★ Featured</span>
      <h2>${partyDeal.name}</h2>
      <ul class="party-list">${partyDeal.items.map(it => `<li>${it}</li>`).join('')}</ul>
    </div>
    <div class="party-cta">
      <span class="price">Rs. ${partyDeal.price}<small>Just for the whole party</small></span>
      <button class="btn-primary" onclick="addToCart('${partyDeal.id}', '${partyDeal.name}', ${partyDeal.price})">Add to order</button>
    </div>
  `;

  // Add-ons strip
  document.getElementById('addonsStrip').innerHTML = `
    <strong>Add-ons:</strong>
    ${addOns.map(a => `<span>${a.name} <b>+Rs.${a.price}</b></span>`).join('')}
  `;
}

function switchDealTab(key){
  document.querySelectorAll('.deal-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.deal-panel').forEach(p => {
    const active = p.dataset.panel === key;
    p.classList.toggle('active', active);
    p.style.display = active ? 'block' : 'none';
  });
}

/* ============ RENDER MENU ============ */
function renderMenu(){
  const tabsEl = document.getElementById('menuTabs');
  const panelsEl = document.getElementById('menuPanels');
  const keys = Object.keys(menuData);

  tabsEl.innerHTML = keys.map((k,idx) => `
    <button class="menu-tab ${idx===0?'active':''}" data-key="${k}" onclick="switchTab('${k}')">${menuData[k].label}</button>
  `).join('');

  panelsEl.innerHTML = keys.map((k,idx) => {
    const cat = menuData[k];
    let rowsHtml = '';

    if(cat.type === 'sized'){
      const sizedRow = (r, sizes) => `
        <div class="menu-row">
          <div class="name">${r.name}</div>
          <div class="sizes">
            ${sizes.map((sz,si) => `
              <div class="size-pill" onclick="addToCart('${(k+'-'+r.name+'-'+sz).replace(/ /g,'_')}', '${r.name} (${sz})', ${r.prices[si]})">
                <span class="sz">${sz}</span><span class="pr">Rs.${r.prices[si]}</span>
              </div>
            `).join('')}
          </div>
          <div></div>
        </div>`;
      rowsHtml += cat.rows.map(r => sizedRow(r, cat.sizes)).join('');
      if(cat.extraRows){
        rowsHtml += cat.extraRows.map(r => sizedRow(r, r.sizes)).join('');
      }
    } else if(cat.type === 'options'){
      rowsHtml = cat.rows.map(r => `
        <div class="menu-row">
          <div class="name">${r.name}</div>
          <div class="sizes">
            ${r.options.map(o => `
              <div class="size-pill" onclick="addToCart('${(k+'-'+r.name+'-'+o.label).replace(/ /g,'_')}', '${r.name} (${o.label})', ${o.price})">
                <span class="sz">${o.label}</span><span class="pr">Rs.${o.price}</span>
              </div>
            `).join('')}
          </div>
          <div></div>
        </div>
      `).join('');
    } else {
      rowsHtml = cat.rows.map(r => `
        <div class="menu-row">
          <div class="name">${r.name}${r.isNew ? '<span class="new-tag">NEW</span>' : ''}</div>
          <div></div>
          <div class="simple-add">
            <span class="price">Rs. ${r.price}</span>
            <button class="add-btn" onclick="addToCart('${(k+'-'+r.name).replace(/ /g,'_')}', '${r.name}', ${r.price})">Add</button>
          </div>
        </div>
      `).join('');
    }

    if(cat.notes){
      rowsHtml += cat.notes.map(n => `
        <div class="menu-row">
          <div class="name" style="font-size:0.98rem;">${n.name}</div>
          <div></div>
          <div class="simple-add">
            <span class="price">Rs. ${n.price}</span>
            <button class="add-btn" onclick="addToCart('note-${(k+'-'+n.name).replace(/ /g,'_')}', '${n.name}', ${n.price})">Add</button>
          </div>
        </div>
      `).join('');
    }

    return `<div class="menu-panel ${idx===0?'active':''}" data-panel="${k}">${rowsHtml}</div>`;
  }).join('');
}

function switchTab(key){
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === key));
}

/* ============ CHECKOUT ============ */

// Two separate Zapier "Catch Hook" webhooks (free-plan friendly: each Zap
// below is just one trigger + one action, so no paid multi-step Zap needed).
// Every order gets POSTed to BOTH of these at once.
const ZAPIER_WEBHOOKS = [
  'https://hooks.zapier.com/hooks/catch/28752240/4hp21s4/', // Zap 1: logs the order into Google Sheets
  'https://hooks.zapier.com/hooks/catch/28752240/4hp3j6o/'  // Zap 2: emails you a Gmail notification
];

let deliveryMode = 'delivery';
function setMode(mode, el){
  deliveryMode = mode;
  document.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  // Only show the address box for delivery orders — pickup doesn't need one.
  document.getElementById('addressField').style.display = mode === 'delivery' ? 'block' : 'none';
  // Re-check the address field's error state now that it may no longer be required.
  clearFieldError('custAddress','addressError');
}

/* ---- Field validation helpers ---- */
// Pakistani mobile numbers: 11 digits, starting with 0 (e.g. 03001234567).
const PHONE_REGEX = /^03[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showFieldError(inputId, errorId, message){
  document.getElementById(inputId).classList.add('invalid');
  const errEl = document.getElementById(errorId);
  errEl.textContent = message;
  errEl.classList.add('show');
}
function clearFieldError(inputId, errorId){
  document.getElementById(inputId).classList.remove('invalid');
  const errEl = document.getElementById(errorId);
  errEl.textContent = '';
  errEl.classList.remove('show');
}

// Only allow digits in the phone field as the person types, capped at 11.
function filterPhoneInput(el){
  el.value = el.value.replace(/\D/g, '').slice(0, 11);
}

function validateForm(){
  let firstInvalid = null;
  let isValid = true;

  const name = document.getElementById('custName').value.trim();
  if(name.length < 2){
    showFieldError('custName','nameError','Please enter your full name.');
    isValid = false; firstInvalid = firstInvalid || 'custName';
  } else {
    clearFieldError('custName','nameError');
  }

  const phone = document.getElementById('custPhone').value.trim();
  if(!PHONE_REGEX.test(phone)){
    showFieldError('custPhone','phoneError','Enter an 11-digit number starting with 03 (e.g. 03001234567).');
    isValid = false; firstInvalid = firstInvalid || 'custPhone';
  } else {
    clearFieldError('custPhone','phoneError');
  }

  const email = document.getElementById('custEmail').value.trim();
  if(email.length > 0 && !EMAIL_REGEX.test(email)){
    showFieldError('custEmail','emailError','Enter a valid email address (e.g. you@example.com).');
    isValid = false; firstInvalid = firstInvalid || 'custEmail';
  } else {
    clearFieldError('custEmail','emailError');
  }

  const address = document.getElementById('custAddress').value.trim();
  if(deliveryMode === 'delivery' && address.length < 5){
    showFieldError('custAddress','addressError','Enter a delivery address so the rider can find you.');
    isValid = false; firstInvalid = firstInvalid || 'custAddress';
  } else {
    clearFieldError('custAddress','addressError');
  }

  if(firstInvalid){
    document.getElementById(firstInvalid).focus();
  }
  return isValid;
}

function placeOrder(e){
  e.preventDefault();
  if(cart.length === 0){
    alert('Your cart is empty — add a deal or a menu item before placing an order.');
    return false;
  }
  if(!validateForm()){
    return false;
  }

  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNote').value.trim();
  const total = cartTotal();

  // Turn the cart array into a plain readable string, e.g.
  // "Zinger Burger x2 (Rs. 780), Regular Fries x1 (Rs. 200)"
  const itemsSummary = cart
    .map(i => `${i.name} x${i.qty} (Rs. ${i.price * i.qty})`)
    .join(', ');

  // This is the JSON payload Zapier's webhook will receive.
  // The "delivery_mode" field is what the Zapier "Paths" step branches on.
  const orderPayload = {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    delivery_mode: deliveryMode,                       // "delivery" or "pickup"
    delivery_address: deliveryMode === 'delivery' ? address : '',
    order_notes: notes,
    order_items: itemsSummary,
    order_total: total,
    order_date: new Date().toISOString()
  };

  // Send the order to EVERY webhook in the list above (Sheets + Gmail).
  // mode:'no-cors' is required because Zapier's webhook doesn't send back
  // CORS headers — the browser would otherwise block reading the response.
  // We don't need to read a response anyway; we just need each POST to go
  // through, which it will.
  ZAPIER_WEBHOOKS.forEach(url => {
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).catch(err => {
      // Even if this fails (e.g. no internet), we still confirm on-screen
      // below so the customer isn't stuck — but log it for debugging.
      console.error('Order webhook failed to send to ' + url + ':', err);
    });
  });

  // Show an on-screen confirmation immediately (doesn't wait for Zapier).
  const confirmBox = document.getElementById('orderConfirm');
  confirmBox.style.display = 'block';
  confirmBox.innerHTML = `Thanks, ${name}! Your order of Rs. ${total} has been received for ${deliveryMode}. We'll call you shortly to confirm.`;

  document.getElementById('checkoutForm').reset();
  cart = [];
  renderCart();
  setMode('delivery', document.querySelector('.toggle-opt[data-mode="delivery"]'));
  return false;
}

/* ============ INIT ============ */
renderDeals();
renderMenu();
renderCart();

// Phone field: strip anything that isn't a digit as the person types.
const phoneInput = document.getElementById('custPhone');
phoneInput.addEventListener('input', () => filterPhoneInput(phoneInput));

// Clear a field's red error state as soon as the person starts fixing it.
document.getElementById('custName').addEventListener('input', () => clearFieldError('custName','nameError'));
phoneInput.addEventListener('input', () => clearFieldError('custPhone','phoneError'));
document.getElementById('custEmail').addEventListener('input', () => clearFieldError('custEmail','emailError'));
document.getElementById('custAddress').addEventListener('input', () => clearFieldError('custAddress','addressError'));
