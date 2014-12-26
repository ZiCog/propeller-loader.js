"use strict";

/*global Int8Array:   false,
         Array:       false,
         ArrayBuffer: false
*/

var propeller = require("./propeller");

var prop = new propeller.Propeller({
//    port:     "/dev/ttyUSB0",
    port:     "/dev/ttyS0",
    baudrate: "115200",
    resetPin: 17
});

var testBinary = new Buffer([
    0x00, 0x1b, 0xb7, 0x00, 0x00, 0xe8, 0x10, 0x00, 0x1c, 0x00, 0x24, 0x00, 0x18, 0x00, 0x28, 0x00,
    0x0c, 0x00, 0x02, 0x00, 0x08, 0x00, 0x00, 0x00, 0x04, 0x7e, 0x32, 0x00
]);

prop.open(function (error) {
    if (error) {
        console.log("Failed to open propeller port.");
    } else {
        hwFind(function (err, data) {
//        readTest(function (err, data) {
            if (err) {
                console.log("No propeller found.");
            } else {
                console.log("Propeller found:", data);
            }
            console.log("************************ LOADING *****************************");
            upload(testBinary, 1);
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


function writeByte(byte) {
    var buffer = new ArrayBuffer(1),
        bytes = new Int8Array(buffer);
    bytes[0] = byte;
    prop.write(bytes);
}

function writeMagicLsfr() {
    var buffer = new ArrayBuffer(250),
        bytes = new Int8Array(buffer),
        n;
    for (n = 0; n < 250; n += 1) {
        /*jslint bitwise: true */
        bytes[n] = iterateLfsr() | 0xfe;
        /*jslint bitwise: false */
    }
    prop.write(bytes);
}

function writeF9s() {
    var buffer = new ArrayBuffer(258),
        bytes = new Int8Array(buffer),
        n;

    for (n = 0; n < 258; n += 1) {
        bytes[n] = 0xF9;
    }
    prop.write(bytes);
}

function hwFind(callback) {
    LFSR = 0x50;   // 'P' is for Propeller :)

    // First byte is calibration pulse
    writeByte(0xf9);

    // Send the magic propeller LFSR byte stream.
    writeMagicLsfr();

    prop.flush(function () {});

    // Send 258 0xF9 bytes for LFSR and Version ID
    // These bytes clock the LSFR bits and ID from propeller back to us.
    writeF9s();

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

function writeLong(long) {
    var buffer = new ArrayBuffer(11),
        buff = new Int8Array(buffer),
        n;

    /*jslint bitwise: true */
    for (n = 0; n < 10; n += 1) {
        buff[n] = (0x92 | (long & 1) | ((long & 2) << 2) | ((long & 4) << 4));
        long >>= 3;
    }
    buff[n] = (0xf2 | (long & 1) | ((long & 2) << 2));
    /*jslint bitwise: false */
    prop.write(buff);
    // TODO: We may need the delayed byte writes here.
}

function getAck(callback) {
    var retryCount = 100;
    (function requestAck() {
        // Need to send this to make Propeller send the ack
        writeByte(0xF9);
        console.log("Waiting on ack...");
        retryCount -= 1;
        prop.read(1, 20, function (err, data) {
            if (err) {
                if (retryCount) {
                    requestAck(callback);
                } else {
                    callback("No ack.");
                }
            } else {
                /*jslint bitwise: true */
                if ((data[0] & 1) === 0) {
                    if (retryCount) {
                        requestAck(callback);
                    }
                } else {
                    callback(null);
                }
                /*jslint bitwise: false */
            }
        });
    }());
}

function upload(buffer, type) {
    var bytes = new Int8Array(buffer),
        n;

    // Send type
    console.log("sendlong: type:", type);
    writeLong(type);

    // Send count
    console.log("sendlong: longcount:", bytes.length / 4);
    writeLong(bytes.length / 4);

    for (n = 0; n < buffer.length; n += 4) {
        /*jslint bitwise: true */
        writeLong(buffer[n] | (buffer[n + 1] << 8) | (buffer[n + 2] << 16) | (buffer[n + 3] << 24));
        /*jslint bitwise: false */
    }

    // Give propeller time to calculate checksum match 32K/12M sec = 32ms
    setTimeout(function () {
        getAck(function (err) {
            if (err) {
                console.log("Ack failed");
            } else {
                console.log("Ack OK");
            }
        });
    }, 50);
}

function readTest() {
    prop.read(1, 1000, function (err, data) {
        if (err) {
            console.log("Got err  = ", err);
            prop.close();
        } else {
            console.log("Got data = ", data[0]);
            readTest();
        }
    });
}




