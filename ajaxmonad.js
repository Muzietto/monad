
(function () {
    'use strict';

    /* my own ajax implementation has also one method to concat strings
     * and one method to extract the value */
    var ajax = MONAD()
        .lift('alert', alert)
        .lift('concat', function (s) {
            return s.concat(arguments[1]);
        })
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
            return ajax(a.length + 'EEE')
        }).concat('f');

    // window takes care of the first popup, while ajax produces the string
    alert(firstSteps.value()); // '-->ABC'
    // the monad takes care of all
    otherSteps.alert();  // '6EEEf'
}
    ())
