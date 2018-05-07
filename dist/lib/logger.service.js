import { Injectable } from '@angular/core';
var ConsoleLoggerService = /** @class */ (function () {
    function ConsoleLoggerService() {
    }
    ConsoleLoggerService.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    };
    ConsoleLoggerService.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, args);
    };
    ConsoleLoggerService.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn.apply(console, args);
    };
    ConsoleLoggerService.decorators = [
        { type: Injectable },
    ];
    return ConsoleLoggerService;
}());
export { ConsoleLoggerService };
var NoLoggerService = /** @class */ (function () {
    function NoLoggerService() {
    }
    NoLoggerService.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    NoLoggerService.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    NoLoggerService.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    NoLoggerService.decorators = [
        { type: Injectable },
    ];
    return NoLoggerService;
}());
export { NoLoggerService };
