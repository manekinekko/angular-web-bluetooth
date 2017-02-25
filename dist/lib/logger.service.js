import { Injectable } from '@angular/core';
var ConsoleLoggerService = (function () {
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
    return ConsoleLoggerService;
}());
export { ConsoleLoggerService };
ConsoleLoggerService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ConsoleLoggerService.ctorParameters = function () { return []; };
var NoLoggerService = (function () {
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
    return NoLoggerService;
}());
export { NoLoggerService };
NoLoggerService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
NoLoggerService.ctorParameters = function () { return []; };
