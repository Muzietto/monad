
(function () {
    'use strict';
    
    var writer = MONAD(function(monad, couple) {
        // NB: monad = object, couple = [value, monoid]
        
        // default monoid is string
        if (!Array.isArray(couple)) {
            couple = [couple, ''];
        }
        var value = couple[0];
        var monoid = couple[1];
        
        var mappend = function(monoid) {
            switch (typeof monoid) {
                case 'number': 
                case 'string': 
                    return function(value) { return monoid + value; }
                    break;
                case 'boolean': // use case for booleans is form validation
                    return function(value) { return monoid && value; }
                    break;
                case 'object': 
                    if (Array.isArray(monoid)) {
                        return function(value) { return monoid.concat(value); }
                        break;
                    }
                //case 'Maybe': 
                case 'function':
                case 'Sum': 
                case 'Prod': 
                case 'Any': 
                case 'All': 
                case 'Ord': 
                    return function(value) { return monoid.mappend(value); }
            }
        }(monoid);
        
        monad.bind = function(fawb) { // fawb = a -> Writer b
            var newCouple = fawb(value);
            return writer([newCouple[0], mappend(newCouple[1])]);
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
    // string as monoid
    var smallish = writer([5,'Smallish gang.']);
    var larger = writer([15,'Large gang.']);    
    var isBigGang = function(x) { return [x>9,'Compared gang size to 9.']; }
    
    var checkSmall = smallish.bind(isBigGang);    
    //alert(checkSmall);
    var checkLarge = larger.bind(isBigGang);    
    //alert(checkLarge);

    // list as monoid
    var xxx = writer(0,[]);
    var carryOn = function(x) { return [x+1,[x]]; }
    var enumerationOfTwo = xxx.bind(carryOn).bind(carryOn);
    
    alert(enumerationOfTwo);
}
    ())
