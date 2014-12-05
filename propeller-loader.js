"use strict";

/*global Int8Array:   false,
         Array:       false,
         ArrayBuffer: false
*/

var propeller = require("./propeller");
var prop = new propeller.Propeller();

prop.open(function (error) {
    if (error) {
        console.log("Failed to open propeller port.");
    } else {
//        hwFind(function (err, data) {
        readTest(function (err, data) {
            if (err) {
                console.log("No propeller found.");
            } else {
                console.log("Propeller found:", data);
            }
        });
    }
});

var LFSR;

function iterateLfsr() {
    /*jslint bitwise: true */
    var bit = LFSR & 1;
    LFSR = ((LFSR << 1) | (((LFSR >> 7) ^ (LFSR >> 5) ^ (LFSR >> 4) ^ (LFSR >> 1)) & 1)) & 0xff;
    /*jslint bitwise: false */
    return bit;
}

function createMagicLsfrBuffer() {
    var buffer = new ArrayBuffer(251),
        int8View = new Int8Array(buffer),
        n;

    // First byte is calibration pulse
    int8View[0] = 0xF9;

    for (n = 1; n < 251; n += 1) {
        /*jslint bitwise: true */
        int8View[n] = iterateLfsr() | 0xfe;
        /*jslint bitwise: false */
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
    LFSR = 0x50;   // 'P' is for Propeller :)

    // Send the magic propeller LFSR byte stream.
    prop.write(createMagicLsfrBuffer());

    prop.flush(function () {});
    
    // Send 258 0xF9 bytes for LFSR and Version ID
    // These bytes clock the LSFR bits and ID from propeller back to us.
    prop.write(createF9Buffer());

    console.log("Reading Propeller response...");
    prop.read(258, 5000, function (err, data) {
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

function makelong(data) {
    var buffer = new ArrayBuffer(11),
        buff = new Int8Array(buffer),
        n;

    /*jslint bitwise: true */
    for (n = 0; n < 10; n += 1) {
        buff[n] = (0x92 | (data & 1) | ((data & 2) << 2) | ((data & 4) << 4));
        data >>= 3;
    }
    buff[n] = (0xf2 | (data & 1) | ((data & 2) << 2));
    /*jslint bitwise: false */
    return buff;
}

function sendlong(data) {
    prop.write(makelong(data));
    // TODO: We may need the delayed byte writes here.
}

function upload(buffer, type) {
    var n;

    // Send type
    sendlong(type);

    // Send count
    sendlong(buffer.length / 4);

    for (n = 0; n < buffer.length; n += 4) {
        /*jslint bitwise: true */
        sendlong(buffer[n] | (buffer[n + 1] << 8) | (buffer[n + 2] << 16) | (buffer[n + 3] << 24));
        /*jslint bitwise: false */
    }
}

function readTest() {
    prop.read(1, 1000, function (err, data) {
        if (err) {
            console.log("Got err  = ", err);
            prop.close();
        } else {
            console.log("Got data = ", data);
            readTest();
        }
    });
}




