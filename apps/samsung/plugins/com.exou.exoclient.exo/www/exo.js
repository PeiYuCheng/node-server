/**
 * Cordova plugin for Exo commands
 *
 * @module exo
 */

cordova.define("com.exou.exoclient.exo.exo", function(require, exports, module) {
var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec');

/**
 * Exo Object
 *
 * @class exo
 */
function Exo() {
    function cordovaExecTemplate(command, arguments, callback) {
        exec(function(result){
            result.success = 1;
            callback && callback(result);
        },function(result){
            result.success = 0;
            callback && callback(result);
        }, "Exo", command, arguments);
    };

    this.samsungapi = {};
    this.samsungapi.session = {};
    this.samsungapi.device = {};
    this.samsungapi.device.hardwarekey = {};
    this.samsungapi.device.screen = {};
    this.samsungapi.device.statusbar = {};
    this.samsungapi.screenshot = {};

    this.samsungapi.session.create = function(sessionname, userid, username, callback) {
        cordovaExecTemplate("samsungapi.session.create", [sessionname, userid, username], callback);
    };

    this.samsungapi.session.join = function(sessionname, userid, username, callback) {
        cordovaExecTemplate("samsungapi.session.join", [sessionname, userid, username], callback);
    };

    this.samsungapi.session.stop = function(callback) {
        cordovaExecTemplate("samsungapi.session.stop", [], callback);
    };

    this.samsungapi.device.hardwarekey.lock = function(callback) {
        cordovaExecTemplate("samsungapi.device.hardwarekey.lock", [], callback);
    };

    this.samsungapi.device.hardwarekey.unlock = function(callback) {
        cordovaExecTemplate("samsungapi.device.hardwarekey.unlock", [], callback);
    };

    this.samsungapi.device.screen.lock = function(callback) {
        cordovaExecTemplate("samsungapi.device.screen.lock", [], callback);
    };

    this.samsungapi.device.screen.unlock = function(callback) {
        cordovaExecTemplate("samsungapi.device.screen.unlock", [], callback);
    };

    this.samsungapi.device.statusbar.lock = function(callback) {
        cordovaExecTemplate("samsungapi.device.statusbar.lock", [], callback);
    };

    this.samsungapi.device.statusbar.unlock = function(callback) {
        cordovaExecTemplate("samsungapi.device.statusbar.unlock", [], callback);
    };

    this.samsungapi.screenshot.getUserScreenshot = function(userid, callback) {
        cordovaExecTemplate("samsungapi.screenshot.getUserScreenshot", [userid], callback);
    };
}

module.exports = new Exo();
});
