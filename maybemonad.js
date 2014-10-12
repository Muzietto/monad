
(function () {
    'use strict';

    // a maybe with alerting capabilities (or not...)
    var MAYBE = MONAD(function (monad, value) {
            if (value === null || typeof value === 'undefined') {
                monad.is_null = true;
                monad.bind = function () {
                    return monad;
                }
                return null;
            }
            return value;
        }).lift('alert', alert);

    var fVamb = function (V) {
        return function (s) {
            return MAYBE(s + V);
        }
    }
    var nothing = MAYBE(null);

    nothing
    .bind(fVamb('xxx')) // --> no crash
    .alert(); // --> no popup

    var some = MAYBE('some');

    some
    .bind(fVamb('xxx'))
    .alert();
}
    ())
