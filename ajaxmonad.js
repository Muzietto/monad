
(function () {
    'use strict';

    /* my own ajax implementation has also one method to concat strings
     * and one method to extract the value */
    var ajax = MONAD()
        .lift('alert', alert)
        .lift('concat', function (s /*, stringToConcat */) {
            return s.concat(arguments[1]); // e.g. monad.concat('A')
        })
        // gotta use lift_value because a lift-ed fun would return a monad
        .lift_value('value', function (s) {
            return s;
        });

    // start monad
    var start = ajax('-->');
    
    // first monad produced
    var firstSteps = start.concat('A').concat('B').concat('C');
    
    // final monad
    var otherSteps = firstSteps
        .bind(function (a) { // using bind on the fly
            return ajax(a.length + 'EEE' + arguments[1])
        },['_Z_']).concat('f');

    // window takes care of the first popup, while ajax produces the string
    alert(firstSteps.value()); // '-->ABC'
    // the monad takes care of all
    otherSteps.alert();  // '6EEE_Z_f'
}
    ())
