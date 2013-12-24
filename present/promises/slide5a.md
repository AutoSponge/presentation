##New Hotness

ES6 Promises:

    function asyncEvent() {
      return new Promise( function(resolve, reject) {
        setTimeout( resolve, Math.floor( 400 + Math.random() * 2000 ) );
        setTimeout( reject, Math.floor( 400 + Math.random() * 2000 ) );
      });
    }