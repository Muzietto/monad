
(function () {
    'use strict';

    var ajax = MONAD().lift('concatt', function (s) {
            return s.concat(arguments[1])
        }).lift('alert', alert);

    var mmm = ajax('value');

    mmm.concatt('A').concatt('B').concatt('C')
    .bind(function(a){return ajax(a + 'EEE')}).concatt('f')
    .alert();

}
    ())
