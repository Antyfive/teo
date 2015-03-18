/*!
 * Logger tests
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 3/12/15
 */
/* global define, describe, beforeEach, afterEach, it, assert, sinon, teoBase  */

var logger = require(teoBase + "/teo.logger");
var util = require("util");

describe("Testing Logger", function() {

    var formatSpy,
        consoleLogStub,
        message = "my message";

    beforeEach(function() {

        formatSpy = sinon.spy(util, "format");
        consoleLogStub = sinon.stub(console, "log", function(message) {
            return message;
        });

    });

    afterEach(function() {

        formatSpy.restore();
        consoleLogStub.restore();

    });

    it("Should log success message", function() {

        logger.success(message);

        assert.deepEqual(formatSpy.args[0], ["Success: %s", message], "Message should be formatted correctly");

    });

    it("Should log info message", function() {

        logger.info(message);

        assert.deepEqual(formatSpy.args[0], ["Info: %s", message], "Message should be formatted correctly");

    });

    it("Should log warn message", function() {

        logger.warn(message);

        assert.deepEqual(formatSpy.args[0], ["Warn: %s", message], "Message should be formatted correctly");

    });

    it("Should log error message", function() {

        logger.error(message);

        assert.deepEqual(formatSpy.args[0], ["Error: %s", message], "Message should be formatted correctly");

    });

    it("Should log fatal error message", function() {

        logger.fatal(message);

        assert.deepEqual(formatSpy.args[0], ["Fatal Error: %s", message], "Message should be formatted correctly");

    });

    it("Should format final message correctly", function() {

        logger.success(message);

        assert.equal(formatSpy.args[1][0], "[%s] %s", "Format of final message should be correct");
        assert.equal(formatSpy.args[1][2], "Success: " + message, "Message should be formatted correctly");

    });

    it("Should log multiple messages in arguments", function() {

        logger.success("One", "two");

        assert.equal(formatSpy.args[1][2], "Success: One|two", "Message should be formatted correctly");

    });

    it("Should just log message", function() {
        logger.log("One", "two");
        assert.equal(formatSpy.args[1][2], "One|two", "Message should be formatted correctly");
    });

});