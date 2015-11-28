/*!
 * Modules implementation (HMVC)
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 11/20/15
 */

"use strict";
// app registers application, and runs middlewares from app
// => register modules through middlewares
// => use lazy require of modules (via index.js?)
// automatically find index to mount it to "/"

// module directory consists of:
// controllers
// models
// templates
// client files ?
// try to load index => wrap router

// read module ((<<module>>)) => (wrapped index() => (wrapped router() => requires handler() => dispatch route)))

const
    fs = require("fs"),
    path = require("path"),
    Base = require("./teo.base"),
    _ = require("./teo.utils"),
    mountModule = require("../lib/moduleMounter");

module.exports = class Modules extends Base {
    constructor(config) {
        super(config);

        this.loadedModules = new Map();
        this.mountedModules = new Map();
    }

    applyConfig(obj) {
        this.config = obj.config;
    }

    * collect() {
        if (!this.config.get("name")) {     // means, core app
            return;
        }
        let modulesDirName = this.config.get("modulesDirName");
        // TODO: rename "name" to appName
        let modules = yield _.thunkify(fs.readdir)(path.join(this.config.get("appDir"), modulesDirName));
        let l = modules.length;

        for (var i = 0; i < l; i++) {
            let currentModuleDir = modules[i];
            yield* this.addModule(currentModuleDir, path.join(this.config.get("appDir"), modulesDirName, currentModuleDir));
        }
    }

    /**
     * Ads module to registry
     * @param {String} moduleName
     * @param {String} absoluteModulePath
     */
    * addModule(moduleName, absoluteModulePath) {
        let args = [];
        // index.js and router.js are mandatory files
        let index = fs.lstatSync(path.join(absoluteModulePath, "index.js"));
        let router = fs.lstatSync(path.join(absoluteModulePath, "router.js"));
        let modelFiles = [];

        args.push(moduleName);
        args.push(path.join(absoluteModulePath, "index.js"));

        if (router.isFile()) {
            args.push(path.join(absoluteModulePath, "router.js"));
        }

        try {
            modelFiles = fs.readdirSync(path.join(absoluteModulePath, "models"));
        } catch(e) {
            logger.error(e);
        }

        if (modelFiles.length > 0) {
            modelFiles = modelFiles.map((fileName) => {
                return path.join(absoluteModulePath, "models", fileName)
            });
            args.push(modelFiles);
        }

        this.loadedModules.set(moduleName, mountModule.apply(this, args));

    }

    mountModules(context) {
        this.loadedModules.forEach((moduleMounter, moduleName) => {
            this.mountModule(moduleMounter, moduleName, context);
        });
    }

    mountModule(moduleMounter, moduleName, context) {
        // it will init index (module entry point), and save main handler (router) to mounted registry
        this.mountedModules.set(moduleName, moduleMounter.call(context, context));
    }

    /**
     *
     * @param {Object} handlerContext :: context
     * @param {Object} router :: router instance
     * @param {Function} modelRegister :: registers new model
     */
    runMountedRouters(handlerContext, router, modelRegister) {
        this.mountedModules.forEach((moduleRouteHandler, moduleName) => {
            moduleRouteHandler.call(this, handlerContext, router.ns(`/${moduleName}`), modelRegister);    // pass namespaced router. E.g. /users
        });
    }

};