let btnRegistro = document.getElementById("btnRegistrar");

let inputElement = document.getElementById("inputFile");
inputElement.addEventListener("change", handleFiles, false);

let img = document.getElementById("inputImg");

function handleFiles() {
    let fileList = this.files; /* now you can work with the file list */

    img = document.getElementById("inputImg");
    img.src = window.URL.createObjectURL(fileList[0]);
    img.onload = function() {
        window.URL.revokeObjectURL(this.src);
    }
}