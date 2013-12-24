##Client Side

jQuery example:

    function asyncEvent() {
      var defer = new jQuery.Deferred();
      setTimeout( defer.resolve, Math.floor( 400 + Math.random() * 2000 ) );
      setTimeout( defer.reject, Math.floor( 400 + Math.random() * 2000 ) );
      setTimeout(function working() {
        if ( defer.state() === "pending" ) {
          defer.notify( "working... " );
          setTimeout( working, 500 );
        }
      }, 1 );
      return defer.promise();
    }

<a href="http://jsbin.com/eTopiPuW/1/edit?js,console" target="_blank">jsbin (why it works)</a>