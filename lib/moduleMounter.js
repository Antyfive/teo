/*!
 * Module mounter lib.
 * Wraps each module for lazy loading
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 11/21/15
 */

"use strict";

module.exports = function(_moduleName, indexFileAbsPath, routerFilePath, modelFiles) {  // on module register

    return function moduleMounter(context) {   // run on app init, app's context
        let wrappedRouter = function noop() {};

        // initialize index.js of the particular module
        require("./handlerMounter")(indexFileAbsPath)(context); // init index.js of module

        // router
        if (routerFilePath) {
            wrappedRouter = require("./handlerMounter")(routerFilePath);   // mount router and return it, expects router as argument
        }

        // models
        if (modelFiles && Array.isArray(modelFiles)) {
            modelFiles = modelFiles.map(absPathToModel => require("./handlerMounter")(absPathToModel));
        }

        return function mount(context) {    // context, router, dbclient
            wrappedRouter.apply(this, [].slice.call(arguments));

            if (modelFiles.length > 0) {
                let modelRegister = arguments[2];
                modelRegister && _applyModels(modelRegister, modelFiles);
            }
        }
    };

    function _applyModels(modelRegister, modelsToAdd) {
        modelsToAdd.forEach((wrappedModel) => {
            modelRegister(wrappedModel());  // wrapped model returns model Object
        });
    }
};