propeller-loader.js is a program loader for the Parallax Inc. Propeller 32 bit
multi-core micro-controller.

Programming a Propeller requires a serial connection so this loader is only usable
from node.js or from within a Chrome App. 

Credits:

In the absence of any technical specification of the Propeller programming protocol
the operation of propeller-loader.js is derived from the C cource code of PLoadLib by
Steven Denson and David Betz. PLoadLib can be found in the loader proviced with with
propgcc, the GCC based compiler for the Propeller:
http://code.google.com/p/propgcc/

