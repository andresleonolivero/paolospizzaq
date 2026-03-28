let DB = {
    menu: {
        pizzas_completa: [
            { nombre: "Pizza Grande (16 Porc.)", precio: 85000 },
            { nombre: "Pizza Mediana (12 Porc.)", precio: 62000 },
            { nombre: "Pizza Pequeña (8 Porc.)", precio: 50000 },
            { nombre: "Pizza Mini (6 Porc.)", precio: 32000 }
        ],
        crepes: [
            { nombre: "Crepe Paolos", precio: 30000 },
            { nombre: "Crepe Marinero", precio: 30000 },
            { nombre: "Crepe Clásico", precio: 27000 }
        ],
        lasañas: [
            { nombre: "Lasaña Especial", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Blanca", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Vegetariana", precio_p: 23000, precio_f: 42000 }
        ],
        bebidas: [
            { nombre: "Gaseosa 1.5L", precio: 8500 },
            { nombre: "Jugos Naturales", precio: 6000 },
            { nombre: "Cerveza", precio: 4500 },
            { nombre: "Gaseosa Personal", precio: 3500 }
        ]
    },
    sabores_pizzas: [
        { id: 1, nombre: "Peperoni Picante", precio: 7000 },
        { id: 2, nombre: "Marinera", precio: 7000 },
        { id: 3, nombre: "Mexicana", precio: 7000 },
        { id: 4, nombre: "Camarón y Pollo", precio: 7000 },
        { id: 5, nombre: "BBQ", precio: 7000 },
        { id: 6, nombre: "Carnes", precio: 7000 },
        { id: 7, nombre: "Pollo", precio: 7000 },
        { id: 8, nombre: "Maíz Tocineta", precio: 7000 },
        { id: 9, nombre: "Tropical", precio: 7000 },
        { id: 10, nombre: "De la Huerta", precio: 7000 },
        { id: 11, nombre: "Romana", precio: 7000 },
        { id: 12, nombre: "Salami", precio: 7000 },
        { id: 13, nombre: "Pollo Miel Mostaza", precio: 7000 },
        { id: 14, nombre: "Hawaiana", precio: 7000 },
        { id: 15, nombre: "Pollo Champiñones", precio: 7000 },
        { id: 16, nombre: "Napolitana", precio: 7000 },
        { id: 17, nombre: "Jamón Pollo", precio: 7000 },
        { id: 18, nombre: "Vegetariana", precio: 7000 }
    ],
    bebidas_inv: [{ id: 101, nombre: "Coca-Cola 1.5L", cantidad: 12, precio: 5500 }]
};

let Cuentas = {};

function login() {
    const user = document.getElementById('username').value.trim();
    if (user === "admin" || user === "ventas") {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.toUpperCase();
    }
}

function openModule(tipo) {
    document.getElementById('module-selector').classList.add('hidden');
    document.getElementById('work-area').classList.remove('hidden');
    const container = document.getElementById('module-content');
    const title = document.getElementById('module-title');
    
    if (tipo === 'pizzas') { title.innerText = "MÓDULO MESAS"; renderTables(container); }
    else if (tipo === 'inv-bebidas') { title.innerText = "INV. BEBIDAS"; renderInventory(container, 'bebidas_inv'); }
}

function renderTables(container) {
    let html = '<div class="tables-grid">';
    for (let i = 1; i <= 8; i++) {
        const mesaId = `Mesa ${i}`;
        const ocupada = Cuentas[mesaId] && Cuentas[mesaId].length > 0;
        html += `<button class="mesa-btn ${ocupada ? 'active-order' : ''}" onclick="selectDestino('${mesaId}')">MESA ${i}</button>`;
    }
    html += `<div class="delivery-group">
        <button class="domicilio-btn" onclick="selectDestino('Domicilio')">🛵 DOMICILIO</button>
        <button class="llevar-btn" onclick="selectDestino('Llevar')">🛍️ LLEVAR</button>
    </div></div>`;
    container.innerHTML = html;
}

function selectDestino(destino) {
    const container = document.getElementById('module-content');
    document.getElementById('module-title').innerText = destino.toUpperCase();
    document.getElementById('btn-back-tables').classList.remove('hidden');

    container.innerHTML = `
        <div class="search-box">
            <input type="text" id="product-search" placeholder="🔍 Buscar producto o sabor..." onkeyup="filterItems('${destino}')">
        </div>
        <div class="categories-grid">
            <button class="category-btn" onclick="renderProductsByCategory('porcion', '${destino}')">🍕 PORCIÓN</button>
            <button class="category-btn" onclick="renderProductsByCategory('pizzas_completa', '${destino}')">🥘 PIZZA C.</button>
            <button class="category-btn" onclick="renderProductsByCategory('crepes', '${destino}')">🥞 CREPES</button>
            <button class="category-btn" onclick="renderProductsByCategory('lasañas', '${destino}')">🍝 LASAÑAS</button>
            <button class="category-btn" onclick="renderProductsByCategory('bebidas', '${destino}')">🥤 BEBIDAS</button>
        </div>
        <div id="product-list-container"></div>
        <div id="summary-container"></div>`;
    renderOrderSummary(destino);
}

function renderProductsByCategory(cat, dest) {
    document.getElementById('product-search').value = "";
    const container = document.getElementById('product-list-container');
    
    if (cat === 'porcion') { renderFlavorSelector(container, dest); return; }

    let html = `<div class="products-grid">`;
    DB.menu[cat].forEach(p => {
        if (cat === 'pizzas_completa') {
            html += `<div class="product-card"><h4>${p.nombre}</h4><span class="price">$${p.precio.toLocaleString()}</span>
            <button class="btn-action" onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})">SELECCIONAR</button></div>`;
        } 
        else if (cat === 'lasañas') {
            html += `<div class="product-card">
                <h4>${p.nombre}</h4>
                <div style="display:grid; gap:5px;">
                    <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">Personal: $${p.precio_p.toLocaleString()}</button>
                    <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">Familiar: $${p.precio_f.toLocaleString()}</button>
                </div>
            </div>`;
        }
        else {
            html += `<div class="product-card"><h4>${p.nombre}</h4><span class="price">$${p.precio.toLocaleString()}</span>
            <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">AGREGAR</button></div>`;
        }
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderPizzaFlavorSelector(dest, pizzaNombre, precio) {
    const container = document.getElementById('product-list-container');
    let html = `<div class="flavor-selection-box">
                    <h4 class="accent">Sabores para: ${pizzaNombre}</h4>
                    <p style="font-size:0.8rem; color:#888;">Selecciona los sabores (Máx. 2):</p>
                    <div class="flavor-list">`;
    
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item-check">
                    <input type="checkbox" id="pizza-sabor-${s.id}" value="${s.nombre}" class="pizza-flavor-cb">
                    <label for="pizza-sabor-${s.id}">${s.nombre}</label>
                 </div>`;
    });

    html += `</div>
            <button class="btn-action neon-btn" onclick="confirmarPizzaCompleta('${dest}', '${pizzaNombre}', ${precio})">AGREGAR AL PEDIDO</button>
            </div>`;
    container.innerHTML = html;
}

function confirmarPizzaCompleta(dest, pizzaNombre, precio) {
    const selected = Array.from(document.querySelectorAll('.pizza-flavor-cb:checked')).map(cb => cb.value);
    
    if (selected.length === 0) { alert("Selecciona al menos un sabor."); return; }
    if (selected.length > 2) { alert("Máximo 2 sabores por pizza."); return; }

    const saborFinal = selected.join(" / ");
    addItemToOrder(dest, `${pizzaNombre} (${saborFinal})`, precio);
}

function renderFlavorSelector(container, dest) {
    let html = `<div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item">
            <div><h4>${s.nombre}</h4><span class="accent">$${s.precio.toLocaleString()}</span></div>
            <div class="flavor-qty">
                <button class="btn-nav" onclick="updateFlavorQty(${s.id}, -1)">-</button>
                <span class="qty-number" id="f-${s.id}">0</span>
                <button class="btn-nav" onclick="updateFlavorQty(${s.id}, 1)">+</button>
            </div>
        </div>`;
    });
    html += `</div><button class="btn-action" onclick="savePortions('${dest}')">CONFIRMAR PORCIONES</button>`;
    container.innerHTML = html;
}

function updateFlavorQty(id, d) {
    const el = document.getElementById(`f-${id}`);
    let val = parseInt(el.innerText) + d;
    if (val >= 0) el.innerText = val;
}

function addItemToOrder(dest, nombre, precio) {
    if (!Cuentas[dest]) Cuentas[dest] = [];
    Cuentas[dest].push({ nombre, precio });
    renderOrderSummary(dest);
}

function savePortions(dest) {
    if (!Cuentas[dest]) Cuentas[dest] = [];
    DB.sabores_pizzas.forEach(s => {
        const el = document.getElementById(`f-${s.id}`);
        if(el){
            const qty = parseInt(el.innerText);
            for(let i=0; i < qty; i++) { Cuentas[dest].push({ nombre: `Porción ${s.nombre}`, precio: s.precio }); }
            el.innerText = 0;
        }
    });
    renderOrderSummary(dest);
}

function renderOrderSummary(dest) {
    const rawItems = Cuentas[dest] || [];
    let total = 0;
    
    const groupedItems = rawItems.reduce((acc, item, index) => {
        const key = item.nombre;
        if (!acc[key]) acc[key] = { nombre: item.nombre, precio: item.precio, cantidad: 0, indices: [] };
        acc[key].cantidad += 1;
        acc[key].indices.push(index); 
        total += item.precio;
        return acc;
    }, {});

    let html = `<div class="order-summary"><div class="summary-title">Resumen: ${dest}</div><div class="summary-list">`;
    
    Object.values(groupedItems).forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const lastIndex = item.indices[item.indices.length - 1];
        
        html += `
            <div class="summary-item">
                <span><b>${item.cantidad}x</b> ${item.nombre}</span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>$${subtotal.toLocaleString()}</span>
                    <button class="btn-del-item" onclick="removeItem('${dest}', ${lastIndex})">✕</button>
                </div>
            </div>`;
    });

    if (rawItems.length === 0) html += `<div style="text-align:center; color:#555; padding:10px;">Sin productos</div>`;

    html += `</div><div class="summary-total"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
             <button class="btn-action" style="background:var(--success); color:#000; margin-top:20px;" onclick="clearOrder('${dest}')">COBRAR Y FINALIZAR</button></div>`;
    document.getElementById('summary-container').innerHTML = html;
}

function removeItem(dest, index) {
    if (Cuentas[dest]) {
        Cuentas[dest].splice(index, 1);
        renderOrderSummary(dest);
    }
}

function clearOrder(dest) {
    if (confirm(`¿Finalizar cuenta de ${dest}?`)) { Cuentas[dest] = []; selectDestino(dest); }
}

function showMenu() { document.getElementById('work-area').classList.add('hidden'); document.getElementById('module-selector').classList.remove('hidden'); }
function logout() { location.reload(); }
function filterItems(dest) {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const container = document.getElementById('product-list-container');
    const categoriesDiv = document.querySelector('.categories-grid');

    // Si el buscador está vacío, volvemos a mostrar las categorías y limpiamos la lista
    if (searchTerm === "") {
        categoriesDiv.classList.remove('hidden');
        container.innerHTML = "";
        return;
    }

    // Ocultamos categorías mientras se busca
    categoriesDiv.classList.add('hidden');

    let html = `<div class="products-grid">`;
    let found = false;

    // Buscamos en todas las categorías del menú
    for (const [catKey, items] of Object.entries(DB.menu)) {
        items.forEach(p => {
            if (p.nombre.toLowerCase().includes(searchTerm)) {
                found = true;
                // Aplicamos la misma lógica de botones que en el renderizado normal
                let action = "";
                if (catKey === 'pizzas_completa') {
                    action = `onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})"`;
                } else if (catKey === 'lasañas') {
                    // Para lasañas en buscador, mostramos botones de tamaño directamente
                    html += `
                        <div class="product-card search-result">
                            <small class="accent">${catKey.replace('_', ' ').toUpperCase()}</small>
                            <h4>${p.nombre}</h4>
                            <div style="display:grid; gap:5px;">
                                <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">P: $${p.precio_p.toLocaleString()}</button>
                                <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">F: $${p.precio_f.toLocaleString()}</button>
                            </div>
                        </div>`;
                    return; // Saltamos el cierre de div estándar para lasañas
                } else {
                    action = `onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})"`;
                }

                html += `
                    <div class="product-card search-result">
                        <small class="accent">${catKey.replace('_', ' ').toUpperCase()}</small>
                        <h4>${p.nombre}</h4>
                        <span class="price">$${(p.precio || p.precio_p).toLocaleString()}</span>
                        <button class="btn-action" ${action}>SELECCIONAR</button>
                    </div>`;
            }
        });
    }

    // También buscamos en los sabores de las porciones
    DB.sabores_pizzas.forEach(s => {
        if (s.nombre.toLowerCase().includes(searchTerm)) {
            found = true;
            html += `
                <div class="product-card search-result">
                    <small class="accent">PORCIÓN</small>
                    <h4>${s.nombre}</h4>
                    <span class="price">$${s.precio.toLocaleString()}</span>
                    <button class="btn-action" onclick="addItemToOrder('${dest}', 'Porción ${s.nombre}', ${s.precio})">AÑADIR PORCIÓN</button>
                </div>`;
        }
    });

    html += `</div>`;
    
    if (!found) {
        html = `<div style="text-align:center; padding:20px; color:#666;">No se encontraron productos o sabores.</div>`;
    }

    container.innerHTML = html;
}