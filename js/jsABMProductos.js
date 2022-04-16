const admin = document.getElementById('adminSitio')
const templateAdmin = document.getElementById('template-admin').content
const fragment = document.createDocumentFragment()




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



})
$(document).ready(() => {
    //METODO LISTAR PRODUCTOS
    const list = () => {
        $.ajax({
            url: 'http://localhost:8080/api/products',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                let data = ''
                res.forEach(element => {
                    data += `
                        <tr productId = ${element.id} >
                            <td>${element.id}</td>
                            <td>${element.name}</td>
                            <td>${element.description}</td>
                            <td>${element.price}</td>
                            <td>${element.brand}</td>
                            <td>${element.barcode}</td>
                            <td>${element.categoryId.name}</td>
                            <td></td>
                            <td><button id="btn-details" class="btn btn-warning">Detalles</button></td>
                        </tr>
                    `
                });
                $('#tbody').html(data);
            }
        })
    }

    //METODO GUARDAR PRODUCTO
    const save = () => {
        $('#agregar').on('click', function () {
            const dataProductos = {
                name: $('#titulo').val(),
                description: $('#descripcion').val(),
                price: Number($('#precio').val()),
                brand: $('#marca').val(),
                barcode: Number($('#codigoBarras').val()),
                categoryId: { "id": Number($('#categoria').val()) },
                photoId: { "id": Number($('#foto').val()) },
            }
            $.ajax({
                url: 'http://localhost:8080/api/products',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(dataProductos),
                dataType: 'json',
                success: function (data) {
                    list()
                    limpiar()
                    swal("Bien hecho!", "Tu producto se dió de alta correctamente.", "success");
                }
            })
        })
    }

    const details = () => {
        $(document).on('click', '#btn-details', function () {
            let btnDetails = $(this)[0].parentElement.parentElement
            let id = $(btnDetails).attr('productId')
            $.ajax({
                url: 
            })
        })
    }

    const limpiar = () => {
        $('#titulo').val(''),
            $('#descripcion').val(''),
            $('#precio').val(''),
            $('#marca').val(''),
            $('#codigoBarras').val(''),
            $('#categoria').val('')
        $('#foto').val('')
    }



    details()
    list()
    save()
})


