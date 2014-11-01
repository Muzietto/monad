
(function () {
    'use strict';

    var STATE = MONAD(function(monad, stateFun) {
        // NB: monad = object, stateFun = s -> [s,a]
        monad.bind = function(func, args) {
            return STATE(function(state) {
                var scp = monad.run(state),
                nextState = scp[0],
                nextValue = scp[1];
                return func(nextValue).run(nextState);
            });
        };
        monad.run = function(state) {
            return stateFun(state);
        };
        return stateFun;
    });

    STATE.setState = function(newState) {
        return STATE(function() {
            return [newState, undefined];
        });
    };

    STATE.getState = function() {
        return STATE(function(state) {
            return [state, state];
        });
    };

    // test 1) state monad as IO monad - no state modifications

    var getText = function(text) {
        return STATE(function(state) {
            return [state, prompt(text)];
        });
    }

    var alertText = function(text) {
        return STATE(function(state) {
            return [state, alert(text)];
        });
    }

    var start = STATE(function(s) {
            return [s, undefined]
        });

    /*
     * var askThenGreet = do
     *     _ <- start
     *     x <- getText('your name please?')
     *     _ <- alertText('welcome, ' + x)
     *     return _
     */
    var askThenGreet = start
        .bind(function(_) {
            return getText('your name please?')
        })
        .bind(function(x) {
            return alertText('welcome, ' + x);
        });

    askThenGreet.run('whatever');

    // test 2) state monad as list processor

    /*
     * listLabeler list =
     *   list match
     *      | [] -> return (s -> (s,[]))
     *      | x:xs -> do
     *          n  <- getState()
     *          _  <- setState(n+1)
     *          bb <- listLabeler xs
     *          return $ [n,x]:bb
     */

    var listLabeler = function(list) {
        if (list.length === 0) {
            return STATE(function(s) {
                return [s, []];
            });
        } else {
            var x = list.shift();
            return STATE.getState()
            .bind(function(n) {
                return STATE.setState(n + 1)
                .bind(function(_) {
                    return listLabeler(list)
                    .bind(function(bb) {
                        return STATE(function(s) {
                            return [s, [[n, x]].concat(bb)];
                        });        
                    });
                });
            });
        }
    };

    var testList = ['a', 'b', 'c', 'd','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var listMonad = listLabeler(testList);
    var labeledScp = listMonad.run(0);
    var finalState = labeledScp[0];
    var labeledList = labeledScp[1];

    alert('finalState=' + finalState); // must be 26
    alert('labeledList[0]=' + labeledList[0]); // must be [0,'a']
    alert('labeledList[3]=' + labeledList[3]); // must be [3,'d']
    alert('labeledList[25]=' + labeledList[25]); // must be [25,'z']
    
    // STATE WITH ERROR (SE) --> value is now [?error,value]
    var SE = MONAD(function(monad,seFun) {
        monad.bind = function(fasb){
            return SE(function(s){
                try {
                    var cp = monad.run(s); // cp = [?error,value||exc]
                    if (cp[1][0]){
                        throw cp[1][1]; // if error throw exc 
                    }
                    return fasb(cp[1]).run(cp[0]);
                } catch (exc) {
                    return [s,[true,exc]];
                }
            });
        };        
        monad.run = function(s){ return seFun(s); };
        return seFun;
    });
    
    SE.getState = function(){ return SE(function(state){ return [state,[false,state]]; }); };
    SE.setState = function(newState){ return SE(function() { return [newState,[false,undefined]]; }); };
        
    var listLabelerWithError = function (list) {
        if (list.length === 0) {
            return SE(function (s) {
                return [s, [false,[]]];
            });
        } else {
            var x = list.shift();
            return SE.getState()
            .bind(function (en) { // en = [false,n]
                return SE.setState(en[1] + 1)
                .bind(function (_) {
                    return listLabelerWithError(list)
                    .bind(function (bb) { // bb = [false,labeledCdrList]
                        return SE(function(s) {
                            if (x === 'c') {
                                throw ('got a c!!!');
                            } else {
                                return [s, [false,[[en[1], x]].concat(bb[1])]];
                            }
                        });
                    });
                });
            });
        }
    };

    // with no 'c' in the array, everything is fine
    var goodList = ['a', 'b', 'd'];
    var goodListMonad = listLabelerWithError(goodList);
    var goodLabeledScp = goodListMonad.run(0);
    var goodFinalState = goodLabeledScp[0];
    var goodLabeledEither = goodLabeledScp[1];
    alert('goodFinalState = ' + goodFinalState); // must be 3
    alert('goodLabeledEither[0] = errorStatus = ' + goodLabeledEither[0]); // must be false
    alert('goodLabeledEither[1][0] = labeledList[0] = ' + goodLabeledEither[1][0]); // must be [0,'a']

    // here comes trouble..
    var badList = ['a', 'b', 'c'];
    var badListMonad = listLabelerWithError(badList);
    var badLabeledScp = badListMonad.run(0);
    var badFinalState = badLabeledScp[0];
    var badLabeledEither = badLabeledScp[1];
    alert('badFinalState = ' + badFinalState); // must be 1 (why not 0?!?)
    alert('badLabeledEither[0] = errorStatus = ' + badLabeledEither[0]); // must be true
    alert('badLabeledEither[1] = error message = ' + badLabeledEither[1]); // must be 'got a c!!!'
    
}
    ())

