/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


(function () {
  'use strict';

  window.LSR = __webpack_require__(1);
})();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* jshint undef: true,strict:true,trailing:true,loopfunc:true */
/* global document,window,Element,module,console */

// https://developer.apple.com/tvos/human-interface-guidelines/icons-and-images/layered-images/

/*
 * lsr
 * ©2017 David Miller
 * https://readmeansrun/com
 *
 * lsr is licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * http://designmodo.com/apple-tv-effect
 */

(function () {
  'use strict';

  const
  // VERSION = '0.0.1',

  RMR = __webpack_require__(2);

  /**
   * Create an LSR instance
   *
   * @param {Object} arg - object containing params
   */
  const LSR = function (arg) {
    let l = 0,
        imgs = [],
        listeners = {};

    const defaults = {
      log: true,
      prefix: 'lsr',
      node: document.body,
      shine: true,
      shadow: true,
      rotation: {
        x: 0.05,
        y: 0.05
      }
    },
          config = RMR.Object.merge(defaults, arg) || defaults,
          supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

    if (!config.node) {
      config.node = document.body;
    }

    if (typeof config.node === 'string') {
      config.node = document.querySelector(config.node);
    }

    if (!config.node instanceof Element) {
      throw new Error('Invalid LSR ' + config.node);
    }

    if (!config.rotation.hasOwnProperty('x')) {
      config.rotation.x = defaults.rotation.x;
    }
    if (!config.rotation.hasOwnProperty('y')) {
      config.rotation.y = defaults.rotation.y;
    }

    imgs = RMR.Array.coerce(config.node.querySelectorAll('.' + config.prefix));
    if (config.node.classList.contains(config.prefix)) {
      imgs.push(config.node);
    }

    // no .lsr elements to process
    if (imgs.length === 0) {
      if (defaults.log) {
        window.console.log('No layers');
      }
      return;
    }

    for (l = 0; l < imgs.length; l++) {

      const thisImg = imgs[l],
            layerElems = thisImg.querySelectorAll('.' + config.prefix + '-layer');

      if (!thisImg.getAttribute('id')) {
        thisImg.setAttribute('id', RMR.String.guid());
      }

      if (layerElems.length <= 0) {
        continue;
      }

      while (thisImg.firstChild) {
        thisImg.removeChild(thisImg.firstChild);
      }

      const container = document.createElement('div'),
            shine = document.createElement('div'),
            layersHTML = document.createElement('div'),
            layers = [];

      let shadow = document.createElement('div');

      container.className = config.prefix + '-container';

      if (config.shine) {
        shine.className = config.prefix + '-shine';
        container.appendChild(shine);
      }

      if (config.shadow) {
        shadow.className = config.prefix + '-shadow';
        container.appendChild(shadow);
      } else {
        shadow = null;
      }

      layersHTML.className = config.prefix + '-layers';

      for (let i = 0; i < layerElems.length; i++) {
        const layer = document.createElement('div');

        layer.className = layerElems[i].getAttribute('data-class');
        layersHTML.appendChild(layer);

        layers.push(layer);
      }

      container.appendChild(layersHTML);

      thisImg.appendChild(container);

      const w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth;
      thisImg.style.transform = 'perspective(' + w * 3 + 'px)';

      if (supportsTouch) {
        window.preventScroll = false;

        (function (_thisImg, _layers, _totalLayers, _shine) {

          const touchmove = function (e) {
            if (window.preventScroll) {
              e.preventDefault();
            }
            processMovement(e, _thisImg, _layers, _totalLayers, _shine);
          },
                touchstart = function () {
            window.preventScroll = true;
            processEnter(_thisImg);
          },
                touchend = function (e) {
            window.preventScroll = false;
            processExit(e, _thisImg, _layers, _totalLayers, _shine);
          };

          listeners[_thisImg.getAttribute('id')] = {
            'touchmove': touchmove,
            'touchstart': touchstart,
            'touchend': touchend
          };

          thisImg.addEventListener('touchmove', touchmove);

          thisImg.addEventListener('touchstart', touchstart);

          thisImg.addEventListener('touchend', touchend);
        })(thisImg, layers, layerElems.length, shine);
      } else {
        (function (_thisImg, _layers, _totalLayers, _shine) {

          const mousemove = function (e) {
            processMovement(e, _thisImg, _layers, _totalLayers, _shine);
          },
                focus = function () {
            processEnter(_thisImg);
            processMovement(null, _thisImg, _layers, _totalLayers, _shine);
          },
                mouseenter = function () {
            processEnter(_thisImg);
          },
                mouseleave = function () {
            processExit(_thisImg, _layers, _totalLayers, _shine);
          },
                blur = function () {
            processExit(_thisImg, _layers, _totalLayers, _shine);
          };

          listeners[_thisImg.getAttribute('id')] = {
            'mousemove': mousemove,
            'focus': focus,
            'mouseenter': mouseenter,
            'mouseleave': mouseleave,
            'blur': blur
          };

          thisImg.addEventListener('mousemove', mousemove);

          thisImg.addEventListener('focus', focus);

          thisImg.addEventListener('mouseenter', mouseenter);

          thisImg.addEventListener('mouseleave', mouseleave);

          thisImg.addEventListener('blur', blur);
        })(thisImg, layers, layerElems.length, shine);
      }
    }

    this.destroy = function () {
      for (const id in listeners) {
        if (listeners.hasOwnProperty(id)) {
          const node = document.getElementById(id);
          if (!node) {
            continue;
          }
          for (const event in listeners[id]) {
            if (listeners[id].hasOwnProperty(event)) {
              node.removeEventListener(event, listeners[id][event]);
            }
          }
        }
      }

      listeners = null;
    };

    function processMovement(event, element, layers, totalLayers, shine) {
      if (!event) {
        const region = RMR.Node.getRect(element);
        event = { pageX: region.left + region.width / 2, pageY: region.top + region.height / 2 };
      }

      const touchEnabled = 'ontouchstart' in window || navigator.msMaxTouchPoints ? true : false,
            bdst = document.body.scrollTop,
            bdsl = document.body.scrollLeft,
            pageX = touchEnabled ? event.touches[0].pageX : event.pageX,
            pageY = touchEnabled ? event.touches[0].pageY : event.pageY,
            offsets = element.getBoundingClientRect(),
            w = element.clientWidth || element.offsetWidth || element.scrollWidth,
            // width
      h = element.clientHeight || element.offsetHeight || element.scrollHeight,
            // height
      wMultiple = 320 / w,
            offsetX = 0.52 - (pageX - offsets.left - bdsl) / w,
            // cursor position X
      offsetY = 0.52 - (pageY - offsets.top - bdst) / h,
            // cursor position Y
      dy = pageY - offsets.top - bdst - h / 2,
            // @h/2 = center of container
      dx = pageX - offsets.left - bdsl - w / 2,
            // @w/2 = center of container
      yRotate = (offsetX - dx) * (config.rotation.y * wMultiple),
            // rotation for container Y
      xRotate = (dy - offsetY) * (config.rotation.x * wMultiple); // rotation for container X

      let i = 0,
          angle = Math.atan2(dy, dx) * 180 / Math.PI - 90,
          // convert rad in degrees
      imgCSS = 'rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)'; // img transform

      // get angle between 0-360
      if (angle < 0) {
        angle = angle + 360;
      }

      if (element.firstChild.classList.contains('over')) {
        imgCSS += ' scale3d(' + config.scale + ',' + config.scale + ',' + config.scale + ')';
      }
      element.firstChild.style.transform = imgCSS;

      if (shine) {
        shine.style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (pageY - offsets.top - bdst) / h * 0.4 + ') 0%,rgba(255,255,255,0) 80%)';
        shine.style.transform = 'translateX(' + offsetX * totalLayers - 0.1 + 'px) translateY(' + offsetY * totalLayers - 0.1 + 'px)';
      }

      // parallax for each layer
      // var revNum = totalLayers;
      for (i = 0; i < totalLayers; i++) {
        layers[i].style.transform = 'translateX(' + offsetX * (totalLayers - i) * (i * 2.5 / wMultiple) + 'px) translateY(' + offsetY * totalLayers * (i * 2.5 / wMultiple) + 'px)';
        //        revNum--;
      }
    }

    function processEnter(element) {
      element.firstChild.classList.add('over');
    }

    function processExit(element, layers, totalLayers, shine) {
      const container = element.firstChild;
      let i = 0;

      container.classList.remove('over');
      container.style.transform = '';
      shine.style.cssText = '';

      for (i = 0; i < totalLayers; i++) {
        layers[i].style.transform = '';
      }
    }
  };

  module.exports = LSR;
})();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/* global require, module, console, Promise */

(function() {

  'use strict';

  const

  /**
    Determine if a string is a valid internet URL

    @param {String} str - the string to be tested
    @return {Bool} - `true` of `false`
   */
  isURL = function(str) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
  },

  /*
   *
   * @param node {HTMLElement}
   * @param styles {Object}
   */
  selectorMatches = function (node, selector) {

    const
    p = Element.prototype,
    f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
      return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };

    return f.call(node, selector);
  },

  /**
   * Determine if we're in a touch-based browser (phone/tablet)
   *
   * @return {Bool} `true` or `false`
   */
  isTouch = function() {

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    return typeof window.orientation !== 'undefined';

//    return 'ontouchstart' in window || navigator.msMaxTouchPoints;
  },

  /*
   * Generate a unique string suitable for id attributes
   *
   * @param basename (String)
   * @return string
   */
  guid = function(basename) {
    return (basename ? basename : 'rmr-guid-') + parseInt(Math.random() * 100, 10) + '-' + parseInt(Math.random() * 1000, 10);
  },

  /*
   * Merge two objects into one, values in b take precedence over values in a
   *
   * @param a {Object}
   * @param b {Object}

   * @return Object
   */
  merge = function(a, b) {
    const o = {};
    let i = null;
    for (i in a) {
      if (a.hasOwnProperty(i)) {
        o[i] = a[i];
      }
    }
    if (! b) {
      return o;
    }
    for (i in b) {
      if (b.hasOwnProperty(i)) {
        o[i] = b[i];
      }
    }
    return o;
  },

  /*
   * Convert an array-like thing (ex: NodeList or arguments object) into a proper array
   *
   * @param list (array-like thing)
   * @return Array
   */
  arr = function(list) {

    const ret = [];
    let i = 0;

    if (list instanceof Array) {
      return list;
    }

    if (! list.length) {
      return ret;
    }

    for (i = 0; i < list.length; i++) {
      ret.push(list[i]);
    }

    return ret;
  },

  /**
   * Retrieve an element via query selector
   *
   * @param {Mixed} arg the element to retrieve
   * @return {Element} element corresponding to the selector (or null if none exists)
   */
  getElement = function(arg) {
    if (typeof arg === 'string') {
      return document.querySelector(arg);
    }

    return arg;
  },

  /*
   * Create an element with a set of attributes/values
   *
   * @param type (String)
   * @param attrs {Object}
   *
   * @return HTMLElement
   */
  makeElement = function(type, attrs) {

     const n = document.createElement(type);

     for (const i in attrs) {
       if (attrs.hasOwnProperty(i) && attrs[i]) {
         n.setAttribute(i, attrs[i]);
       }
     }
     return n;
  },

  /**
   * Make loader
   *
   * @return {Element} SVG element
   */
  loader = function() {

/*
    const svg = makeElement('svg', {
      version: '1.1',
      class: 'rmr-loader',
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      x: '0px',
      y: '0px',
      width: '40px',
      height: '40px',
      viewBox: '0 0 40 40',
      'enable-background': 'new 0 0 40 40',
      'xml:space': 'preserve'
    });

    svg.innerHTML = 
    '<path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"></path>' +
    '<path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z">' +
    '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite"></animateTransform>' +
    '</path>';
*/

    return '<svg version="1.1" class="rmr-loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">' +
    '<path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"></path>' +
    '<path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z">' +
    '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite"></animateTransform>' +
    '</path>' +
    '</svg>';

//    return svg;
  },

  /**
   * Retrieve an object containing browser/screen coordinates for a DOM element
   *
   * @param {Element} node the element whose coordinates should be retrieved
   * @return {Object} An object containing { top : xx, left : xx, bottom: xx, right: xx, width: xx, height: xx }
   */
  getRect = function(node) {

    node = getElement(node);

    const
    rect = node.getBoundingClientRect(),
    ret = { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right }; // create a new object that is not read-only

    ret.top += window.pageYOffset;
    ret.left += window.pageXOffset;

    ret.bottom += window.pageYOffset;
    ret.right += window.pageYOffset;

    ret.width = rect.right - rect.left;
    ret.height = rect.bottom - rect.top;

    return ret;
  },


  /**
   * Localize a string
   *
   * {
   *   'en' : {
   *      'key' : 'neighbor'
   *    },
   *    'en-ca' : {
   *      'key' : 'neighbour'
   *    }
   *  }
   *
   * @param {Object} lookup dictionary
   * @param {String} key the to localize
   * @return {String} string
   */
  localize = function(lookup, key) {

    if (typeof navigator === 'undefined') {
      return key;
    }

    let i, lang;

    for (i in navigator.languages) {
      if (! navigator.languages.hasOwnProperty(i)) {
        continue;
      }
      lang = navigator.languages[i].toLowerCase();
      if (lookup.hasOwnProperty(lang) && lookup[lang].hasOwnProperty(key)) {
        return lookup[lang][key];
      }
    }

    for (i in navigator.languages) {
      if (! navigator.languages.hasOwnProperty(i)) {
        continue;
      }
      lang = navigator.languages[i].split('-')[0].toLowerCase();
      if (lookup.hasOwnProperty(lang) && lookup[lang].hasOwnProperty(key)) {
        return lookup[lang][key];
      }
    }

//    console.warn('No localization for ' + key);
    return key;
  },

  /**
   * Apply styles to a node
   *
   * @param {HTMLElement} node that should have styles applied
   * @param {Object} styles key/value pairs for styles and values
   * @return {Element} node
   */
  setStyles = function(node, styles) {

    node = getElement(node);
    if (! node) {
      return false;
    }

    for (const i in styles) {
      if (styles.hasOwnProperty(i) && styles[i]) {
        node.style[i] = styles[i];
      }
    }

    return node;
  },

  /**
   * Build a query string from an object
   *
   * @param {Object} obj the object to be passed via URL
   * @return {String} str query string corresponding to the object
   */
  queryString = function(obj) {

    if (Object.keys(obj).length === 0) {
      return '';
    }

    return Object.keys(obj).reduce(function(a,k) {
      a.push(k + '=' + encodeURIComponent(obj[k]));
      return a;
    },[]).join('&');
  },

  /**
   * Generate an object containing keys/values corresponding to form elements
   *
   * @param {Element} form element
   * @return {Object} the key/value pairs for the form
   */
  objectFromForm = function(form) {

    form = getElement(form);
    if (! form) {
      return {};
    }

    const
    inputs = form.querySelectorAll('select,input,textarea'),
    params = {};

    for (const i in inputs) {
      if (! inputs.hasOwnProperty(i)) {
        continue;
      }
      const
        name = inputs[i].getAttribute('name'),
        type = inputs[i].type ? inputs[i].type : 'text';

      if (inputs[i].hasAttribute('disabled')) {
        continue;
      }

      if (type === 'radio' || type === 'checkbox') {
        if (inputs[i].checked) {
          params[name] = inputs[i].value;
        }
      } else {
        params[name] = inputs[i].value;
      }
    }

    return params;
  },

  /**
   * 
   *
   * @param {Element} node starting point of search
   * @param {String} ancestor the selector for the ancestor we're looking for
   * @return {Element} or `null` if no such ancestor exists
   */
  ancestor = function(node, ancestor, includeSelf) {

    node = getElement(node);
    if (! node) {
      return null;
    }

    if (includeSelf && selectorMatches(node, ancestor)) {
      return node;
    }

    let parent = node;

    while (parent = parent.parentNode) {
      if (selectorMatches(parent, ancestor)) {
        return parent;
      }
    }

    return null;
  },
  
  /**
   * 
   *
   * @param {Element} node the node to be removed
   */
  removeNode = function(node) {

    node = getElement(node);
    if (! node) {
      return null;
    }

    node.parentNode.removeChild(node);

    return true;
  },

  /**
   * Make an XHR request
   *
   * @param {Object} config url, method, params, form
   * @param {Function} handler invoked on completion
   * @return {XMLHttpRequest} object making the request
   */
  xhrRequest = function(config, handler) {

    if (typeof XMLHttpRequest === 'undefined') {
      return null;
    }

    const defaults = {
      form: null,
      url: '/',
      method: 'get',
      params: null
    };

    config = merge(defaults, config);

    if (config.form) {
      config.form = getElement(config.form);
      config.url = config.form.getAttribute('action'),
      config.method = config.form.getAttribute('method') ? config.form.getAttribute('method') : 'get',
      config.params = objectFromForm(config.form);
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {

      if (this.readyState === 4) {
        if (handler) {
          handler(xhttp);
        }
      }
    };

    let url = config.url;
    if (config.method.toUpperCase() === 'GET' && config.params) {
      url = url + '?' + queryString(config.params);
    }

    xhttp.open(config.method, url, true);
    xhttp.send();

    return xhttp;
  },


  /**
   * Retrieve the last non-empty element of an array
   *
   * @param {Array} list - array to be iterated through
   * @param {Function} func (optional) function used to evaluate items in the array
   * @return {Mixed} the last non-empty value in the array (or `null` if no such value exists)
   */
  lastValue = function(list, func) {

    list = arr(list);

    let i = list.length - 1;
    while (i >= 0) {
      if (func ? func(list[i]) : list[i]) {
        return list[i];
      }
      i--;
    }

    return null;
  };

  module.exports = {
    Browser: {
      isTouch: isTouch
    },
    String: {
      isURL: isURL,
      guid: guid,
      localize: localize
    },
    Array: {
      coerce: arr,
      last: lastValue
    },
    Object: {
      merge: merge,
      queryString: queryString
    },
    XHR: {
      request: xhrRequest
    },
    Node: {
      ancestor: ancestor,
      matches: selectorMatches,
      remove: removeNode,
      loader: loader,
      get: getElement,
      make: makeElement,
      getRect: getRect,
      setStyles: setStyles
    }
  };

})();


/*
if (require.main === module) {

  if (process.argv.length === 3) {
    retrieveMetadata(process.argv[2]).then(function(meta) {
      console.log(JSON.stringify(meta));
    }).catch(function(err) {
      console.log('🚫  ' + err);
    });
  } else {
    console.log('🚫  No URL provided');
  }
}
*/



/***/ })
/******/ ]);