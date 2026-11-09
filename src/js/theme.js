
// pagina ha cargado totalmente
window.onload = function () {
    let tema = localStorage.getItem("theme") || "dark";
    if (tema === "dark") temaOscuro();
    if (tema === "light") temaClaro();
};
// Change of Theme
const cambiarTema = () => {
    const temaActual = localStorage.getItem("theme") || "dark";
    if (temaActual === "dark") {
        temaClaro();
    } else {
        temaOscuro();
    }
};
const temaOscuro = () => {
    document.querySelector("body").setAttribute("data-bs-theme", "dark");
    document
        .querySelector("#dl-icon")
        .setAttribute(
            "class",
            "btn site-button text-center d-flex bg-body-tertiary text-light"
        );
    localStorage.setItem("theme", "dark");
};
const temaClaro = () => {
    document.querySelector("body").setAttribute("data-bs-theme", "light");
    document
        .querySelector("#dl-icon")
        .setAttribute("class", "btn site-button text-center d-flex bg-light text-dark");
    localStorage.setItem("theme", "light");
};