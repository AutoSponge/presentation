##Server Side

Q Example ([A+](http://promises-aplus.github.io/promises-spec/)):

    function asyncEvent() {
      var defer = q.defer();  //no constructor
      setTimeout( defer.resolve, Math.floor( 400 + Math.random() * 2000 ) );
      setTimeout( defer.reject, Math.floor( 400 + Math.random() * 2000 ) );
      setTimeout( function working() {
        if ( defer.promise.isPending() ) { //helper fn
          defer.notify( "working... " );
          setTimeout( working, 500 );
        }
      }, 1 );
      return defer.promise; //property
    }

