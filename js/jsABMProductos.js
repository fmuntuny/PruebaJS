const admin = document.getElementById('adminSitio')
const templateAdmin = document.getElementById('template-admin').content
const fragment = document.createDocumentFragment()




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



})
$(document).ready(() => {
    //METODO LISTAR PRODUCTOS
    const listPro = () => {
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
                            <td><button id="btn-edit" class="btn btn-warning">Editar</button></td>
                            <td><button id="btn-delete" class="btn btn-danger">Eliminar</button></td>
                        </tr>
                    `
                });
                $('#tbody').html(data);
            }
        })
    }

    //METODO GUARDAR PRODUCTO
    const savePro = () => {
        $('#agregar').on('click', function () {

            //SUBIMOS LA FOTO http://localhost:8080/photos/upload
            var formData1 = new FormData($('#formSubirFoto')[0]);
            $.ajax({
                type: "POST",
                url: 'http://localhost:8080/photos/upload',
                cache: false,
                data: formData1,
                dataType: "json",
                contentType: false,
                processData: false,
                success: function (datos) {
                    console.log(datos)
                }
            });

            //DESPUÉS DE SUBIR EXITOSAMENTE LA FOTO TIENE QUE OBTENER SU ID PARA PASARSELO AL PRODUCTO
            //EN EL PHOTOID.ID

            const dataProductos = {
                name: $('#titulo').val(),
                description: $('#descripcion').val(),
                price: Number($('#precio').val()),
                brand: $('#marca').val(),
                barcode: Number($('#codigoBarras').val()),
                categoryId: { "id": Number($("#catSelect option:selected").val()) },
                photoId: { "id": Number($('#foto').val()) },
            }
            $.ajax({
                url: 'http://localhost:8080/api/products',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(dataProductos),
                dataType: 'json',
                success: function (data) {
                    listPro()
                    limpiar()
                    swal("Bien hecho!", "Tu producto se dió de alta correctamente.", "success");
                }
            })

        })
    }

    //LIMPIAR EL FORM DE LA PÁGINA
    const limpiar = () => {
        $('#titulo').val(''),
            $('#descripcion').val(''),
            $('#precio').val(''),
            $('#marca').val(''),
            $('#codigoBarras').val(''),
            $('#categoria').val('')
        $('#foto').val('')
    }


    const rellenaForm = () => {
        let dataSelect = ''
        $.ajax({
            url: 'http://localhost:8080/api/categories',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                res.forEach(element => {
                    dataSelect += `
                        <option value="${element.id}">${element.name}</option>
                    `
                });
                $('#catSelect').html(dataSelect);
            }
        })
        $(document).on('click', '#btn-edit', function () {
            let btn = $(this)[0].parentElement.parentElement
            let id = $(btn).attr('productId')
            $('#agregar').hide()
            $('#editar').show()
            $.ajax({
                url: 'http://localhost:8080/api/products/' + id,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    $('#id').val(res.id)
                    $('#titulo').val(res.name)
                    $('#descripcion').val(res.description)
                    $('#precio').val(res.price)
                    $('#marca').val(res.brand)
                    $('#codigoBarras').val(res.barcode)
                    $("#catSelect option:selected").each(function () {//FUNCION PARA DESELECCIONAR TODOS LOS CALORES SELECTEDS
                        $(this).removeAttr("selected");
                    });
                    $("#catSelect option[value='" + res.categoryId.id + "']").attr("selected", true);
                    $('#foto').val(res.photoId.id)
                }
            })
        })
    }

    //EDITAR PRODUCTOS
    const editPro = () => {
        $('#editar').on('click', function () {
            let id = $('#id').val()
            $('#agregar').css('display', 'none')
            $('#editar').css('display', 'block')
            let dataProductos
            dataProductos = {
                name: $('#titulo').val(),
                description: $('#descripcion').val(),
                price: Number($('#precio').val()),
                brand: $('#marca').val(),
                barcode: Number($('#codigoBarras').val()),
                categoryId: { "id": Number($('#catSelect').val()) },
                photoId: { "id": Number($('#foto').val()) },
            }
            $.ajax({
                url: 'http://localhost:8080/api/products/' + id,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify(dataProductos),
                dataType: 'json',
                success: function (res) {
                    swal("Bien hecho!", "Producto editado correctamente.", "success");
                    $('#editar').css('display', 'none')
                    $('#agregar').css('display', 'block')
                    limpiar()
                    listPro()
                }
            })
        })
    }

    //ELIMINAR PRODUCTOS
    const deletePro = () => {

        $(document).on('click', '#btn-delete', function () {
            let btn = $(this)[0].parentElement.parentElement
            let id = $(btn).attr('productId')
            $.ajax({
                url: 'http://localhost:8080/api/products/' + id,
                type: 'DELETE',
                dataType: 'json',
                success: function (res) {
                    listPro()
                    swal("Bien hecho!", "Se ha eliminado correctamente el producto.", "success");
                }

            })
        })



    }


    editPro()
    listPro()
    savePro()
    deletePro()
    rellenaForm()
    limpiar()
})


