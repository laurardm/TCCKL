document.addEventListener("DOMContentLoaded", function(){
    fetch("/componentes/logo.html")
    .then(response => response.text())
    .then(data => {

        document.getElementById("logo").innerHTML= data;
    });
});