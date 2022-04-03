let totalCompra = ""

document.addEventListener('DOMContentLoaded', () => {
    totalCompra = localStorage.getItem('totalCompra')
    document.getElementById('totalCompraNav').innerHTML = `$ ${totalCompra}`
})