// == Imports ===============================================================

const EventEmitter = require('events');

const roll = require('./threshold').roll;

// == Exported Classes ======================================================

class Chaos extends EventEmitter {
  constructor(options) {
    super();

    var _this = this;

    this.timer = setInterval(() => {
      _this.tick();
    }, options && options.interval || 100);
  }

  tick() {
    var _this = this;

    if (roll(100) && !this.closed) {
      this.closed = true;

      var delay = Math.floor((Math.random() * 14.5 + 0.5) * 1000);

      this.emit('close', delay);

      setTimeout(() => {
        _this.emit('listen');
      }, delay);
    }

    if (roll(500)) {
      this.emit('kill');
    }
  }
}

// == Exports ===============================================================

module.exports = Chaos;
