const items = document.getElementById('items')
const footer = document.getElementById('footer')
const envios = document.getElementById('footer-envio')
const templateCarrito = document.getElementById('template-carrito').content
const templateFooter = document.getElementById('template-footer').content
const templateEnvio = document.getElementById('template-envio').content
const templateOpcionEnvio = document.getElementById('template-opcion-envio')
const fragment = document.createDocumentFragment()
const rbEnvioLocal = document.getElementById('tipoEnvioLocal')
const rbEnvioDomicilio = document.getElementById('tipoEnvioDomicilio')
let envio = false
let totalCompra = ""
let carrito = {}
let user = {}

//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("carrito")) {
        carrito = JSON.parse(localStorage.getItem("carrito"));
    }
    if (localStorage.getItem("usuario")) {
        user = JSON.parse(localStorage.getItem("usuario"));
    }
    if (localStorage.getItem("totalCompra")) {
        totalCompra = localStorage.getItem("totalCompra")
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
    } else {
        localStorage.setItem("totalCompra", 0)
        totalCompra = 0
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
    }
    if (!localStorage.getItem("envio")) {
        localStorage.setItem("envio", "no")
    }
    pintarCarrito()
})

//DETECTA EL CLICK EN LOS BOTONES DE SUMAR O RESTAR CANTIDADES
items.addEventListener('click', e => {
    btnAccion(e)
})

//DETECTA EL CLICK EN LOS RADIOBUTTON
document.getElementById('tipoEnvioLocal').addEventListener('click', () => {
    localStorage.setItem("envio", "no")
    totalCompra = Number(totalCompra) - 600//SI SACA EL ENVIO, RESTAMOS EL ENVIO AL CARRITO DEL NAV
    localStorage.setItem("totalCompra", totalCompra)
    pintarCarrito()
})
document.getElementById('tipoEnvioDomicilio').addEventListener('click', () => {
    localStorage.setItem("envio", "si")
    totalCompra = Number(totalCompra) + 600//SI AGREGA EL ENVIO, SUMAMOS EL ENVIO AL CARRITO DEL NAV
    localStorage.setItem("totalCompra", totalCompra)
    pintarCarrito()
})




const pintarCarrito = () => {
    items.innerHTML = ''
    Object.values(carrito).forEach(prod => {
        templateCarrito.querySelector('th').textContent = prod.id
        templateCarrito.querySelectorAll('td')[0].textContent = prod.title
        templateCarrito.querySelectorAll('td')[1].textContent = prod.precio
        templateCarrito.querySelectorAll('td')[2].textContent = prod.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = prod.id
        templateCarrito.querySelector('.btn-danger').dataset.id = prod.id
        templateCarrito.querySelector('span').textContent = prod.cantidad * prod.precio
        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    pintarFooter()
    localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
    document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
}

const pintarFooter = () => {
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`
        envios.innerHTML = ''
        return
    }
    footer.innerHTML = ''
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)
    templateFooter.querySelectorAll('td')[1].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)
    const btnVaciarCarrito = document.querySelector('#vaciar-carrito')
    btnVaciarCarrito.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
        rbEnvioLocal.checked = true
        localStorage.setItem("envio", "no")
        totalCompra = 0
        localStorage.setItem("totalCompra", totalCompra)
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
    })
    pintarEnvio()
}
const btnAccion = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        totalCompra = Number(totalCompra) + Number(producto.precio)
        localStorage.setItem("totalCompra", totalCompra)
        pintarCarrito()
    }
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        totalCompra = Number(totalCompra) - Number(producto.precio)
        localStorage.setItem("totalCompra", totalCompra)
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }

        pintarCarrito()
    }
    e.stopPropagation()
}

//PINTA LA TABLA DEL ENVIO
const pintarEnvio = () => {
    envio = localStorage.getItem("envio")
    if (envio === "si") {
        rbEnvioLocal.checked = false
        rbEnvioDomicilio.checked = true
        envios.innerHTML = ''
        templateEnvio.getElementById('nombre').textContent = user.nombre
        templateEnvio.getElementById('apellido').textContent = user.apellido
        templateEnvio.getElementById('direccion').textContent = user.direccion
        templateEnvio.getElementById('telefono').textContent = user.telefono
        templateEnvio.getElementById('costo').textContent = 600
        templateEnvio.getElementById('total-costo').textContent = Number(document.getElementById('total-compra').textContent) + 600
        const clone = templateEnvio.cloneNode(true)
        fragment.appendChild(clone)
        envios.appendChild(fragment)
    } else {
        rbEnvioLocal.checked = true
        rbEnvioDomicilio.checked = false
        envios.innerHTML = ''
        envios.appendChild(fragment)
    }

}
