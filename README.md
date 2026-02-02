# Plantilla Bootstrap + SASS + PARCELJS para MPA

Plantilla para Bootstrap 5 con pre-procesador SASS y con la herramienta compilación y minificado Parceljs.

## Instalación del Proyecto

### Comenzando

Descargar el repo:

```bash
git-github.com:eduardoherreraf/PlantillaMiPagina.git
```

### Instalación

Instalar el proyecto:

```bash
npm install
```

**En este momento ya se puede usar esta plantilla para hacer una página web con Bootstrap + SASS + Parcel**

### Iniciar Ejecución

Para iniciar la ejecución del proyecto, mostrar la página web en el navegador:

```bash
npm start
```

Con este comando se crea automáticamente la carpeta ```dist``` con los archivos listos para producción.

También se puede usar el comando:

```bash
npm run dev
```

Se puede usar cualquiera de los dos indiferentemente.

### Pre-requisitos

- Tener instalado NodeJS

## Como se Construyó esta Plantilla

### Configuración

De la dirección ```https://getbootstrap.com/docs/5.3/getting-started/parcel/```, se tomaron los siguientes comandos, los cuales son usados en la terminal:

#### Creación de la carpeta del proyecto e inicio de NPM

```bash
mkdir my-project && cd my-project
npm init -y
```

#### Instalación de PARCELJS

```bash
npm i --save-dev parcel
```

La bandera ```--save-dev``` indica que esta dependencia es sólo para el desarrollo del proyecto.

#### Instalación de BOOTSTRAP

```bash
npm i --save bootstrap @popperjs/core
```

Se incluye la instalación de la librería POPPERJS para la creación de popovers, dropdowns, tooltips,...

### Estructura del Proyecto

```bash
mkdir {src,src/js,src/scss}
touch src/index.html src/js/main.js src/scss/styles.scss
```

### Configuración de PARCELJS

1. LLenar en el archivo ```src/index.html```:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap w/ Parcel</title>
    <link rel="stylesheet" href="scss/styles.scss">
    <script type="module" src="js/main.js"></script>
  </head>
  <body>
    <div class="container py-4 px-3 mx-auto">
      <h1>Hello, Bootstrap and Parcel!</h1>
      <button class="btn btn-primary">Primary button</button>
    </div>
  </body>
</html>
```

Parcel detectará automáticamente que se está usando Sass e instalará el plugin Sass Parcel para soportarlo, pero, si se quiere se puede instalar manualmente ejecutando manualmente el comando ```npm i --save-dev @parcel/transformer-sass```.

2. Añadir los scripts scripts de NPM de PARCELJS:
En el archivo ```package.json``` adicionar la siguiente información:

```json
"scripts": {
    "dev": "cd dist && rm -Rf * && cd .. && parcel --lazy --open http://localhost:1234/ --no-source-maps",
    "start": "parcel serve",
    "build": "cd dist && rm -Rf * && cd .. && parcel build --public-url ./ --no-source-maps",
    "test": "echo \"Error: no test specified\" && exit 1"
   },
  ```

En este caso se ha incluido el script ```"build": "cd dist && rm -Rf * && cd .. && parcel build --public-url ./ --no-source-maps",```:

- ```cd dist && rm -Rf * && cd ..``` desocupa el contenido de la carpeta ```dist/```.
- ```parcel build``` ejecuta el script.
- ```--public-url ./``` se establece la forma en que se configuraran los direcconamientos, las URL internas, esta configuración evita tener que corregir las direcciones de los archivos ```main.js``` ó ```styles.scss```.
- ```--no-source-maps``` no se crean archivos map.

3. Cambiar el punto de entrada del proyecto:
En el archivo ```package.json``` cambiar ```"main": "index.js"``` por ```"source": "src/index.html",``` para que el punto de entrada al sitio sea la página ```index.html```.

4. Finamente, iniciar PARCELJS. En el folder ```my-proyect``` en la terminal ejecutar el script de inicio (start) o de desarrollo (dev):

```bash
npm start ó npm run dev
```

### Importar BOOTSTRAP

1. Importar los archivos CSS de BOOTSTRAP:
En el archivo ```src/scss/styles.scss``` insertar:

```javascript
// Import all of Bootstrap's CSS
@import "bootstrap/scss/bootstrap";
```

1. Importar los archivos de javascript de BOOTSTRAP:
En el archivo ```src/js/main.js``` insertar:

```js
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
```

POPPERJS se importa automáticamente con la importación de BOOTSTRAP.

3. Listo a programar

### Consideraciones Finales

Si las importaciones de los estilos no sirve, cambiar en main.js:

```js
// Import our custom CSS
import '../scss/styles.scss';
```

## Compilación del proyecto para Producción

Cuando se haya terminado y se quiera obtener la versión para producción se ejecuta el comando: ```npm run build``` y los archivos se quedan disponibles en la carpeta ```dist```, disponibles para su publicación sin ningún cambio.

## Construido con

- [Bootstrap v5.3](https://getbootstrap.com/) - Librería web usado
- [Parcel](https://parceljs.org/) - Copilador de código
- [SASS](https://sass-lang.com/) - Preprocesador

## Actualización
Este proyecto se encuantra totalmente actualizado en la dirección: https://eduardoherreraf.github.io/bootstrap-0002-instalacion_de_bootstrap_v5_con_npm_y_parcel.html

## Autor

- **Eduardo Herrera Forero** [eduardoherreraf](https://github.com/eduardoherreraf)

## Licencia

Este proyecto está bajo la Licencia libre.

---
⌨️ con ❤️ por [eduardoherreraf](https://github.com/eduardoherreraf) 😊
