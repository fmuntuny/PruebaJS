const items = document.getElementById('items')
const footer = document.getElementById('footer')
const envios = document.getElementById('footer-envio')
const templateCarrito = document.getElementById('template-carrito').content
const templateFooter = document.getElementById('template-footer').content
const templateEnvio = document.getElementById('template-envio').content
const fragment = document.createDocumentFragment()
let carrito = {}
let user = {}

//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
document.addEventListener('DOMContentLoaded', ()=>{
    if (localStorage.getItem("carrito")) { 
        carrito = JSON.parse(localStorage.getItem("carrito"));
    }
    if (localStorage.getItem("usuario")) { 
        user = JSON.parse(localStorage.getItem("usuario"));
    }
    pintarCarrito()
})

//DETECTA EL CLICK EN LOS BOTONES DE SUMAR O RESTAR CANTIDADES
items.addEventListener('click', e => { 
    btnAccion(e)
})


const pintarCarrito = () => {
items.innerHTML=''
Object.values(carrito).forEach(prod =>{
    templateCarrito.querySelector('th').textContent = prod.id
    templateCarrito.querySelectorAll('td')[0].textContent = prod.title
    templateCarrito.querySelectorAll('td')[1].textContent=prod.precio
    templateCarrito.querySelectorAll('td')[2].textContent=prod.cantidad
    templateCarrito.querySelector('.btn-info').dataset.id=prod.id
    templateCarrito.querySelector('.btn-danger').dataset.id=prod.id
    templateCarrito.querySelector('span').textContent=prod.cantidad*prod.precio
    const clone = templateCarrito.cloneNode(true)
    fragment.appendChild(clone)
})
items.appendChild(fragment)
    pintarFooter()
localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
}

const pintarFooter = () => {
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`
        envios.innerHTML=''
        return
    } 
    footer.innerHTML=''
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
        })
        pintarEnvio()
}
const btnAccion = e => { 
    if (e.target.classList.contains('btn-info')) { 
        const producto = carrito[e.target.dataset.id]
        producto.cantidad ++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }
    if (e.target.classList.contains('btn-danger')) { 
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) { 
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }
    e.stopPropagation()
}

//FALTA HACER EL PINTAENVIO!!!!!!!!!!!!!!!!!!!!!!!!!!!!1*********************************************
const pintarEnvio = () => { 
    envios.innerHTML=''
    templateEnvio.getElementById('nombre').textContent = user.nombre
    templateEnvio.getElementById('apellido').textContent = user.apellido
    templateEnvio.getElementById('direccion').textContent = user.direccion
    templateEnvio.getElementById('telefono').textContent = user.telefono
    templateEnvio.getElementById('costo').textContent = 600
    templateEnvio.getElementById('total-costo').textContent = Number(document.getElementById('total-compra').textContent) + 600
    const clone = templateEnvio.cloneNode(true)
    fragment.appendChild(clone)
    envios.appendChild(fragment)
}
