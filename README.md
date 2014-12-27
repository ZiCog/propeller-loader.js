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


Credits
-------

In the absence of any technical specification of the Propeller programming protocol
the operation of propeller-loader.js is derived from the C cource code of PLoadLib by
Steven Denson and David Betz. PLoadLib can be found in the loader proviced with with
propgcc, the GCC based compiler for the Propeller:
http://code.google.com/p/propgcc/

