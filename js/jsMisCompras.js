const cards = document.getElementById('cards')
const templateCard = document.getElementById('template-card').content
const admin = document.getElementById('adminSitio')
const templateAdmin = document.getElementById('template-admin').content
const fragment = document.createDocumentFragment()
const totalCompraNav = document.getElementById('totalCompraNav').textContent
const btnTotalCompraNav = document.getElementById('totalCompraNav')
let calif = 0
let totalCompra = ""
let carrito = {}//AL CARGAR LA PÁGINA ESTE ARRAY SE TIENE QUE CARGAR CON TODOS LOS PRODUCTOS DE LA INDEXEDDB DEL CLIENTE
let user = {}
let idCarrito
let isFinish
let idUsuario = 2//CUANDO MICA TENGA EL LOGUEO TENGO QUE CAMBIAR ESTO
let ultimasCompras = {}
let calProdComprados = {}

document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem("usuario")) {
        user = JSON.parse(localStorage.getItem("usuario"));
        if (JSON.parse(localStorage.getItem('usuario')).id === 1) {
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
                if (cart.userId.id === 1) {
                    localStorage.setItem("idCarrito", cart.id)
                    localStorage.setItem("carritoIsFinished", cart.deleted)
                }
            })

        }
    })
    fetchdata()

})

const fetchdata = async () => {
    //CARGO LOS PRODUCTOS EN LA PÁGINA DE PRODUCTOS DESDE LA API
    try {
        const resPro = await fetch('http://localhost:8080/api/cartItems/')
        const dataPro = await resPro.json()
        const resCal = await fetch('http://localhost:8080/api/ratings')
        const dataCal = await resCal.json()
        let count = 0
        dataCal.forEach(cal => {
            //RECOLECTAR TODOS LOS PRODUCTOS CALIFICADOS POR ESTE USER Y QUÉ CALIFICACION LE DIO. CON ESOS DATOS CARGAS LAS ESTRELLAS EN EL
            //PRODUCTO Y BLOQUEAR EL BOTON CALIFICAR

            //necesito iduser, idproducto, calificacion
            u = JSON.parse(localStorage.getItem('usuario')).id
            if (cal.userId.id === u) {
                let valCal = {
                    "rating": cal.value,
                    "productId": cal.productId.id,
                }
                calProdComprados[count] = { ...valCal }
                count++
            }
        })
        idUsr = JSON.parse(localStorage.getItem('usuario')).id
        ultimasCompras = {}
        let i = 0
        dataPro.forEach(prod => {
            let prodID = prod.cartId.userId.id
            if (prodID === idUsr) {
                ultimasCompras[i] = { ...prod }
                i++
            }
        })
        pintarCards(ultimasCompras)
    } catch (error) {
        console.log(error)
    }
}

//DETECTA EL CLICK EN LOS BOTONES DE SUMAR O RESTAR CANTIDADES


//DIBUJA LOS PRODUCTOS EN LA PÁGINA
const pintarCards = (data) => {
    Object.values(data).forEach(producto => {



        templateCard.getElementById('titulo').textContent = producto.productId.name
        templateCard.getElementById('descripcion').textContent = producto.productId.description
        templateCard.getElementById('precio').textContent = "Precio: $ " + producto.productId.price.toFixed(2)
        templateCard.getElementById('calificacion').textContent = "Calificacion: " + producto.productId.promRate.toFixed(2)
        templateCard.getElementById('cantidad').textContent = "Cantidad: " + producto.quantity
        templateCard.querySelector('.btn-primary').dataset.id = producto.productId.id
        $("#1").attr("id", "1-" + producto.productId.id);
        $("#2").attr("id", "2-" + producto.productId.id);
        $("#3").attr("id", "3-" + producto.productId.id);
        $("#4").attr("id", "4-" + producto.productId.id);
        $("#5").attr("id", "5-" + producto.productId.id);
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
        cards.appendChild(fragment)

    })
}

cards.addEventListener('click', e => {
    btnAccion(e)
})

const btnAccion = e => {


    if (e.target.classList.contains('1')) {
        calif = 1

    } else if (e.target.classList.contains('2')) {
        calif = 2
    } else if (e.target.classList.contains('3')) {
        calif = 3
    } else if (e.target.classList.contains('4')) {
        calif = 4
    } else if (e.target.classList.contains('5')) {
        calif = 5
    }
    if (e.target.classList.contains('btn-primary')) {
        const prodID = Number(e.target.dataset.id)
        const userID = Number(JSON.parse(localStorage.getItem('usuario')).id)
        const rating = {
            "value": calif,
            "comment": "",
            "productId": { "id": prodID },
            "userId": { "id": userID }
        }
        $.ajax({
            url: "http://localhost:8080/api/ratings/",
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(rating),
            dataType: 'json',
        })
        swal("Bien hecho!", "Tu calificación nos ayuda a orientar a otros clientes al decidir su compra.", "success");

    }
    e.stopPropagation()
}
