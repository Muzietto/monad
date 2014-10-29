
(function () {
    'use strict';
    
    var identity = MONAD();
    var id = identity('Hello, I\'m an identity\nTry to stop me from alerting you...');
    id.bind(alert); // no way to stop it...

    /* my own ajax implementation has also one method to concat strings
     * and one method to extract the value */
    var ajax = MONAD()
        .lift('alert', alert)
        .lift('smarterAlert', function(v) {
            alert(v);
            return v;
        })
        // monad.concat will be a monad
        .lift('concat', function (v,c) { // binding a binary function!!
            return v.concat(c); // e.g. monad.concat('A')
        })
        // monad.value will be a plain value
        .lift_value('value', function (s) {
            return s;
        });
        
    // start monad
    var start = ajax('-->');
    
    // concatting unary functions
    var concat2 = function (c) {
        return function(v) {
            return ajax(v.concat(c));
        }
    }
    // first monad produced
    var firstSteps = start
        .concat('A')
        .concat('B')
        .concat('C')
        .bind(concat2('filippo'));
    
    // final monad
    var otherSteps = firstSteps
        .bind(function (a,b) { // another binary function!!
            return ajax(a.length + 'EEE' + b)
        },['_Z_']).concat('f');

        
    // window takes care of the first popup, while ajax produces the string
    alert(firstSteps.value()); // '-->ABCfilippo'
    // the monad takes care of all
    otherSteps.smarterAlert()  // '13EEE_Z_f'
    .concat('STOP!').alert();  // '13EEE_Z_fSTOP!'
}
    ())
