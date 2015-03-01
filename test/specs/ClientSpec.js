/*!
 * Client spec
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 9/7/14
 * TODO: new client spec required
 */

/* global define, describe, beforeEach, afterEach, it, assert, sinon, teoBase  */

var App = require(teoBase + '/teo.app');
var Client = require(teoBase + '/teo.client');
var supertest = require("supertest");
var Csrf = require(teoBase + "/teo.client.session.csrf");
var Cookies = require("cookies");

/*
describe('Testing Client', function() {
    var app,
        appDir = process.cwd().replace( /\\/g, '/') + '/apps/test',
        params = {
            'appsDir': '../' + appDir,
            'confDir': appDir + '/config',
            'dir': appDir,
            'mode': 'development'
        },
        client,
        assertIsRoute = function(addSpy, route) {
          assert.equal(route instanceof Object, true, "Route should be an object");
          assert.equal(addSpy.calledOnce, true, "Add route method should be called");
        };

    beforeEach(function(done) {
        app = new App(params, function() {    // TODO: app as a mock
          client = new Client({app: app});
          done();
        });
    });

    afterEach(function() {
        app = null;
        client = null;
    });

    it('Should create client', function() {
        assert.equal(client instanceof Client, true, 'Client should be created');
    });

    it('Should add GET type route', function() {
        var addRouteSpy = sinon.spy(client, "addRoute"),
            route = client.get('/test/:id', function() {});
        assertIsRoute(addRouteSpy, route);
    });

    it('Should add POST type route', function() {
        var addRouteSpy = sinon.spy(client, "addRoute"),
            route = client.post('/test/:id', function() {});
        assertIsRoute(addRouteSpy, route);
    });

    it('Should add PUT type route', function() {
        var addRouteSpy = sinon.spy(client, "addRoute"),
            route = client.put('/test/:id', function() {});
        assertIsRoute(addRouteSpy, route);
    });

    it('Should add PATCH type route', function() {
        var addRouteSpy = sinon.spy(client, "addRoute"),
            route = client.patch('/test/:id', function() {});
        assertIsRoute(addRouteSpy, route);
    });

    it('Should add DELETE type route', function() {
        var addRouteSpy = sinon.spy(client, "addRoute"),
            route = client.delete('/test/:id', function() {});
        assertIsRoute(addRouteSpy, route);
    });

    it('Should not overwrite already added route', function() {
      var addRouteSpy = sinon.spy(client, "addRoute"),
          route = client.get('/test/:id', function() {}),
          route2 = client.get('/test/:id', function() {});

        assert.equal(route instanceof Object, true, "Route should be an object");
        assert.equal(route2 === false, true, "The same route should not be added again");
    });

    it('Should match added route', function() {
        var route = client.get('/test/:id', function(){}),
            match = client.matchRoute('get', '/test/1');

        assert.equal(match.params.id, "1", "Should have params parsed from route");
        assert.equal(match.route, "/test/:id", "Should have the same route");
    });

    it('Should add namespace for the route', function() {
        client.addNamespace( '/index', [ '/', '/:id']);
        assert.equal(client.namespaces['/index'] instanceof Array, true, "Namespace routes holder should be an array");
    });

    it('Should get namespace by route', function() {
        client.addNamespace( '/index', [ '/', '/:id']);
        var route1 = client.getNamespace('/');
        var route2 = client.getNamespace('/:id');

        assert.equal((route1 === "/index"), true, "Namespace should be found");
        assert.equal((route2 === "/index"), true, "Namespace should be found");
    });
});
*/

describe("Testing Client Factory", function() {
    var app,
        appDir = process.cwd().replace( /\\/g, '/') + '/apps/test',
        params = {
            'appsDir': '../' + appDir,
            'confDir': appDir + '/config',
            'dir': appDir,
            'mode': 'development'
        },
        client, req, res, agent, dispatchStub, clientFactory;

    beforeEach(function(done) {
        var callback = function() {
            app.initServer();
            app.server.on("listening", function() {
                app.client.routes.get("/test/route", function(_req, _res) {
                    req = _req;
                    res = _res;

                    dispatchStub = sinon.stub(app.client.Factory.prototype, "dispatch", function() {});
                    clientFactory = new app.client.Factory({req: req, res: res});

                    done();

                });
                agent = supertest.agent(app.server);
                agent
                    .get('/test/route')
                    .expect(200)
                    .end(function() {});
            });

            app.listenServer();
        };
        app = new App(params, callback);
    });

    afterEach(function(done) {

        app.stop(function() {
            res.end('okay');

            dispatchStub.restore();

            app = client = req = res = agent = null;

            done();
        });

    });

    it('Should mixin request object', function() {

        assert.isTrue(clientFactory.req.csrf instanceof Csrf, "Csrf mixin should be inside req object");
        assert.isTrue(clientFactory.req.cookie instanceof Cookies, "Cookie mixin should be inside req object");

    });
});