// == Imports ===============================================================

const net = require('net');
const EventEmitter = require('events');

const Chaos = require('./chaos');

// == Exported Classes ======================================================

class Server extends EventEmitter {
  constructor(options) {
    super();

    var _this = this;

    this.connections = { };

    this.listen = options.listen || 0;
    this.backlog = options.backlog || 5;

    this.host = options.host;
    this.port = options.port;

    this.refuse = options.refuse;
    this.kill = options.kill;

    this.chaos = new Chaos();

    this.chaos.on('listen', () => {
      _this.start();
    });

    this.chaos.on('close', (delay) => {
      _this.emit('chaos_close', delay);

      _this.stop();
    });

    this.chaos.on('kill', () => {
      _this.killRandomConnection();
    })
  }

  start() {
    if (this.server) {
      return;
    }

    var _this = this;

    this.server = net.createServer((conn) => {
      conn.ident = conn.remoteAddress + ':' + conn.remotePort;

      _this.emit('connect', conn);

      _this.connections[conn.ident] = conn;

      conn.on('error', (err) => {
        _this.emit('error', err);
      });

      conn.on('end', () => {
        delete _this.connections[conn.ident];

        _this.emit('close', conn);
      });

      conn.proxy = net.createConnection({
        host: _this.host,
        port: _this.port,
      });

      conn.proxy.on('connect', () => {
        conn.proxy.ident = conn.proxy.remoteAddress + ':' + conn.proxy.remotePort;
        _this.emit('piped', conn, conn.proxy);

        conn.pipe(conn.proxy);
        conn.proxy.pipe(conn);
      });

      conn.proxy.on('error', (err) => {
        _this.emit('error', err, 'proxy');

        conn.end();
      });
    });

    this.server.listen({
      port: this.listen,
      backlog: this.backlog
    });

    this.server.on('listening', (port) => {
      _this.emit('listening', _this.server.address().port);
    });

    this.server.on('error', (err) => {
      _this.emit('error', err);
    });
  }

  stop() {
    var _this = this;

    this.server.close(() => {
      _this.emit('closed');

      delete _this.server;
    });
  }

  randomConnection() {
    var keys = Object.keys(this.connections);

    if (!keys.length) {
      return;
    }

    return this.connections[keys[Math.floor(Math.random() * keys.length)]];
  }

  killRandomConnection() {
    var conn = this.randomConnection();

    if (!conn || conn.killed) {
      return;
    }

    conn.killed = true;
    this.emit('killed', conn);

    conn.end();
  }
};

// == Exports ===============================================================

module.exports = Server;
