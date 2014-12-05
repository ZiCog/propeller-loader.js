"use strict";

/*global Int8Array:   false,
         Array:       false,
         ArrayBuffer: false
*/


var SerialPort = require("serialport").SerialPort;
var hexy = require('hexy');

// TODO: We should not need this
function concat(a, b) {
    var c = new Array(),
        i;
    for (i = 0; i < a.length; i += 1) {
        c.push(a[i]);
    }
    for (i = 0; i < b.length; i += 1) {
        c.push(b[i]);
    }
    return new Int8Array(c);
}

function Propeller() {
    var inBuffer = new Int8Array([]),
        readCallBack,
        readLength = 0,
        readTimeout;

    var sp = new SerialPort("/dev/ttyUSB1", {

        baudrate: 115200
    }, false);


    this.open = function (openCallback) {
        sp.open(function (error) {
            if (error) {
                console.log("Failed to open serial port");
                openCallback(error);
            } else {
                console.log('open');

                sp.on('data', function (data) {
                    concat(inBuffer, data);
                    if (inBuffer.length >= readLength) {
                        if (readCallBack) {
                            var outBuffer = new Int8Array(inBuffer.subarray(0, readLength));
                            inBuffer = new Int8Array(inBuffer.subarray(readLength));
                            readCallBack(null, outBuffer);
                        }
                    }
                });
                openCallback(null);
            }
        });
    };

    this.close = function () {
        sp.close();
    };

    this.write = function (buffer) {
        console.log("**");
        console.log(hexy.hexy(new Buffer(buffer), {format : "twos", caps: "upper", annotate: "none"}));
        sp.write(buffer);
    };

    this.read = function (length, timeOut, callBack) {
        readCallBack = callBack;
        if (inBuffer.length >= length) {
            // We have data better return it through callback on next tick
            setTimeout(function () {
                var outBuffer = new Int8Array(inBuffer.subarray(0, length));
                inBuffer = new Int8Array(inBuffer.subarray(length));
                readCallBack(null, outBuffer);
            }, 1);
        } else {
            // No enough data yet
            readTimeout = setTimeout(function () {
                readCallBack("Serial time out");
            }, timeOut);
        }
    };

    this.flush = function (callback) {
        sp.flush(callback);
        // TODO: Also empty inBuffer.
    };
}

exports.Propeller = Propeller;


