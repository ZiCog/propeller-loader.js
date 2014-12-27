//
// Douglas Crockford's now prefered way to make objects and do "class" like thigs.
//
// In theory we have:
//
// Pros:
// 
// 1) No need to worry about the troublesome "this"
//
// 2) Can pass methods as callbacks directly, no need for "bind"
// 
// 3) Easily get public and private methods
//
// 4) No verbode messing with bla.prototype.bla = bla
//
// 5) Very easy to understand
//
// Cons:
//
// 1) Perhaps not as memory efficient as using prototypes
//
// 2) Perhaps slower to create objects.
//
// This needs benchmarking. 


"use strict";


var events = require("events");
var util = require('util');

// As an example this base "class" is a node.js event emitter
var OtherObject = function (init) {
    // return new EventEmitter();
    var that = function () {
        console.log("WTF");
    };
    util.inherits(that, events.EventEmitter);
    return new that;
};

var MyObject = function (init) {
    console.log("MyObject:");

    // Create this object as an enhancement of some other.
    var that = OtherObject(init);

    // Private data
    var x = init.x,
        y = init.y,

        // Private methods
        method1 = function () {
            console.log ("Method1:", x++)
            method2();
            return 0;
        },

        method2 = function () {
            console.log ("Method2:");
            that.emit("someEvent");
            return 0;
        };

    // Make public. Yay, we have public and private methods!
    that.method1 = method1;

    return that;
};

// Create some instances
var instance1 = MyObject({x: 1});
var instance2 = MyObject({x: 2});


instance1.on("someEvent", function () {
    console.log("someEvent has occured on instance 1");
});

instance2.on("someEvent", function () {
    console.log("someEvent has occured on instance 2");
});

// Try to call public and private methods
try {
    instance1.method1();
    instance1.method2();
} catch (e) {
    console.log(e);
}


instance1.method1();

instance2.method1();

// Yay, we can use methods as callbacks without and bind nonsense!
setInterval (instance1.method1, 1000);

setInterval (instance2.method1, 3000);
