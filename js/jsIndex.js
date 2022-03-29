const cards = document.getElementById('cards')
const irDetalleCarrito = document.getElementById('irDetalleCarrito')
const templateCard = document.getElementById('template-card').content
const fragment = document.createDocumentFragment()
let carrito = {}//AL CARGAR LA PÁGINA ESTE ARRAY SE TIENE QUE CARGAR CON TODOS LOS PRODUCTOS DE LA INDEXEDDB DEL CLIENTE
const activaBD = document.getElementById('irDetalleCarrito')





//DETECTA EL CLICK EN EL A QUE TE LLEVA AL DETALLE DEL CARRITO Y AHÍ SE GUARDA EL CARRITO EN LA INDEXEDDB
activaBD.addEventListener('click', () => {
    localStorage.setItem("usuario", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
})
//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
document.addEventListener('DOMContentLoaded', ()=>{
    if (localStorage.getItem("usuario")) { 
        carrito = JSON.parse(localStorage.getItem("usuario"));
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
        const res = await fetch('js/api.json')
        const data = await res.json()
        pintarCards(data)
    } catch (error) {
        console.log(error)
    }
}

//DIBUJA LOS PRODUCTOS EN LA PÁGINA
const pintarCards = (data)=>{
    data.forEach(producto =>{
        templateCard.querySelector('h5').textContent=producto.title
        templateCard.querySelector('p').textContent=producto.precio
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl)
        templateCard.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}
//AGREGA EL PRODUCTO EN EL CARRITO UNA VEZ CLICKEADO EL BOTON DEL PRODUCTO
const addCarrito = e =>{
    if(e.target.classList.contains('btn-dark')){
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}
//METE LOS DATOS DEL PRODUCTO EN EL ARRAY DE PRODUCTOS CARRITO
const setCarrito = objeto =>{
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad=carrito[producto.id].cantidad + 1
    }
    carrito[producto.id] = { ...producto }
    localStorage.setItem("usuario", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
}