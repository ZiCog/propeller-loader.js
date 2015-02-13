propeller-loader.js
-------------------

propeller-loader.js is a program loader for the Parallax Inc. Propeller 32 bit
multi-core micro-controller.

Programming a Propeller requires a serial connection so this loader is only usable
from node.js or from within a Chrome App. 

Status
------

JUST STARTING NOT FUNCTIONAL YET.

Install
-------

Only tested on a Raspberry Pi. It should be possible to run this on other machines that support /sys/class/gpio

1) Install node.js and test it works

    $ wget http://node-arm.herokuapp.com/node_latest_armhf.deb
    $ sudo dpkg -i node_latest_armhf.deb
    $ node -v

2) Fetch propeller-loader.js and install its dependencies

    $ git clone https://github.com/ZiCog/propeller-loader.js.git
    $ cd propeller-loader.js
    $ npm install
    
3) Stop raspbian using /dev/ttyAM0 as the console port by removing and commenting out use of ttyAM0 in the following:

    $ sudo nano /boot/cmdline.txt
    $ sudo nano /etc/inittab
   
Then reboot the Pi.

4) Run propeller-loader

    $ node propeller-loader.js
    
Excuse all the debug messages.



Some details:
-------------

1) The PLoadLib directory contains the orgnal C code of the loader from prop-gcc. It has been hacked around with debug printf so we can compare what it sends/receives over the serial line with any JS version we create. This loader is known to work on the Raspberry Pi and MIPS based WIFI routers.

PLoadLib can be built with:

$ gcc -DMAIN PLoadLib.c osint_linux.c

2) propeller-loader.js - This is the JS version of the loader algorithm from PLoadLib.c Note that due to the asynchronous nature of JS this code does not look much like the original. You cannot have a loop blocking on serial port reads for example. 

3) propeller.js - This is the interface to the Propeller over a serial line. It is for node.js. It also drives a GPIO pin on the Raspberry Pi GPIO header for Propeller reset.

4) There is no propeller serial interface for use in Chrome yet. The idea is that a module similar to propeller.js is created to do that and dropped in to the Chrome version.

5) loader.js is to be "main" for the command line version under node.js. It is not yet connected to anything else.

6) crockford_objects.js - This is junk. Just playing with a way to make classes in JS.



TODO:
-----

1) Hook up loader.js to propeller-loader.js for use under node.

2) None of this has been tested against a real Propeller.

3) Make it work !

4) Create the Chrome app version.




Credits
-------

In the absence of any technical specification of the Propeller programming protocol
the operation of propeller-loader.js is derived from the C cource code of PLoadLib by
Steven Denson and David Betz. PLoadLib can be found in the loader proviced with with
propgcc, the GCC based compiler for the Propeller:
http://code.google.com/p/propgcc/

