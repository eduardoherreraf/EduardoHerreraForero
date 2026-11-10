// Import our custom CSS
import '../scss/styles.scss';
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';




// Import PrismJS
import Prism from 'prismjs';

// Import lenguajes ANTES que plugins
import '../../node_modules/prismjs/components/prism-bash.min.js';
import '../../node_modules/prismjs/components/prism-python.min.js';
import '../../node_modules/prismjs/components/prism-json.min.js';

// Import plugins JS
import '../../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.js';
import '../../node_modules/prismjs/plugins/toolbar/prism-toolbar.min.js';
import '../../node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js';
import '../../node_modules/prismjs/plugins/show-language/prism-show-language.min.js';
import '../../node_modules/prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js';
import '../../node_modules/prismjs/plugins/match-braces/prism-match-braces.min.js';
import '../../node_modules/prismjs/plugins/line-highlight/prism-line-highlight.min.js';

// Forzar highlighting después de que cargue todo
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
});

// Import bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Hacer Prism global ANTES del DOMContentLoaded
window.Prism = Prism;

// Múltiples intentos de highlighting
/* document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, Prism available:', typeof Prism !== 'undefined');
    setTimeout(() => {
        if (typeof Prism !== 'undefined') {
            console.log('Forcing Prism highlight...');
            Prism.highlightAll();
        }
    }, 100);
}); */

// También intentar cuando la página esté completamente cargada
/* window.addEventListener('load', function() {
    setTimeout(() => {
        if (typeof Prism !== 'undefined') {
            console.log('Window loaded, forcing Prism highlight again...');
            Prism.highlightAll();
        }
    }, 200);
}); */

// O si ya tienes contenido dinámico
/* if (typeof Prism !== 'undefined') {
  Prism.highlightAll();
}
 */
document.getElementById('myForm').reset();

// Botón to top
// Get the button
const myBtnScroll = document.getElementById('myBtnScroll');
myBtnScroll.addEventListener('click', () => {
  window.scrollTo(0, 0);
});

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    myBtnScroll.style.display = 'block';
  } else {
    myBtnScroll.style.display = 'none';
  }
}
