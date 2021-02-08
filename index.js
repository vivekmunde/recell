'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/recell.production.js');
} else {
  module.exports = require('./dist/recell.development.js');
}
