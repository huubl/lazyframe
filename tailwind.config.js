module.exports = {
  theme: {
    // ...
  },
  // You have to disable the fontSize core
  // plugins otherwise it doesn't work
  corePlugins: {
    fontSize: false,
    // ...
  },
  plugins: [
    require('tailwindcss-fluid-type'),
    // ...
  ],
};
