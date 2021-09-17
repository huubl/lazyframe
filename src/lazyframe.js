// if (import.meta.env.MODE !==''){
//  import ('./scss/lazyframe.scss');
// }
// @TODO rewrite everything, to make it easier and faster
// some examples
// https://www.labnol.org/internet/light-youtube-embeds/27941/
// https://www.benjamin-mylius.de/lazy-load-fuer-embedded-youtube-videos/
// https://github.com/justinribeiro/lite-youtube uses Shadow DOM
// https://codepen.io/chriscoyier/pen/GRKZryx
let elements = [];

// console.log(import.meta.env.MODE);
const Lazyframe = () => {

  let settings;

  const defaults = {
    vendor: undefined,
    id: undefined,
    src: undefined,
    thumbnail: undefined,
    title: undefined,
    initialized: false,
    parameters: undefined,
    lazyload: false,
    autoplay: true,
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
      youtube: (m) => (m && m[1].length == 11 ? m[1] : false),
      youtube_nocookie: (m) => (m && m[1].length == 11 ? m[1] : false),
      vimeo: (m) =>
        (m && m[1].length === 9) || m[1].length === 8 ? m[1] : false,
    },
    src: {
      youtube: (s) =>
        `https://www.youtube.com/embed/${s.id}/?autoplay=${
          s.autoplay ? "1" : "0"
        }`,
      youtube_nocookie: (s) =>
        `https://www.youtube-nocookie.com/embed/${s.id}/?autoplay=${
          s.autoplay ? "1" : "0"
        }`,
      vimeo: (s) =>
        `https://player.vimeo.com/video/${s.id}/?autoplay=${
          s.autoplay ? "1" : "0"
        }`,
    },
    endpoint: (s) => `https://noembed.com/embed?url=${s.src}`,
    response: {
      title: (r) => r.title,
      thumbnail: (r) => r.thumbnail_url,
    },
  };

  function init(elements, ...args) {
    settings = Object.assign({}, defaults, args[0]);
    console.log("typof elements:", typeof elements);

    const frameObserver = new IntersectionObserver((elements) => {
      elements.forEach((entry) => {
        if (entry.isIntersecting) {
          let el = entry.target;
          console.log(el.settings);
          if (!el.settings) {
            el.settings = getSettings(el);
            el.el = el;
            getEmbedDataAndBuild(el);
            el.settings.initialized = true;
            // el.classList.add('lazyframe--loaded');
          }
          console.log(el.settings, "settings");
          if (el.settings.initinview) {
            console.log('I should click on ')
            console.log(el)
            el.click();
          }
          el.settings.onLoad.call(this, el);
        }
      })
    });

    if (typeof elements === 'string') {

      const nodeList = document.querySelectorAll(elements);
      console.log(nodeList, "nodelist");
      console.log(elements, "elements");
      nodeList.forEach(item => attachEventListeners(item));
      nodeList.forEach(item => frameObserver.observe(item));

    } else if (typeof elements === 'object') {

      elements.forEach(item => attachEventListeners(item));
      elements.forEach(item => frameObserver.observe(item));

    }

  }


  function attachEventListeners(el) {
    console.log(el, 'attachEventListeners');
    if (!(el instanceof HTMLElement) ||
      el.classList.contains('lazyframe--loaded')) return;

    el.addEventListener('click', () => {
      console.log('click');
      console.log(el.iframe);
      const iframe = el.querySelectorAll('iframe');
      // if (iframe) return;
      el.appendChild(el.iframe);
      el.settings.onAppend.call(this, iframe[0]);
    });

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
    console.log("useApi", settings.vendor);
    if (!settings.vendor) return false;
    return !settings.title || !settings.thumbnail;
  }

  function getEmbedDataAndBuild(lazyframe) {

    if (useApi(lazyframe.settings)) {
      queryNoembed(lazyframe, (err, data) => {
        if (err) return;

        const response = data[0];
        const _l = data[1];

        if (!_l.settings.title) {
          _l.settings.title = constants.response.title(response);
        }
        if (!_l.settings.thumbnail) {
          let url = constants.response.thumbnail(response);
          // console.log(url, "thumbnail url");
          // url = url.replace('hqdefault', 'maxresdefault');
          _l.settings.thumbnail = url;
          lazyframe.settings.onThumbnailLoad.call(this, url);
        }
        build(_l, true);

      });

    } else {
      build(lazyframe, true);
    }

  }

  function queryNoembed(lazyframe, cb) {

    const endpoint = constants.endpoint(lazyframe.settings);
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

  function build(lazyframe, loadImage) {
    console.log('build', lazyframe)
    lazyframe.iframe = createIframe(lazyframe.settings);
    console.log(lazyframe.iframe, "der iframe");

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

    // if (settings.lazyload === false) {
    // lazyframe.el.classList.add('lazyframe--loaded');
    // lazyframe.settings.onLoad.call(this, lazyframe);
    // elements.push(lazyframe);
    // }
    // if (settings.lazyload === true) {
    //   // lazyframe.el.classList.add('lazyframe--loaded');
    //   // lazyframe.settings.onLoad.call(this, lazyframe);
    //   elements.push(lazyframe);
    // }

    if (!lazyframe.settings.initialized) {
      elements.push(lazyframe);
    }

  }

  function createIframe(settings) {

    const docfrag = document.createDocumentFragment();
    const iframeNode = document.createElement('iframe');

    if (settings.vendor) {
      settings.src = constants.src[settings.vendor](settings);
    }

    iframeNode.setAttribute('id', `lazyframe-${settings.id}`);
    iframeNode.setAttribute('src', settings.src);
    iframeNode.setAttribute('frameborder', 0);
    iframeNode.setAttribute('allowfullscreen', '');

    if (settings.autoplay) {
      iframeNode.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    }

    docfrag.appendChild(iframeNode);
    return docfrag;

  }

  return init;

}

const lazyframe = Lazyframe();
window.lazyframe = Lazyframe();
export default lazyframe;
