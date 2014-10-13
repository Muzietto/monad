
(function () {
    'use strict';

    var STATE = MONAD(function (monad, stateFun) {
            // NB: monad = object, stateFun = s -> [s,a]
            monad.bind = function (func, args) {
                return STATE(function (state) {
                    var scp = monad.run(state),
                    nextState = scp[0],
                    nextValue = scp[1];
                    return func(nextValue).run(nextState);
                });
            };
            monad.run = function (state) {
                return stateFun(state);
            };
            return stateFun;
        });

    STATE.setState = function (newState) {
        return STATE(function () {
            return [newState, undefined];
        });
    };

    STATE.getState = function () {
        return STATE(function (state) {
            return [state, state];
        });
    };

    // test 1) state monad as IO monad - no state modifications

    var getText = function (text) {
        return STATE(function (state) {
            return [state, prompt(text)];
        });
    }

    var alertText = function (text) {
        return STATE(function (state) {
            return [state, alert(text)];
        });
    }

    var start = STATE(function (s) {
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
        .bind(function (_) {
            return getText('your name please?')
        })
        .bind(function (x) {
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

    var listLabeler = function (list) {
        if (list.length === 0) {
            return STATE(function (s) {
                return [s, []];
            });
        } else {
            var x = list.shift();
            return STATE.getState()
            .bind(function (n) {
                return STATE.setState(n + 1)
                .bind(function (_) {
                    return listLabeler(list)
                    .bind(function (bb) {
                        return STATE(function (s) {
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
}
    ())

