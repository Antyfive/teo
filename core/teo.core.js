/*!
 * Teo.js core
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date {13.03.14}
 */

/* global logger */

var fs = require("fs"),
    async = require("async"),
    Compressor = require("./teo.compressor"),
    util = require("./teo.utils"),
    Base = require("./teo.base"),
    App = require("./teo.app"),
    Path = require("path"),
    cluster = require("cluster");

var Core = Base.extend({
    apps: {},

    initialize: function(params, callback) {
        util.extend(this, params);
        this.bindProcessEvents();
        // mixture first core's app
        this._app = this.mixtureApp({
            dir: this.appsDir,
            confDir: Path.normalize(__dirname + "/../config"),
            mode: this.mode,
            coreApp: true
        });

        this._app.once("app:ready", function() {
            this.config = this._app.config;

            if (this.config.get("cluster").enabled) {
                this.setupWorkersLogging();
            }
            this.loadApps(function(err) {
                callback.call(this, err, this);
            }.bind(this));
        }.bind(this));
    },

    mixtureApp: function(options) {
        return new App(options);
    },

    /**
     * Load apps
     * @param {Function }callback
     */
    loadApps: function(callback) {
        var self = this,
            appsDir = this.appsDir;

        fs.readdir(appsDir, function(err, apps) {
            if (err) {
                logger.error(err);
                callback(err);
                return;
            }

            var functs = util.map(apps, function(appName) {
                return async.apply(function(app, next) {
                    var appDir = appsDir + "/" + app,
                        stat = fs.lstatSync(appDir);

                    if (stat.isDirectory()) {
                        self.registerApp(app, next);
                    }
                    else {
                        next();
                    }
                }, appName);
            });

            async.series(functs, callback);
        });
    },

    registerApp: function(appName, callback) {
        var appDir = this.appsDir + '/' + appName,
            application,
            apps = this.apps;

        application = this.mixtureApp({
            dir: appDir,
            confDir: appDir + "/config",
            name: appName,
            mode: this.mode,
            config: this._app.config
        });

        application.once("app:ready", function(app) {
            apps[appName] = app;
            callback(app);
        });

        application.on("error", function(err) {
            this.exitHandler({exit: true}, err);
        }.bind(this));
    },

    /**
     * Starts application
     * @param {String} [name] :: application name
     * @param {Function} [callback]
     * It can be used in two cases:
     * 1. Start all apps, if no name passed
     * 2. Start single application by passed name
     */
    start: function(name, callback) {

        if (util.isString(name)) {
            var name = name,
                callback = (typeof callback === "function") ? callback : function(){};
        }

        if (util.isFunction(name)) {    // start(callback)
            var callback = name,
                name = undefined;
        }

        if (!util.isUndefined(name)) {
            var app = this.getApp(name);
            app.start(function() {
                callback(null, app)
            });
        }

        else {
            var functs = [];
            util.each(this.apps, function(app) {
                // functs.push(app.start.bind(app));
                functs.push(function(next) {
                    app.start(next);
                });
            });

            async.series(functs, callback);
        }
    },

    stop: function(done) {
        var functs = [];
        util.forEach(this.apps, function(app) {
            functs.push(function(next) {
                app.stop(next);
            })
        });
        functs.push(function(next) {
            this._app.stop(next);
        }.bind(this));

        async.series(functs, function(err) {
            done && done(err);
            this.exitHandler({cleanup: true});
        }.bind(this));
    },

    restart: function() {   // TODO

    },
    // getters  ----
    getApps: function() {
        return this.apps;
    },
    /**
     * Get app it's by name
     * @param {String} name
     * @returns {*}
     */
    getApp: function(name) {
        return this.apps[name];
    },
    // TODO: move to the separate module
    bindProcessEvents: function() {
        // Kill off the process
        process.on("message", function(msg) {
            if (msg.cmd && msg.cmd == "kill") {
                process.exit();
            }
        });
        // do something when app is closing
        process.on("exit", this.exitHandler.bind(null,{cleanup:true}));
        // catches ctrl+c event
        process.on("SIGINT", this.exitHandler.bind(null, {exit:true}));
        // catches uncaught exceptions
        process.on("uncaughtException", this.exitHandler.bind(null, {exit:true}));
    },

    exitHandler: function(options, err) {
        if (options.cleanup) {  // TODO: cleanup
            logger.info("cleanup");
        }
        if (err) {
            logger.error(err);
        }
        if (options.exit) {
            logger.info("Closing Teo.js");
            process.exit(err ? 1 : 0);
        }
    },

    setupWorkersLogging: function() {
        if (cluster.isMaster) {
            cluster.on("online", function (worker) {
                worker.on("message", function (msg) {
                    if (msg.type === "logging") {
                        var message = "WorkerID: " + msg.data.workerID + " | " + msg.data.message;
                        logger.log(message);
                    }
                });
            });
        }
    }
});

exports = module.exports = Core;