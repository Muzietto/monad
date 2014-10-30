
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
                    if (Array.isArray(monoid)) { // case 'array'
                        return function(value) { return monoid.concat(value); }
                        break;
                    }
                case 'function': // all untested
                case 'Sum': 
                case 'Prod': 
                case 'Any': 
                case 'All': 
                case 'Ord': 
                    return function(value) { return monoid.mappend(value); }
            }
        }(monoid);
        monad.bind = function(fawb) { // fawb = a -> writer b
            var newCouple = fawb(value).run();
            return writer([newCouple[0], mappend(newCouple[1])]);
        }
        monad.run = function() {
            return couple;
        }
        monad._1 = function() {
            return couple[0];
        }();
        monad._2 = function() {
            return couple[1];
        }();
        return couple;
    });

    // string as monoid
    var smallish = writer([5,'Smallish gang.']);
    var larger = writer([15,'Large gang.']);
    var isBigGang = function(x) { return writer([x>9,'Compared gang size to 9.']); }
    
    var checkSmall = smallish.bind(isBigGang);    
    alert(checkSmall.run());
    var checkLarge = larger.bind(isBigGang);    
    alert(checkLarge.run());

    // list as monoid
    var start = writer([0,[]]);
    var carryOn = function(x) { 
        return writer([x+1,[x]]); 
    }
    var enumerationOfFive = start
        .bind(carryOn)
        .bind(carryOn)
        .bind(carryOn)
        .bind(carryOn)
        .bind(carryOn);
    
    alert(enumerationOfFive.run()); // [5,[1,2,3,4]]
    alert(enumerationOfFive._1);
    alert(enumerationOfFive._2);
}
    ())
