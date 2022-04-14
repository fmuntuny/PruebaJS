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