# Convención BEM del sitio

Las clases propias usan `bloque`, `bloque__elemento` y
`bloque__elemento--modificador`. Los nombres están en minúsculas, con guiones
entre palabras. Un modificador se utiliza junto con su clase base.

| Componente | Ejemplos |
| --- | --- |
| Menú del sitio | `site-menu`, `site-menu__item`, `site-menu__submenu-link` |
| Navegación | `site-nav__link--publications-active`, `site-nav__toggle-icon` |
| Ejemplos con código y resultado | `code-example`, `code-example__html`, `code-example__output` |
| Formularios de ejemplo | `demo-fieldset__legend`, `demo-select__label`, `demo-form__input` |
| Artículo con modo oscuro | `demo-article`, `demo-article--dark`, `demo-article__card` |
| Ejemplos independientes | `demo-semantic__header`, `demo-flexbox__card`, `demo-template__button` |

`docs/bem-map.json` registra los nombres anteriores y sus equivalentes. `shared`
contiene las clases compartidas, `pages` las clases de estilos internos y
`pageTagClasses` las clases que sustituyen selectores de etiquetas en los
ejemplos independientes.

Las clases públicas de Bootstrap, Bootstrap Icons y Prism se conservan. Cuando
un estilo propio modifica un componente de Bootstrap, se añade una clase BEM
al mismo elemento; por ejemplo, `class="btn site-button"`. Los scripts que
reemplazan listas de clases deben conservar ambas.

Los IDs siguen siendo los destinos de enlaces, etiquetas de formularios y
selectores de JavaScript. Los estilos del contenedor de introducción y del
botón para subir usan `site-layout__intro` y `site-scroll-top`.

Las reglas globales de etiquetas, los reinicios universales, las variables CSS
y las animaciones no necesitan nombres BEM. Los estados nativos (`:hover`,
`:focus-visible`, `[open]`) y las consultas de medios se mantienen. Los
atributos `style` que muestran valores concretos en las lecciones o controlan
la visibilidad con JavaScript se conservan.

Para validar nombres, referencias y modificadores:

```sh
python scripts/check-bem.py
npm run build
```
