
(function () {
    'use strict';

    var STATE = MONAD(function (monad, value) {
            // NB: monad = s -> [s,a], value = scalar
            monad.bind = function (func, args) {
                return STATE(function (state) {
                    var scp = monad(state),
                    nextState = scp[0],
                    nextValue = scp[1];
                    return func(nextValue)(nextState);
                });
            }
            return value;
        })
        .method('setState',function(value){
            return STATE(function(state){ return [state,value]; });
        })
        .method('getState',function(state){
            return STATE(function(_){ return [state,state]}; );
        });

    // a constructor for bindable functions
    var fVamb = function (V) {
        return function (a) {
            return MAYBE(a + V);
        }
    }

    // a show stopper
    var chainBreaker = function (a) {
        return MAYBE(undefined);
    }

    var nothing = MAYBE(null);

    nothing
    .bind(fVamb('xxx')) // --> no crash
    .alert(); // --> no popup

    var some = MAYBE('some');

    some
    .bind(fVamb('X'))
    .bind(fVamb('YZ'))
    .alert(); // 'someXYZ'

    some
    .bind(fVamb('X'))
    .bind(chainBreaker) // ouch!
    .alert(); // --> no popup

}
    ())
