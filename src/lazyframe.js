// if (import.meta.env.MODE !==''){
//  import ('./scss/lazyframe.scss');
// }

// console.log(import.meta.env.MODE);
const Lazyframe = () => {

  let settings;

  let elements = [];

  const defaults = {
    vendor: undefined,
    id: undefined,
    src: undefined,
    thumbnail: undefined,
    title: undefined,
    apikey: undefined,
    initialized: false,
    parameters: undefined,
    lazyload: false,
    initinview: false,
    onLoad: (l) => {
    },
    onAppend: (l) => {
    },
    onThumbnailLoad: (img) => {
      // console.log(img);
    }
  };

  const constants = {
    regex: {
      youtube_nocookie: /(?:youtube-nocookie\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=)))([a-zA-Z0-9_-]{6,11})/,
      youtube: /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/,
      vimeo: /vimeo\.com\/(?:video\/)?([0-9]*)(?:\?|)/,
    },
    condition: {
      youtube: (m) => (m && m[1].length == 11) ? m[1] : false,
      youtube_nocookie: (m) => (m && m[1].length == 11) ? m[1] : false,
      vimeo: (m) => (m && m[1].length === 9 || m[1].length === 8) ? m[1] : false,
    },
    src: {
      youtube: (s) => `https://www.youtube.com/embed/${s.id}/?${s.parameters}`,
      youtube_nocookie: (s) => `https://www.youtube-nocookie.com/embed/${s.id}/?${s.parameters}`,
      vimeo: (s) => `https://player.vimeo.com/video/${s.id}/?${s.parameters}`,
    },
    endpoints: {
      youtube: (s) => `https://www.googleapis.com/youtube/v3/videos?id=${s.id}&key=${s.apikey}&fields=items(snippet(title,thumbnails))&part=snippet`,
      youtube_nocookie: (s) => `https://www.googleapis.com/youtube/v3/videos?id=${s.id}&key=${s.apikey}&fields=items(snippet(title,thumbnails))&part=snippet`,
      vimeo: (s) => `https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${s.id}`,
    },
    response: {
      youtube: {
        title: (r) => r.items['0'].snippet.title,
        thumbnail: (r) => {
          let thumbs = r.items['0'].snippet.thumbnails;
          let thumb = thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium || thumbs.default;
          return thumb.url;
        }
      },
      youtube_nocookie: {
        title: (r) => r.items['0'].snippet.title,
        thumbnail: (r) => {
          let thumbs = r.items['0'].snippet.thumbnails;
          let thumb = thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium || thumbs.default;
          return thumb.url;
        }
      },
      vimeo: {
        title: (r) => r.title,
        thumbnail: (r) => r.thumbnail_url
      },
    }
  };

  function init(elements, ...args) {
    settings = Object.assign({}, defaults, args[0]);
    // console.log(typeof elements);
    if (typeof elements === 'string') {

      const selector = document.querySelectorAll(elements);
      for (let i = 0; i < selector.length; i++) {
        initElement(selector[i]);
      }

    } else if (typeof elements.length === 'undefined') {
      initElement(elements);

    } else if (elements.length > 1) {

      for (let i = 0; i < elements.length; i++) {
        initElement(elements[i]);
      }

    } else {
      initElement(elements[0]);
    }
    if (settings.lazyload) {
      initIntersectionObserver(elements);
    }
  }

  function initElement(el) {

    if (!(el instanceof HTMLElement) ||
      el.classList.contains('lazyframe--loaded')) return;

    const lazyframe = {
      el: el,
      settings: getSettings(el),
    };

    lazyframe.el.addEventListener('click', () => {
      lazyframe.el.appendChild(lazyframe.iframe);

      const iframe = el.querySelectorAll('iframe');
      lazyframe.settings.onAppend.call(this, iframe[0]);
    });

    if (settings.lazyload) {
      build(lazyframe);
    } else {
      api(lazyframe, !!lazyframe.settings.thumbnail);
    }

  }

  function getSettings(el) {
    // console.log('getSettings: ', el);

    const attr = Array.prototype.slice.apply(el.attributes)
      .filter(att => att.value !== '')
      .reduce((obj, curr) => {
        let name = curr.name.indexOf('data-') === 0 ? curr.name.split('data-')[1] : curr.name;
        obj[name] = curr.value;
        return obj;
      }, {});

    const options = Object.assign({},
      settings,
      attr,
      {
        parameters: extractParams(attr.src)
      }
    );

    if (options.vendor) {
      const match = options.src.match(constants.regex[options.vendor]);
      options.id = constants.condition[options.vendor](match);
    }

    return options;

  }

  function extractParams(url) {
    let params = url.split('?');

    if (params[1]) {
      params = params[1];
      const hasAutoplay = params.indexOf('autoplay') !== -1;
      return hasAutoplay ? params : params + '&autoplay=1&rel=0';

    } else {
      return 'autoplay=1&rel=0';
    }

  }

  function useApi(settings) {

    if (!settings.vendor) return false;

    if (!settings.title || !settings.thumbnail) {
      if (settings.vendor === 'youtube' || settings.vendor === 'youtube_nocookie') {
        return !!settings.apikey;
      } else {
        return true;
      }

    } else {
      return false;
    }

  }

  function api(lazyframe) {
    // console.log(lazyframe.settings);
    if (useApi(lazyframe.settings)) {
      send(lazyframe, (err, data) => {
        if (err) return;

        const response = data[0];
        const _l = data[1];

        if (!_l.settings.title) {
          _l.settings.title = constants.response[_l.settings.vendor].title(response);
        }
        if (!_l.settings.thumbnail) {
          const url = constants.response[_l.settings.vendor].thumbnail(response);
          _l.settings.thumbnail = url;
          lazyframe.settings.onThumbnailLoad.call(this, url);
        }
        build(_l, true);

      });

    } else {
      build(lazyframe, true);
    }

  }

  function send(lazyframe, cb) {

    const endpoint = constants.endpoints[lazyframe.settings.vendor](lazyframe.settings);
    const request = new XMLHttpRequest();

    request.open('GET', endpoint, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(request.responseText);
        cb(null, [data, lazyframe]);
      } else {
        cb(true);
      }
    };

    request.onerror = function () {
      cb(true);
    };

    request.send();

  }

  function initIntersectionObserver(elements) {
    console.log("initIntersectionObserver");
    console.log(elements);
    const frameObserver = new IntersectionObserver((elements, frameObserver) => {
      elements.forEach((entry) => {
        if (entry.isIntersecting) {
          let el = entry.target;
          if (!el.settings) {
            el.settings = getSettings(el);
            el.el = el;
            el.settings.initialized = true;
            el.classList.add('lazyframe--loaded');
            api(el);
          }
          if (el.settings.initinview) {
            el.click();
          }
          el.settings.onLoad.call(this, el);
          // const lazyImage = entry.target
          // lazyImage.src = lazyImage.dataset.src
        }
      })
    });

    const lazyframes = document.querySelectorAll(elements + "[data-initinview]");
    console.log('lazyframes that should be initialized when in view: ', lazyframes);
    lazyframes.forEach(item => frameObserver.observe(item));
  }

  function build(lazyframe, loadImage) {

    lazyframe.iframe = getIframe(lazyframe.settings);

    if (lazyframe.settings.thumbnail && loadImage) {
      // console.log(lazyframe.settings.thumbnail);
      lazyframe.el.style.backgroundImage = `url(${lazyframe.settings.thumbnail})`;
    }

    if (lazyframe.settings.title && lazyframe.el.children.length === 0) {
      const docfrag = document.createDocumentFragment(),
        titleNode = document.createElement('span');

      titleNode.className = 'lazyframe__title';
      titleNode.innerHTML = lazyframe.settings.title;
      docfrag.appendChild(titleNode);

      lazyframe.el.appendChild(docfrag);
    }

    if (settings.lazyload === false) {
      lazyframe.el.classList.add('lazyframe--loaded');
      lazyframe.settings.onLoad.call(this, lazyframe);
      elements.push(lazyframe);
    }
    if (settings.lazyload === true) {
      // lazyframe.el.classList.add('lazyframe--loaded');
      // lazyframe.settings.onLoad.call(this, lazyframe);
      elements.push(lazyframe);
    }

    if (!lazyframe.settings.initialized) {
      elements.push(lazyframe);
    }

  }

  function getIframe(settings) {

    const docfrag = document.createDocumentFragment(),
      iframeNode = document.createElement('iframe');

    if (settings.vendor) {
      settings.src = constants.src[settings.vendor](settings);
    }

    iframeNode.setAttribute('id', `lazyframe-${settings.id}`);
    iframeNode.setAttribute('src', settings.src);
    iframeNode.setAttribute('frameborder', 0);
    iframeNode.setAttribute('allowfullscreen', '');

    docfrag.appendChild(iframeNode);
    return docfrag;

  }

  return init;

};

const lazyframe = Lazyframe();
window.lazyframe = Lazyframe();
export default lazyframe;
