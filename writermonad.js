
(function () {
    'use strict';

    var writer = MONAD(function(monad, couple) {
        // NB: monad = object, couple = [value,monoid]
        var value = couple[0];
        var monoid = couple[1];
        
        monad.bind = function(fawb) {
            var newCouple = fawb(value);
            return [newCouple[0],monoid.append(monoid.value,newCouple[1])];
        }
        
        return couple;
    });

/*
    .lift('alert', alert)
        // monad.concat will be a monad
        .lift('concat', function (s) {
            return s.concat(arguments[1]); // e.g. monad.concat('A')
        })
        // monad.value will be a plain value
        .lift_value('value', function (s) {
            return s;
        });
*/
    var start = writer();
    
    var isBigGang = function(x) {
        return [x>9,'compared gang size to 9'];
    }
    
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
