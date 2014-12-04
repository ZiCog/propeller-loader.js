"use strict";

/*global Int8Array:   false,
         Array:       false,
         ArrayBuffer: false
*/


var SerialPort = require("serialport").SerialPort;

function Propeller() {
    var inBuffer = new Int8Array([0, 1, 2, 3, 4]),
        readCallBack,
        readLength = 0,
        readTimeout;

    var sp = new SerialPort("/dev/ttyUSB0", {
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

    this.write = function (buffer) {
        console.log(buffer);
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
