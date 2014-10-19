
(function () {
    'use strict';
    
    var writer = MONAD(function(monad, couple) {
        // NB: monad = object, couple = [value,monoid]
        
        if (!Array.isArray(couple)) {
            couple = [couple,''];
        }
        var value = couple[0];
        var monoid = couple[1];
        
        var mappend = function(monoid) {
            switch (typeof monoid) {
                case 'number': 
                case 'string': 
                    return function(value) { return monoid + value; }
                    break;
                case 'function':
                    return function(value) { return monoid.mappend(value); }
                    break;
                case 'object': 
                    if (Array.isArray(monoid)) {
                        return function(value) { return monoid.concat(value); }
                    }
                //case 'Maybe': 
                case 'Sum': 
                case 'Prod': 
                case 'Any': 
                case 'All': 
                case 'Ord': 
                    return function(value) { return monoid.mappend(value); }
            }
        }(monoid);
        
        monad.bind = function(fawb) {
            var newCouple = fawb(value);
            return [newCouple[0],mappend(newCouple[1])];
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
    var start = writer(5);
    
    var isBigGang = function(x) {
        return [x>9,'compared gang size to 9'];
    }
    
    var checkGang = start.bind(isBigGang);
    
    alert(checkGang[1]);
}
    ())
