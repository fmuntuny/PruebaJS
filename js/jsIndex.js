const cards = document.getElementById('cards')
const admin = document.getElementById('adminSitio')
const templateCard = document.getElementById('template-card').content
const templateAdmin = document.getElementById('template-admin').content
const fragment = document.createDocumentFragment()
const totalCompraNav = document.getElementById('totalCompraNav').textContent
const btnTotalCompraNav = document.getElementById('totalCompraNav')
const buscador = document.getElementById('buscador')
const btnBuscador = document.getElementById('btnBuscador')
let totalCompra = ""
let carrito = {}//AL CARGAR LA PÁGINA ESTE ARRAY SE TIENE QUE CARGAR CON TODOS LOS PRODUCTOS DE LA INDEXEDDB DEL CLIENTE
let user = {}
let productos
let resProductos = {}
let idCarrito
let isFinish
let idUsuario = 2//CUANDO MICA TENGA EL LOGUEO TENGO QUE CAMBIAR ESTO




//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
//EL "USUARIO" DEL LOCALSTORAGE DEBERÍA SER EL ID DEL USER PARA PODER TENER DIFERENTES CARRITOS DE USERS ALMACENADO
document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem("usuario")) {
        user = JSON.parse(localStorage.getItem("usuario"));
        if (JSON.parse(localStorage.getItem('usuario')).id === 2) {
            admin.innerHTML = ''
            const clone = templateAdmin.cloneNode(true)
            fragment.appendChild(clone)
            admin.appendChild(fragment)
        }
    }
    if (localStorage.getItem("carrito")) {
        carrito = JSON.parse(localStorage.getItem("carrito"))
    }
    if (localStorage.getItem("totalCompra")) {
        totalCompra = localStorage.getItem("totalCompra")
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
    } else {
        localStorage.setItem("totalCompra", 0)
        totalCompra = 0
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
    }
    let idCarrito
    let isFinish
    $.ajax({//OBTENEMOS EL ID DEL CARRITO DEL USUARIO
        url: 'http://localhost:8080/api/carts/',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            res.forEach(cart => {
                if (cart.userId.id === 2) {
                    localStorage.setItem("idCarrito", cart.id)
                    localStorage.setItem("carritoIsFinished", cart.deleted)
                }
            })

        }
    })

    //CARGAMOS LAS CATEGORIAS DENTRO DEL NAV
    let dataSelect = ''
    $.ajax({
        url: 'http://localhost:8080/api/categories',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            res.forEach(element => {
                dataSelect += `
                        <li><a class="dropdown-item" href="#">${element.name}</a></li>
                        <li><hr class="dropdown-divider"></li>
                    `
            });
            $('#dropCategoria').html(dataSelect);
        }
    })

    //CARGAMOS LOS PRODUCTOS EN LA VARIABLE PRODUCTOS
    $.ajax({
        url: 'http://localhost:8080/api/products',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            productos = res
        }
    })

    fetchdata()
})

const filtrar = () => {
    let ind = 0
    const texto = buscador.value.toLowerCase()
    console.log(productos)
    for (let producto of productos) {
        let nombre = producto.name.toLowerCase()
        if (nombre.indexOf(texto) !== -1) {
            resProductos[ind] = { ...producto }
            ind++
        }
    }
    document.getElementById('cards').innerHTML = ''
    pintarCards(Object.values(resProductos))


}
btnBuscador.addEventListener('click', filtrar)

//DETECTA EL CLIC EN EL BOTON DE LOS PRODUCTOS PARA AGREGARLOS AL CARRITO
cards.addEventListener('click', e => {
    if (localStorage.getItem("carritoIsFinished") === "true") {
        localStorage.setItem("carritoIsFinished", false)
        const cart = {
            userId: { "id": idUsuario },
        }
        $.ajax({
            url: "http://localhost:8080/api/carts",
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(cart),
            dataType: 'json',
        })
    }
    addCarrito(e)
})
const fetchdata = async () => {
    //CARGO LOS PRODUCTOS EN LA PÁGINA DE PRODUCTOS DESDE LA API
    try {
        const resPro = await fetch('http://localhost:8080/api/products')
        const dataPro = await resPro.json()
        pintarCards(dataPro)

        //ESTOS DATOS DE USUARIO SON TEMPORALES HASTA QUE CONECTEMOS CON BACKEND
        const resUser = await fetch('http://localhost:8080/api/users/')
        const dataUser = await resUser.json()
        dataUser.forEach(u => {
            if (u.id === 2) {//*********************SERÍA IF(IDQUEVIENEDELLOGIN === U.ID)**********************************
                user = {
                    "id": u.id,
                    "name": u.name,
                    "surname": u.surname,
                    "address": u.address,
                    "cellPhone": u.cellPhone,
                    "email": u.email,
                    "password": u.password,
                    "roleId": { "id": 1 }
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
        templateCard.getElementById('titulo').textContent = producto.name
        templateCard.getElementById('descripcion').textContent = producto.description
        templateCard.getElementById('precio').textContent = "Precio: $ " + producto.price.toFixed(2)
        templateCard.getElementById('calificacion').textContent = "Calificacion: " + producto.promRate.toFixed(2)
        //templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl)
        //FALTA LA FOTO
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
        precio: objeto.querySelector('#precio').textContent.substring(10, largoPrecio),
        desccripcion: objeto.querySelector('#descripcion').textContent,
        calificacion: objeto.querySelector('#calificacion').textContent,
        cantidad: Number(objeto.querySelector('#cantidad').textContent.substring(10, largoCantidad))
    }
    //EN EL CASO DE QUE EN EL CARRITO YA HAYA UN PRODUCTO IGUAL AL QUE ESTAMOS AGREGANDO, LO SUMA
    if (carrito.hasOwnProperty(producto.id)) {
        if ((producto.cantidad + cant) > 0) {//SI AUMENTA LA CANTIDAD
            producto.cantidad = carrito[producto.id].cantidad + cant
            carrito[producto.id] = { ...producto }
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
            objeto.querySelector('#cantidad').textContent = "Cantidad: " + producto.cantidad
            if (cant === 1) {
                totalCompra = Number(totalCompra) + Number(producto.precio)
            } else if (cant === -1) {
                totalCompra = Number(totalCompra) - Number(producto.precio)
            }
        } else if ((producto.cantidad + cant) < 1) {//SI LA CANTIDAD ES MENOR A 1, OSEA QUE ESTÁ DISMINUYENDO
            objeto.querySelector('#cantidad').textContent = "Cantidad: 0"
            delete carrito[producto.id]
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
            if (cant === 1) {
                totalCompra = Number(totalCompra) + Number(producto.precio)
            } else if (cant === -1) {
                totalCompra = Number(totalCompra) - Number(producto.precio)
            }
        }
    } else {//SI NO HAY UN PRODUCTO IGUAL, SOLO LO AGREGA SI EL BOTON ESTA AUMENTANDO
        if (cant === 1) {
            producto.cantidad++
            carrito[producto.id] = { ...producto }
            localStorage.setItem("carrito", JSON.stringify(carrito));//USUARIO DEBERÍA USAR EL ID DEL USUARIO
            objeto.querySelector('#cantidad').textContent = "Cantidad: " + producto.cantidad
            totalCompra = Number(totalCompra) + Number(producto.precio)
        }
    }
    localStorage.setItem("totalCompra", totalCompra);//USUARIO DEBERÍA USAR EL ID DEL USUARIO
    document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
}