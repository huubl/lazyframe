# LazyframeAdvanced

[comment]: <> ([![npm version]&#40;https://badge.fury.io/js/lazyframeAdvanced.svg&#41;]&#40;https://badge.fury.io/js/lazyframeAdvanced&#41;)

Dependency-free library for lazyloading iframes and embeds like YouTube, Vimeo, Twitter, Google Maps, Codepen etc.

Watch some examples here: [https://jmartsch.github.io/lazyframeAdvanced](https://jmartsch.github.io/lazyframeAdvanced)

## Why do you need it?

JavaScripts loaded from external providers like YouTube are big and slow down the loading time of your website, even if your visitors don't want to see your beautiful videos.
This also negatively impacts your ranking on Google

For example here are the number of requests and filesizes of some well-known services.

* **YouTube** – 11 requests ≈ 580kb
* **Google maps** – 52 requests ≈ 580kb
* **Vimeo** – 8 requests ≈ 145kb

LazyframeAdvanced creates a responsive placeholder for embedded content and requests it when the user interacts with it. This decreases the page load and idle time.

LazyframeAdvanced comes with brand-like themes for YouTube and other services.

### Why is it advanced?

The original [Lazyframe library](https://github.com/vb/lazyframe) from [Viktor Bergehall](https://github.com/vb) is good as it is.
But there are some things missing, that we needed, so we created our own deviation.

####What did we add or are we planning to add:

* move to a modern and fast build stack with vite
* added codepen as a vendor 
* remove vine, as it does not exist anymore 
* use IntersectionObserver instead of the old and slow scroll event listener
* add aspect ratios for the placeholders
* make it compatible with a cookie consent banner and only load the frame if consent for a specific vendor cookie is given

## Installation Instructions
1. [Install](#install)
2. [Import](#import)
3. [Initialize](#Initialize)
4. [Options](#options)
5. [Changelog](#changelog)
5. [Compile from Source](#compile-from-source)

### Install

NPM

```bash
npm install git+https://github.com/jmartsch/lazyframeAdvanced.git
```

### Import

JavaScript ES6 imports

```js
import lazyframe from 'lazyframeAdvanced';
```

Include the library directly

```html
<script src="dist/lazyframe.min.js"></script>
```

Sass import

```sass
@import 'src/scss/lazyframe';
```

Include css in html

```html
<link rel="stylesheet" href="dist/lazyframe.css">
```

### Initialize

```js
// Passing a selector
lazyframe('.lazyframe');

// Passing a nodelist
let elements = document.querySelectorAll('.lazyframe');
lazyframe(elements);

// Passing a jQuery object
let elements = $('.lazyframe');
lazyframe(elements);
```

## Options

You can pass general options to lazyframe on initialization. Element-specific options (most options) are set on data attributes on the element itself.

General options and corresponding defaults

```js
lazyframe(elements, {
   apikey: enterYourApiKeyHere,
   debounce: 250,
   lazyload: true,

   // Callbacks
   onLoad: (lazyframe) => console.log(lazyframe),
   onAppend: (iframe) => console.log(iframe),
   onThumbnailLoad: (img) => console.log(img)
})
```
## possible options

| option name | default value | description |
|---|---|---|
| apikey | string: empty | If you want to load a thumbnail and title for a YouTube video you'll have to have an API key with the YouTube data API library enabled. Get it from [here](https://console.developers.google.com/). _If you don't feel like getting a key, just use your own thumbnail and title in data-thumbnail and data-title attribute_
| lazyload | boolean: true | Set this to `false` if you want all API calls and local images to be loaded on page load (instead of when the element is in view).
| onLoad | function: empty | Callback function for when a element is initialized. 
| onAppend | function: empty | Callback function for when the iframe is appended to DOM. 
| onThumbnailLoad | function: empty | Callback function with the thumbnail URL. 


## Element-specific attributes

Use these attributes on your HTML element like this:

```html
<div
    class="lazyframe"
    data-vendor=""
    data-title=""
    data-thumbnail=""
    data-src=""
    data-ratio="1:1"
    data-initinview="false">
</div>
```

| attribute name | possible values | description |
|---|---|---|
| data-vendor | youtube, vimeo, codepen | Attribute for theming lazyframeAdvanced. Currently supported values are `youtube`, `youtube_nocookie` and `vimeo`
| data-title | string: anything you like | Attribute for custom title. Leave empty to get value from API 
| data-thumbnail | string: url | URL of the thumbnail image you would like to show, before the video is loaded 
| data-src | string: url | The source of what you want to lazyload
| data-ratio | string: url | The ratio of the lazyframe. Possible values: 16:9, 4:3, 1:1
| data-initinview | boolean: true | Set this to true if you want the resource to execute (for example video to play) when the element is in view.

## Changelog
* v1.1.901 betterify example page
* v1.1.9 remove gulp and rollup and use webpack instead
    * use Babel 7
    * add changelog to README
    * add Compile from source instructions
* v1.1.8 add rel=0 parameter to YouTube videos

## Compile from source
* clone the github repo
* cd into the cloned directory
* run `npm install`
* make your changes in the script or the scss file
  
##Development server with live reload

Use `npm run dev` to run a server with HMR. It uses vite https://vitejs.dev/ which includes the script as a JS module in modern browsers.

## License

[MIT](https://opensource.org/licenses/MIT). © 2021 Jens Martsch

[MIT](https://opensource.org/licenses/MIT). © 2016 Viktor Bergehall
