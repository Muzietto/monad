// monad.js
// Douglas Crockford
// 2013-05-18

// Public Domain

// The MONAD function is a macroid that produces monad constructor functions.
// It can take an optional modifier function, which is a function that is
// allowed to modify new monads at the end of the construction processes.

// A monad constructor (sometimes called 'unit' or 'return' in some mythologies)
// comes with three methods, lift, lift_value, and method, all of which can add
// methods and properties to the monad's prototype.

// A monad has a 'bind' method that takes a function that receives a value and
// is usually expected to return a monad.

//    var identity = MONAD();
//    var monad = identity("Hello world.");
//    monad.bind(alert);

//    var ajax = MONAD()
//        .lift('alert', alert)
//        .lift('concat', function (s /*, arguments */) {
//            return s.concat(arguments[1]);
//        });
//    var monad = ajax("Hello world.");
//    monad.concat(" Here I am!").alert();

//    var maybe = MONAD(function (monad, value) {
//        if (value === null || value === undefined) {
//            monad.is_null = true;
//            monad.bind = function () {
//                return monad;
//            };
//            return null;
//        }
//        return value;
//        })
//
//    // a constructor for bindable functions
//    var func = function (V) {
//        return function (a) {
//            return maybe(a + V);
//        }
//    }
//    var none = maybe(null);
//    none
//    .bind(func('xxx')) // No crash
//    .bind(alert);      // Nothing happens.
//    var some = maybe('some');
//    .bind(func('X'))
//    .bind(func('YZ'))
//    .bind(alert);    // 'someXYZ'

//    var STATE = MONAD(function (monad, stateFun) {
//            monad.bind = function (func, args) {
//                return STATE(function (state) {
//                    var scp = monad.run(state),
//                    nextState = scp[0],
//                    nextValue = scp[1];
//                    return func.apply(
//                        undefined,
//                       [nextValue].concat(Array.prototype.slice.apply(args || []))
//                    ).run(nextState);
//                });
//            };
//            monad.run = function (state) {
//                return stateFun(state);
//            };
//            return stateFun;
//        });
//
//    STATE.setState = function (newState) {
//        return STATE(function () {
//            return [newState, undefined];
//        });
//    };
//
//    STATE.getState = function () {
//        return STATE(function (state) {
//            return [state, state];
//        });
//    };
//
//    var WRITER = MONAD(function(monad, couple) { // couple :: [value, monoid]
//        // default monoid is string
//        if (!Array.isArray(couple)) {
//            couple = [couple, ''];
//        }
//        var value = couple[0];
//        var monoid = couple[1];
//        var mappend = function(monoid) {
//            switch (typeof monoid) {
//                case 'number': 
//                case 'string': 
//                    return function(value) { return monoid + value; }
//                    break;
//                case 'boolean': // use case for booleans is form validation
//                    return function(value) { return monoid && value; }
//                    break;
//                case 'object': 
//                    if (Array.isArray(monoid)) { // case 'array'
//                        return function(value) { return monoid.concat(value); }
//                        break;
//                    }
//                case 'function': // all untested
//                case 'Sum': 
//                case 'Prod': 
//                case 'Any': 
//                case 'All': 
//                case 'Ord': 
//                    return function(value) { return monoid.mappend(value); }
//            }
//        }(monoid);
//        monad.bind = function(fawb) { // fawb = a -> writer b
//            var newCouple = fawb(value).run();
//            return writer([newCouple[0], mappend(newCouple[1])]);
//        }
//        monad.run = function() {
//            return couple;
//        }
//        monad._1 = function() {
//            return couple[0];
//        }();
//        monad._2 = function() {
//            return couple[1];
//        }();
//        return couple;
//    });

function MONAD(modifier) {
    'use strict';

// Each unit constructor has a monad prototype. The prototype will contain an
// is_monad property for classification, as well as all inheritable methods.

    var prototype = Object.create(null);
    prototype.is_monad = true;

// Each call to MONAD will produce a new unit constructor function.

    function unit(value) {

// Construct a new monad.

        var monad = Object.create(prototype);

// In some mythologies 'bind' is called 'pipe' or '>>='.
// The bind method will deliver the unit's value parameter to a function.

        monad.bind = function (func, args) {

// bind takes a function and an optional array of arguments. It calls that
// function passing the monad's value and bind's optional array of args.

// With ES6, this horrible return statement can be replaced with

//          return func(value, ...args);

            return func.apply(
                undefined,
                [value].concat(Array.prototype.slice.apply(args || []))
            );
        };

// If MONAD's modifier parameter is a function, then call it, passing the monad
// and the value.

        if (typeof modifier === 'function') {
            value = modifier(monad, value);
        }

// Return the shiny new monad.

        return monad;
    }
    unit.method = function (name, func) {

// Add a method to the prototype.

        prototype[name] = func;
        return unit;
    };
    unit.lift_value = function (name, func) {

// Add a method to the prototype that calls bind with the func. This can be
// used for ajax methods that return values other than monads.

        prototype[name] = function () {
            return this.bind(func, arguments);
        };
        return unit;
    };
    unit.lift = function (name, func) {

// Add a method to the prototype that calls bind with the func. If the value
// returned by the func is not a monad, then make a monad.

        prototype[name] = function () {
            var result = this.bind(func, arguments);
            return result && result.is_monad === true ? result : unit(result);
        };
        return unit;
    };
    return unit;
}

