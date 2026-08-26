// No-op stand-in for the deprecated `intersection-observer` polyfill.
// The real package installs window.IntersectionObserver when it is missing;
// every environment ReactLab runs in (Vite dev server, packaged Electron shell)
// has had it natively since Chromium 51. Importing nothing keeps ~9KB of dead
// polyfill out of the production bundle and keeps `npm i` free of the upstream
// deprecation notice. See the `overrides` block in the root package.json.
module.exports = {};
