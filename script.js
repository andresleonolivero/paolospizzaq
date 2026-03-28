let DB = {
    menu: {
        pizzas_completa: [{ nombre: "Pizza Grande", precio: 45000 }, { nombre: "Pizza Mediana", precio: 32000 }],
        crepes: [{ nombre: "Crepe de Pollo", precio: 18000 }, { nombre: "Crepe Ternera", precio: 19500 }],
        lasañas: [{ nombre: "Lasaña Bolonia", precio: 20000 }, { nombre: "Lasaña Pollo", precio: 22000 }],
        bebidas: [{ nombre: "Gaseosa 350ml", precio: 3500 }, { nombre: "Jugo Natural", precio: 5000 }]
    },
    sabores_pizzas: [
        { id: 1, nombre: "Hawaiana", precio: 8000 },
        { id: 2, nombre: "Pepperoni", precio: 8500 },
        { id: 3, nombre: "Pollo/Champ", precio: 8500 },
        { id: 4, nombre: "Mexicana", precio: 9000 },
        { id: 5, nombre: "Criolla", precio: 8500 }
    ],
    bebidas: [{ id: 101, nombre: "Coca-Cola 1.5L", cantidad: 12, precio: 5500 }],
    inv_huevos: [{ id: 201, nombre: "Canasta AA", cantidad: 10, precio: 16000 }]
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
    document.getElementById('btn-back-tables').classList.add('hidden');
    const container = document.getElementById('module-content');
    const title = document.getElementById('module-title');
    container.innerHTML = "";

    if (tipo === 'pizzas') { title.innerText = "MÓDULO MESAS"; renderTables(container); }
    else if (tipo === 'huevos') { title.innerText = "VENTA HUEVOS"; renderVentaHuevos(container); }
    else if (tipo === 'inv-bebidas') { title.innerText = "INVENTARIO BEBIDAS"; renderInventory(container, 'bebidas'); }
    else if (tipo === 'inv-huevos') { title.innerText = "INVENTARIO HUEVOS"; renderInventory(container, 'inv_huevos'); }
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
        <div class="categories-grid">
            <button class="category-btn" onclick="renderProductsByCategory('porcion', '${destino}')">🍕 PORCIÓN</button>
            <button class="category-btn" onclick="renderProductsByCategory('pizzas_completa', '${destino}')">🥘 PIZZA C.</button>
            <button class="category-btn" onclick="renderProductsByCategory('crepes', '${destino}')">🥞 CREPES</button>
            <button class="category-btn" onclick="renderProductsByCategory('lasañas', '${destino}')">🍝 LASAÑAS</button>
            <button class="category-btn" onclick="renderProductsByCategory('bebidas', '${destino}')">🥤 BEBIDAS</button>
        </div>
        <div id="summary-container"></div>`;
    renderOrderSummary(destino);
}

function renderProductsByCategory(cat, dest) {
    const container = document.getElementById('module-content');
    if (cat === 'porcion') { renderFlavorSelector(container, dest); return; }

    container.innerHTML = `<div style="padding:0 15px;"><button onclick="selectDestino('${dest}')" class="btn-nav" style="margin-bottom:10px;">< Volver</button><div class="products-grid"></div></div>`;
    DB.menu[cat].forEach(p => {
        container.querySelector('.products-grid').innerHTML += `
            <div class="product-card">
                <h4>${p.nombre}</h4>
                <span class="price">$${p.precio.toLocaleString()}</span>
                <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">AGREGAR</button>
            </div>`;
    });
}

function renderFlavorSelector(container, dest) {
    let html = `<div style="padding:0 15px;"><button onclick="selectDestino('${dest}')" class="btn-nav" style="margin-bottom:10px;">< Volver</button><div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
            <div><h4>${s.nombre}</h4><span class="accent">$${s.precio.toLocaleString()}</span></div>
            <div class="flavor-qty" style="display:flex; align-items:center; gap:10px;">
                <button class="btn-nav" onclick="updateFlavorQty(${s.id}, -1)">-</button>
                <span class="qty-number" id="f-${s.id}">0</span>
                <button class="btn-nav" onclick="updateFlavorQty(${s.id}, 1)">+</button>
            </div>
        </div>`;
    });
    html += `</div><button class="btn-action" onclick="savePortions('${dest}')">CONFIRMAR PORCIONES</button></div>`;
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
    selectDestino(dest);
}

function savePortions(dest) {
    if (!Cuentas[dest]) Cuentas[dest] = [];
    DB.sabores_pizzas.forEach(s => {
        const el = document.getElementById(`f-${s.id}`);
        if(el) {
            const qty = parseInt(el.innerText);
            for(let i=0; i < qty; i++) { Cuentas[dest].push({ nombre: `Porción ${s.nombre}`, precio: s.precio }); }
        }
    });
    selectDestino(dest);
}

function renderOrderSummary(dest) {
    const items = Cuentas[dest] || [];
    let total = 0;
    let html = `<div class="order-summary"><div class="summary-title">Resumen: ${dest}</div><div class="summary-list">`;
    if (items.length === 0) html += `<p style="color:#555; font-size:0.8rem;">Sin pedidos activos.</p>`;
    else {
        items.forEach(item => {
            total += item.precio;
            html += `<div class="summary-item"><span>${item.nombre}</span><span>$${item.precio.toLocaleString()}</span></div>`;
        });
    }
    html += `</div><div class="summary-total"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
             <button class="btn-action" style="background:var(--danger); color:white; margin-top:20px;" onclick="clearOrder('${dest}')">COBRAR Y FINALIZAR</button></div>`;
    document.getElementById('summary-container').innerHTML = html;
}

function clearOrder(dest) {
    if (confirm(`¿Finalizar cuenta de ${dest}?`)) { Cuentas[dest] = []; openModule('pizzas'); }
}

function renderInventory(c, cat) {
    let tot = 0;
    let h = `
    <div class="inventory-form">
        <input type="text" id="in-n" placeholder="Item">
        <input type="number" id="in-q" placeholder="Cant.">
        <input type="number" id="in-p" placeholder="Precio">
        <button class="btn-action neon-btn" onclick="saveInv('${cat}')">OK</button>
    </div>
    <table>
        <thead><tr><th>ITEM</th><th>CANT.</th><th>PRECIO</th><th>ACCIONES</th></tr></thead>
        <tbody>`;
    DB[cat].forEach(i => {
        tot += (i.cantidad * i.precio);
        h += `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>$${i.precio.toLocaleString()}</td><td>
            <button onclick="editInv('${cat}',${i.id})" class="btn-edit">✎</button>
            <button onclick="delInv('${cat}',${i.id})" class="btn-del">✕</button>
        </td></tr>`;
    });
    h += `</tbody></table><div class="inv-total">VALOR TOTAL: $${tot.toLocaleString()}</div>`;
    c.innerHTML = h;
}

function saveInv(cat) {
    const n = document.getElementById('in-n').value, q = parseInt(document.getElementById('in-q').value), p = parseInt(document.getElementById('in-p').value);
    if(n && !isNaN(q) && !isNaN(p)) { 
        DB[cat].push({id: Date.now(), nombre: n, cantidad: q, precio: p}); 
        openModule(cat==='bebidas'?'inv-bebidas':'inv-huevos'); 
    }
}

function editInv(cat, id) {
    const i = DB[cat].find(x => x.id === id);
    const n = prompt("Nuevo nombre:", i.nombre), q = prompt("Nueva cantidad:", i.cantidad), p = prompt("Nuevo precio:", i.precio);
    if(n && q && p) { i.nombre = n; i.cantidad = parseInt(q); i.precio = parseInt(p); openModule(cat==='bebidas'?'inv-bebidas':'inv-huevos'); }
}

function delInv(cat, id) {
    if(confirm("¿Eliminar item?")) { DB[cat] = DB[cat].filter(x => x.id !== id); openModule(cat==='bebidas'?'inv-bebidas':'inv-huevos'); }
}

function renderVentaHuevos(c) {
    c.innerHTML = '<div class="products-grid" id="huevos-sales-grid"></div>';
    const grid = document.getElementById('huevos-sales-grid');
    const disponibles = DB.inv_huevos;

    disponibles.forEach(i => {
        const precioVenta = i.precio + 3000; 
        grid.innerHTML += `
            <div class="product-card egg-card">
                <div class="stock-badge">${i.cantidad} DISP.</div>
                <span class="egg-icon">🥚</span>
                <h4>${i.nombre.toUpperCase()}</h4>
                <span class="price">$${precioVenta.toLocaleString()}</span>
                
                <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:10px;">
                    <button class="btn-nav" onclick="updateVentaQty(${i.id}, -1)">-</button>
                    <span id="qty-v-${i.id}" style="font-family:'Orbitron'; font-weight:bold;">1</span>
                    <button class="btn-nav" onclick="updateVentaQty(${i.id}, 1)">+</button>
                </div>

                <select id="pay-v-${i.id}" class="btn-nav" style="width:100%; margin-bottom:10px; background:#1a1a1a; border-color:var(--border); color:white; font-size:0.8rem;">
                    <option value="EFECTIVO">💵 EFECTIVO</option>
                    <option value="TRANSFERENCIA">📱 TRANSFERENCIA</option>
                </select>

                <button class="btn-action neon-btn" onclick="venderH(${i.id})">COBRAR VENTA</button>
            </div>`;
    });
}

function updateVentaQty(id, d) {
    const el = document.getElementById(`qty-v-${id}`);
    const item = DB.inv_huevos.find(x => x.id === id);
    let val = parseInt(el.innerText) + d;
    if (val >= 1 && val <= item.cantidad) el.innerText = val;
}

function venderH(id) {
    const item = DB.inv_huevos.find(x => x.id === id);
    const qty = parseInt(document.getElementById(`qty-v-${id}`).innerText);
    const met = document.getElementById(`pay-v-${id}`).value;
    const total = (item.precio + 3000) * qty;

    if (item && item.cantidad >= qty) {
        if(confirm(`¿Cobrar $${total.toLocaleString()} (${met}) por ${qty} unidad(es)?`)) {
            item.cantidad -= qty;
            alert(`Venta registrada con éxito!`);
            renderVentaHuevos(document.getElementById('module-content'));
        }
    }
}

function showMenu() { document.getElementById('work-area').classList.add('hidden'); document.getElementById('module-selector').classList.remove('hidden'); }
function logout() { location.reload(); }