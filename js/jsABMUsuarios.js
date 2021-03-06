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
            url: 'http://localhost:8080/api/users',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                let data = ''
                res.forEach(element => {
                    data += `
                        <tr productId = ${element.id} >
                            <td>${element.id}</td>
                            <td>${element.name}</td>
                            <td>${element.surname}</td>
                            <td>${element.address}</td>
                            <td>${element.cellPhone}</td>
                            <td>${element.email}</td>
                            <td>${element.password}</td>
                            <td>${element.roleId.name}</td>
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
            const dataProductos = {
                name: $('#nombre').val(),
                surname: $('#apellido').val(),
                address: $('#direccion').val(),
                cellPhone: $('#telefono').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                roleId: { "id": Number($('#rol').val()) },
            }
            $.ajax({
                url: 'http://localhost:8080/api/users',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(dataProductos),
                dataType: 'json',
                success: function (data) {
                    listPro()
                    limpiar()
                    swal("Bien hecho!", "El usuario se di?? de alta correctamente.", "success");
                }
            })
        })
    }

    //LIMPIAR EL FORM DE LA P??GINA
    const limpiar = () => {
        $('#nombre').val(''),
            $('#apellido').val(''),
            $('#direccion').val(''),
            $('#telefono').val(''),
            $('#email').val(''),
            $('#password').val('')
        $('#rol').val('')
    }


    const rellenaForm = () => {
        $(document).on('click', '#btn-edit', function () {
            let btn = $(this)[0].parentElement.parentElement
            let id = $(btn).attr('productId')
            $('#agregar').hide()
            $('#editar').show()
            $.ajax({
                url: 'http://localhost:8080/api/users/' + id,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    $('#id').val(res.id)
                    $('#nombre').val(res.name)
                    $('#apellido').val(res.surname)
                    $('#direccion').val(res.address)
                    $('#telefono').val(res.cellPhone)
                    $('#email').val(res.email)
                    $('#password').val(res.password)
                    $('#rol').val(res.roleId.name)
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
            let rol
            if ($('#password').val() === "Admin") {
                rol = 1
            } else {
                rol = 2
            }
            dataUsuarios = {
                id: $('#id').val(),
                name: $('#nombre').val(),
                surname: $('#apellido').val(),
                address: $('#direccion').val(),
                cellPhone: Number($('#telefono').val()),
                email: $('#email').val(),
                password: $('#password').val(),
                roleId: { "id": rol },
            }
            $.ajax({
                url: 'http://localhost:8080/api/users/' + id,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify(dataUsuarios),
                dataType: 'json',
                success: function (res) {
                    swal("Bien hecho!", "Usuario editado correctamente.", "success");
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
                url: 'http://localhost:8080/api/users/' + id,
                type: 'DELETE',
                dataType: 'json',
                success: function (res) {
                    listPro()
                    swal("Bien hecho!", "Se ha eliminado correctamente el usuario.", "success");
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