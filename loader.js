"use strict";

/*global Int8Array:   false,
         Array:       false,
         ArrayBuffer: false
*/
var argv = require('minimist')(process.argv.slice(2));

function usage() {
    console.log('usage: propeller-load [option]... file');
    console.log('    [-p --port]      serial port');
    console.log('    [-e, --eeprom]   write the program into EEPROM');
    console.log('    [-r, --run]      run the program after loading');
    console.log('    [-v, --verbose]  verbose output');
    console.log('    [--version]      print version and exit');
    console.log('    [-S]             slow down the loader by adding 5 microseconds delay');
    console.log('    [-S<n>]          slow down the loader by adding <n> microseconds delay');
    console.log('    [-h, --help, -?] display a usage message and exit');
}

function version() {
    console.log('Version 0.0.00001');
}

var options = {
    port:     undefined,
    eeprom:   false,
    run:      false,
    slow:     0,
    verbose:  false,
};

if (argv.h || argv.help || argv['?']) {
    usage();
    process.exit(0);
}

if (argv.version) {
    version();
    process.exit(0);
}

if (argv.p || argv.port) {
    options.port = argv.p || argv.port;
} else {
    usage();
    process.exit(0);
}

if (argv.e || argv.eeprom) {
    options.eeprom = argv.p || argv.eeprom;
}

if (argv.v || argv.verbose) {
    version();
    options.verbose =  true;
}

if (argv.S === true) {
    options.slow = 5;
} else if (argv.S) {
    options = parseInt(argv.S, 10);
}


console.log(options);


