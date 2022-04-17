const items = document.getElementById('items')
const footer = document.getElementById('footer')
const envios = document.getElementById('footer-envio')
const pago = document.getElementById('footer-medio-pago')
const admin = document.getElementById('adminSitio')
const templateAdmin = document.getElementById('template-admin').content
const templateCarrito = document.getElementById('template-carrito').content
const templateFooter = document.getElementById('template-footer').content
const templateEnvio = document.getElementById('template-envio').content
const templateMedioPago = document.getElementById('template-medio-pago').content
const fragment = document.createDocumentFragment()
const rbEnvioLocal = document.getElementById('tipoEnvioLocal')
const rbEnvioDomicilio = document.getElementById('tipoEnvioDomicilio')
const rbTarjetaDebito = document.getElementById('tipoPagoDebito')
const rbTarjetaCredito = document.getElementById('tipoPagoCredito')
const rbEfectivo = document.getElementById('tipoPagoEfectivo')
let envio = false
let totalCompra = ""
let cantItems = 0;
let carrito = {}
let user = {}
let idUsuario = 2//CUANDO MICA TENGA EL LOGUEO TENGO QUE CAMBIAR ESTO
let idCarrito

//DETECTA QUE EL DOM ESTA CARGADO PARA PODER CARGAR LOS PRODUCTOS
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
        carrito = JSON.parse(localStorage.getItem("carrito"));
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
    if (!localStorage.getItem("medioPago")) {
        localStorage.setItem("medioPago", "efectivo")
    }
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
    pintarCarrito()
})

//DETECTA EL CLICK EN EL BOTON DE CONFIRMAR COMPRA
document.getElementById('btnConfirmaCompra').addEventListener('click', () => {
    const cantProd = Object.values(carrito).length
    const medpag = localStorage.getItem('medioPago')
    let tarjOK
    if (medpag === "tarjetaDebito" || medpag === "tarjetaCredito") {
        const tarjeta = document.getElementById('listaTarjetas').value
        const banco = document.getElementById('listaBancos').value
        const numTarjeta = document.getElementById('nTarjeta').value
        const vto = document.getElementById('fechaVto').value
        const titular = document.getElementById('nombreTitular').value
        const codseg = document.getElementById('codSeg').value
        tarjOK = tarjeta != "" && banco != "" && numTarjeta != "" && vto != "" && titular != "" && codseg != ""
    }
    if ((cantProd > 0 && medpag === "efectivo") || (cantProd > 0 && tarjOK)) {
        idCarrito = localStorage.getItem("idCarrito")
        const urlPUT = "http://localhost:8080/api/carts/" + idCarrito
        const cart = {
            "id": idCarrito,
            "userId": { "id": idUsuario },
            "meansOfPayment": localStorage.getItem("medioPago"),
            "deleted": true
        }
        $.ajax({
            url: urlPUT,
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify(cart),
            dataType: 'json',
        })
        Object.values(carrito).forEach(prod => {
            const idcar = localStorage.getItem('idCarrito')
            const p = {
                "productId": { "id": prod.id },
                "quantity": prod.cantidad,
                "cartId": { "id": idcar }
            }
            $.ajax({
                url: "http://localhost:8080/api/cartItems/",
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(p),
                dataType: 'json',
            })
        })
        localStorage.removeItem('envio')
        localStorage.removeItem('medioPago')
        localStorage.removeItem('totalCompra')
        localStorage.removeItem('carritoIsFinished')
        localStorage.removeItem('idCarrito')
        localStorage.removeItem('carrito')
        carrito = {}
        pintarCarrito()
        totalCompra = 0
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
        swal("Bien hecho!", "La compra fue un éxito, en breve recibirá un email con los detalles. Gracias por elegir Gym Sales!", "success");
    } else {
        swal("Por favor ingrese los datos requeridos para la compra con tarjetas")
    }
})

//DETECTA EL CLICK EN LOS BOTONES DE SUMAR O RESTAR CANTIDADES
items.addEventListener('click', e => {
    btnAccion(e)
})

//DETECTA EL CLICK EN LOS RADIOBUTTON PARA ENVIO
document.getElementById('tipoEnvioLocal').addEventListener('click', () => {
    if (Object.values(carrito).length > 0) {
        localStorage.setItem("envio", "no")
        totalCompra = Number(totalCompra) - 600//SI SACA EL ENVIO, RESTAMOS EL ENVIO AL CARRITO DEL NAV
        localStorage.setItem("totalCompra", totalCompra)
        pintarCarrito()
    }
})
document.getElementById('tipoEnvioDomicilio').addEventListener('click', () => {
    if (Object.values(carrito).length > 0) {
        localStorage.setItem("envio", "si")
        totalCompra = Number(totalCompra) + 600//SI AGREGA EL ENVIO, SUMAMOS EL ENVIO AL CARRITO DEL NAV
        localStorage.setItem("totalCompra", totalCompra)
        pintarCarrito()
    }
})

//DETECTA EL CLICK EN LOS RADIOBUTTON PARA MEDIO DE PAGO
document.getElementById('tipoPagoEfectivo').addEventListener('click', () => {
    if (Object.values(carrito).length > 0) {
        localStorage.setItem("medioPago", "efectivo")
        pintarCarrito()
    }
})
document.getElementById('tipoPagoDebito').addEventListener('click', () => {
    if (Object.values(carrito).length > 0) {
        localStorage.setItem("medioPago", "tarjetaDebito")
        pintarCarrito()
    }
})
document.getElementById('tipoPagoCredito').addEventListener('click', () => {
    if (Object.values(carrito).length > 0) {
        localStorage.setItem("medioPago", "tarjetaCredito")
        pintarCarrito()
    }
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
        pago.innerHTML = ''
        return
    }
    footer.innerHTML = ''
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)
    cantItems = nCantidad
    templateFooter.querySelectorAll('td')[1].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)
    const btnVaciarCarrito = document.querySelector('#vaciar-carrito')
    btnVaciarCarrito.addEventListener('click', () => {
        carrito = {}
        rbEnvioLocal.checked = true
        localStorage.setItem("envio", "no")
        totalCompra = 0
        localStorage.setItem("totalCompra", totalCompra)
        document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
        pintarCarrito()
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
    tipoPago = localStorage.getItem('medioPago')
    if (envio === "si") {
        rbEnvioLocal.checked = false
        rbEnvioDomicilio.checked = true
        envios.innerHTML = ''
        templateEnvio.getElementById('nombre').textContent = user.name
        templateEnvio.getElementById('apellido').textContent = user.surname
        templateEnvio.getElementById('direccion').value = user.address
        templateEnvio.getElementById('telefono').value = user.cellPhone
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
    let medioPago = localStorage.getItem("medioPago")
    if (medioPago === "tarjetaDebito" || medioPago === "tarjetaCredito") {
        if (tipoPago === "tarjetaDebito") {
            rbTarjetaDebito.checked = true
            rbTarjetaCredito.checked = false
            rbEfectivo.checked = false
        } else if (tipoPago === "tarjetaCredito") {
            rbTarjetaDebito.checked = false
            rbTarjetaCredito.checked = true
            rbEfectivo.checked = false
        }
    } else {
        rbTarjetaDebito.checked = false
        rbTarjetaCredito.checked = false
        rbEfectivo.checked = true
        pago.innerHTML = ''
    }
    pintarTarjetas()
}

const pintarTarjetas = () => {
    pago.innerHTML = ''
    let medioPago = localStorage.getItem("medioPago")
    $(function () {
        if (medioPago === "tarjetaCredito") {
            $('#visaDebito').hide()
            $('#masterDebito').hide()
        } else if (medioPago === "tarjetaDebito") {
            $('#visa').hide()
            $('#cabal').hide()
            $('#naranja').hide()
            $('#amex').hide()
            $('#master').hide()
            $('#listaBancos').hide()
        } else {
            pago.innerHTML = ''
            templateMedioPago.innerHTML = ''
        }
    })
    const clone = templateMedioPago.cloneNode(true)
    fragment.appendChild(clone)
    pago.appendChild(fragment)
}
