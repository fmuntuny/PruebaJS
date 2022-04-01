const cards = document.getElementById('cards')
const irDetalleCarrito = document.getElementById('irDetalleCarrito')
const templateCard = document.getElementById('template-card').content
const fragment = document.createDocumentFragment()
let carrito = {}//AL CARGAR LA PÁGINA ESTE ARRAY SE TIENE QUE CARGAR CON TODOS LOS PRODUCTOS DE LA INDEXEDDB DEL CLIENTE
let user = {}
const activaBD = document.getElementById('irDetalleCarrito')


/*DETECTA EL CLICK EN EL A QUE TE LLEVA AL DETALLE DEL CARRITO Y AHÍ SE GUARDA EL CARRITO EN LA INDEXEDDB
activaBD.addEventListener('click', () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
}) */

//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
//EL "USUARIO" DEL LOCALSTORAGE DEBERÍA SER EL ID DEL USER PARA PODER TENER DIFERENTES CARRITOS DE USERS ALMACENADO
document.addEventListener('DOMContentLoaded', ()=>{
    if (localStorage.getItem("carrito")) { 
        carrito = JSON.parse(localStorage.getItem("carrito"));
    }
    if (localStorage.getItem("usuario")) { 
        user = JSON.parse(localStorage.getItem("usuario"));
    }
    fetchdata()
})
//DETECTA EL CLIC EN EL BOTON DE LOS PRODUCTOS PARA AGREGARLOS AL CARRITO
cards.addEventListener('click', e =>{
    addCarrito(e)
})
const fetchdata = async () => {
    //CARGO LOS PRODUCTOS EN LA PÁGINA DE PRODUCTOS DESDE LA API
    try {
        const resPro = await fetch('js/apiProductos.json')
        const dataPro = await resPro.json()
        pintarCards(dataPro)
        const resUser = await fetch('js/apiUser.json')
        const dataUser = await resUser.json()
        dataUser.forEach(u => { 
            if (u.id===1) {//*********************SERÍA IF(IDQUEVIENEDELLOGIN === U.ID)**********************************
                user = {
                    id: u.id,
                    nombre: u.nombre,
                    apellido: u.apellido,
                    direccion: u.direccion,
                    telefono: u.telefono,
                    mail: u.mail,
                    fechaAlta: u.fechaAlta
                }
            }
            localStorage.setItem("usuario", JSON.stringify(user));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
        })
    } catch (error) {
        console.log(error)
    }
}

//DIBUJA LOS PRODUCTOS EN LA PÁGINA
const pintarCards = (data) => {
    data.forEach(producto => {
        templateCard.getElementById('titulo').textContent = producto.title
        templateCard.getElementById('descripcion').textContent = producto.descripcion
        templateCard.getElementById('precio').textContent = "Precio: $ " + producto.precio
        templateCard.getElementById('calificacion').textContent = "Calificacion: " + producto.calificacion      
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl)
        templateCard.querySelector('.btn-info').dataset.id = producto.id
        templateCard.querySelector('.btn-danger').dataset.id = producto.id
        if (Object.values(carrito).length > 0) {
            Object.values(carrito).some(prodCarrito => {
                if (Number(prodCarrito.id) === producto.id) {
                    templateCard.getElementById('cantidad').textContent = "Cantidad: " + prodCarrito.cantidad
                    return true
                } else {
                    templateCard.getElementById('cantidad').textContent = "Cantidad: 0"
                }
            })
        } else { 
            templateCard.getElementById('cantidad').textContent = "Cantidad: 0"
        }
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}
//AGREGA EL PRODUCTO EN EL CARRITO UNA VEZ CLICKEADO EL BOTON DEL PRODUCTO
const addCarrito = (e) => {
    //if(e.target.classList.contains('btn-dark')){
    //    setCarrito(e.target.parentElement)
    //}
    if (e.target.classList.contains('btn-info')) {
        setCarrito(e.target.parentElement, 1)
    } else if (e.target.classList.contains('btn-danger')) { 
        setCarrito(e.target.parentElement, -1)
    }
    e.stopPropagation()
}
//METE LOS DATOS DEL PRODUCTO EN EL ARRAY DE PRODUCTOS CARRITO
const setCarrito = (objeto, cant) => {
    const largoPrecio = objeto.querySelector('#precio').textContent.length
    const largoCantidad = objeto.querySelector('#cantidad').textContent.length
    const producto = {
        id: objeto.querySelector('.btn-info').dataset.id,
        title: objeto.querySelector('#titulo').textContent,
        precio: objeto.querySelector('#precio').textContent.substring(10,largoPrecio),
        desccripcion: objeto.querySelector('#descripcion').textContent,
        calificacion: objeto.querySelector('#calificacion').textContent,
        cantidad: Number(objeto.querySelector('#cantidad').textContent.substring(10, largoCantidad))
    }
    if (carrito.hasOwnProperty(producto.id)) {
        if ((producto.cantidad + cant) > 0) {
            producto.cantidad = carrito[producto.id].cantidad + cant
            carrito[producto.id] = { ...producto }
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
            objeto.querySelector('#cantidad').textContent= "Cantidad: " + producto.cantidad
        } else if ((producto.cantidad + cant) < 1) {
            objeto.querySelector('#cantidad').textContent = "Cantidad: 0"
            delete carrito[producto.id]
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
        }  
    } else {
        if (cant === 1) {
            producto.cantidad++
            carrito[producto.id] = { ...producto }
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
            objeto.querySelector('#cantidad').textContent= "Cantidad: " + producto.cantidad
        }
    } 
}