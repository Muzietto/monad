
(function () {
    'use strict';

    // a maybe with alerting capabilities (or not...)
    var maybe = MONAD(function (monad, value) {
            if (value === null || typeof value === 'undefined') {
                monad.is_null = true;
                monad.bind = function () {
                    return monad;
                }
                return null;
            }
            return value;
        })
        .lift('alert', alert);

    // a constructor for bindable functions
    var fVamb = function (V) {
        return function (a) {
            return maybe(a + V);
        }
    }

    // a show stopper
    var chainBreaker = function(a){
        return maybe(undefined);
    }

    var nothing = maybe(null);

    nothing
    .bind(fVamb('xxx')) // --> no crash
    .alert(); // --> no popup

    var some = maybe('some');

    some
    .bind(fVamb('X'))
    .bind(fVamb('YZ'))
    .alert(); // 'someXYZ'

    some
    .bind(fVamb('X'))
    .bind(chainBreaker) // ouch!
    .alert(); // --> no popup
    
    }
    ())
