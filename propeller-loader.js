"use strict";

var SerialPort = require("serialport").SerialPort;

var sp = new SerialPort("/dev/ttyUSB1", {
    baudrate: 115200
});

var inBuffer = new Int8Array([]);

var readCallBack;
var readLength;
var readTimeout;

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


var LFSR;

function iterateLfsr() {
    var bit = LFSR & 1;
    LFSR = ((LFSR << 1) | (((LFSR >> 7) ^ (LFSR >> 5) ^ (LFSR >> 4) ^ (LFSR >> 1)) & 1)) & 0xff;
    return bit;
}

function createMagicLsfrBuffer() {
    var buffer = new ArrayBuffer(251),
        int8View = new Int8Array(buffer),
        n;

    // First byte is calibration pulse
    int8View[0] = 0xF9;

    for (n = 1; n < 251; n += 1) {
        int8View[n] = iterateLfsr() | 0xfe;
    }
    return int8View;
}

function createF9Buffer() {
    var buffer = new ArrayBuffer(258),
        int8View = new Int8Array(buffer),
        n;

    for (n = 0; n < 258; n += 1) {
        int8View[n] = 0xF9;
    }
    return int8View;
}

function hwFind(callback) {
    LFSR = 'P';  // P is for Propeller :)

    // Send the magic propeller LFSR byte stream.
    sp.write(createMagicLsfrBuffer());

    sp.flush(function () {});
    // TODO: Also empty inBuffer.

    // Send 258 0xF9 bytes for LFSR and Version ID
    // These bytes clock the LSFR bits and ID from propeller back to us.
    sp.write(createF9Buffer());

    console.log("Reading Propeller response...");
    sp.read(258, 5000, function (err, data) {
        var ii;
        if (err) {
            console.log("Timeout/error waiting for response. Propeller not found");
            callback(err, null);
        } else {
            ii = data[0];
            console.log("Got data");

            // TODO: Check 250 returned LFSR bits
            // TODO: Extract Propeller version
        }
    });
}

sp.on("open", function () {
    console.log('open');

    sp.on('data', function (data) {
        concat(inBuffer, data);
        if (inBuffer.length >= readLength) {
            if (readCallBack) {
                var outBuffer = new Int8Array (inBuffer.subarray(0, readLength));
                inBuffer = new Int8Array (inBuffer.subarray(readLength));
                readCallBack(null, outBuffer);
            }
        }
    });

    hwFind();
});

function onTimeOut() {
    readCallBack("Serial time out", null);
}

sp.read = function (length, timeOut, callBack) {
    if (inBuffer.length >= length) {
        // We have data better return it through callback on next tick
        setTimeout(function () {
            var outBuffer = new Int8Array(inBuffer.subarray(0, length));
            inBuffer = new Int8Array(inBuffer.subarray(length));
            callBack(null, outBuffer);
        }, 1);
    } else {
        // No enough data yet
        readCallBack = callBack;
        readTimeout = setTimeout(onTimeOut, timeOut);
    }
};


function readTest() {
    sp.read(1, 1000, function (err, data) {
        console.log("Got err  = ", err);
        console.log("Got data = ", data);
        readTest();
    });
}

//readTest();



