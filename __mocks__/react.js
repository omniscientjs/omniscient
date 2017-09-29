const react = require('react');
global.window = global;
window.addEventListener = () => {};
window.requestAnimationFrame = cb => {
  setTimeout(cb, 0);
};

module.exports = react;
