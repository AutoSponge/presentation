##Chaining

A serial process from an array of promises (no arguments)

    var done = console.log.bind( console, "done" );

    function asyncEvent() {
      var defer = new jQuery.Deferred();
      setTimeout( defer.resolve, Math.floor( 400 + Math.random() * 2000 ) );
      return defer.promise();
    }

    [
      asyncEvent().then( done ),
      asyncEvent().then( done ),
      asyncEvent().then( done )
    ]
    .reduce( $.when )
    .then( function () {
      console.log( "all done" );
    } );

<a href="http://jsbin.com/irIVIGOB/2/edit?js,console" target="_blank">jsbin</a>
