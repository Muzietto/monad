
(function () {
    'use strict';

    var STATE = MONAD(function (monad, stateFun) {
            // NB: monad = , stateFun = s -> [s,a]
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
        })
        .method('setState', function (newState) {
            return STATE(function () {
                return [newState, undefined];
            });
        })
        .method('getState', function () {
            return STATE(function (state) {
                return [state, state];
            });
        });

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
    var askThenGreet = do
        _ <- start
        x <- getText('your name please?')
        _ <- alertText('welcome, ' + x)
        return _
     */

    var askThenGreet = start
        .bind(function (_) {
            return getText('your name please?')
            .bind(function (x) {
                return alertText('welcome, ' + x);
            })
        });

    askThenGreet.run(0);
}
    ())
