const pagesConfig = require("./src/entry/pages.config.js");

module.exports = {
  devServer: {
    port: 3000,
    historyApiFallback: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  },
  pages: pagesConfig,

};