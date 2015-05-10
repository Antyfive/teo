/*!
 * App extensions spec
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 5/7/15
 */
/* global define, describe, beforeEach, afterEach, it, assert, sinon, teoBase  */

var AppModules = require(teoBase + '/teo.app.extensions');

describe("Testing Teo.js App Extensions", function () {

    var extensions,
        extension = function() {
            return {
                // is used in app config with this namespace
                configNamespace: "my-module-config",
                // module's config
                config: {
                    "myParam": "1"
                },
                install: function(app) {
                    app.middleware(function(req, res, next) {
                        req.setHeader("X-Powered-By", "Teo.js");
                        next();
                    });
                }
            }
        };

    beforeEach(function () {

        extensions = new AppModules({
            filePath: "/extensions"
            /*extensions: [
                {
                    "name": "my-extension-1",
                    "module": "my-module-name-1"
                },
                {
                    "name": "my-extension-2",
                    "file": "my-module-name-2"
                }
            ]*/
        });

    });

    afterEach(function () {

        extensions = null;

    });

    it("Should parse passed config on init", function() {

        assert.equal(extensions.filePath, "/extensions", "File path should be set");

    });

    it("Should resolve passed extensions on initialization", function() {

        var addStub = sinon.stub(extensions, "add", function() {});

        extensions.initialize({
            extensions: [
                {
                    "name": "my-extension-1",
                    "module": "my-module-name-1"
                },
                {
                    "name": "my-extension-2",
                    "file": "my-module-name-2"
                }
            ]
        });


        assert.isTrue(addStub.calledOnce, "Extensions should be added");
        assert.deepEqual(addStub.args[0][0], [
            {
                "name": "my-extension-1",
                "module": "my-module-name-1"
            },
            {
                "name": "my-extension-2",
                "file": "my-module-name-2"
            }
        ], "Arguments should be correct");


        addStub.restore();

    });

    it("Should throw error on adding extension with not correct config", function() {

        assert.throw(function() {
            extensions.add();
        }, "Extension config should be an object");

        assert.throw(function() {
            extensions.add({});
        }, "Extension config should have 'module' or 'file' property");

        assert.throw(function() {
            extensions.add({file: "aaa"});
        }, "Extension config should have 'name' property");

    });

    it("Should throw error on resolving of extension", function() {

        var resolveSpy = sinon.spy(extensions, "_resolveExtension");

        var add = function() {
            extensions.add({
                "name": "my-extension-1",
                "module": "my-module-name-1"
            });
        };

        assert.throw(add, "Cannot find module 'my-module-name-1'");
        assert.isTrue(resolveSpy.calledOnce, "Resolve method should be called");

        resolveSpy.restore();

    });

    it("Should resolve extension and add it to registry", function() {

        var requireStub = sinon.stub(extensions, "__requireExtension");

        requireStub.withArgs("my-module-name-1").returns({
            // is used in app config with this namespace
            configNamespace: "my-module-config",
            // module's config
            config: {
                "myParam": "1"
            }
        });

        var resolveSpy = sinon.spy(extensions, "_resolveExtension");

        extensions.add({
            "name": "my-extension-1",
            "module": "my-module-name-1"
        });

        assert.isTrue(resolveSpy.calledOnce, "Resolve method should be called");
        assert.isTrue(requireStub.calledOnce, "Extension should be loaded");
        assert.equal(requireStub.args[0][0], "my-module-name-1", "Extension should be loaded");
        assert.deepEqual({
            // is used in app config with this namespace
            configNamespace: "my-module-config",
            // module's config
            config: {
                "myParam": "1"
            }
        }, extensions._extensionsRegistry["my-extension-1"], "Extensions registry should be updated");

        resolveSpy.restore();

    });

});