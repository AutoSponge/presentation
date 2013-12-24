##Consume

    asyncEvent()
    //fulfilled
    .then(function( status ) {
      console.log( "done" );
    //rejected
    },function( status ) {
      console.log( "fail" );
    //progress
    },function() {
      console.log( "pending..." );
    });

<a href="http://jsbin.com/UVixOFay/2/edit?js,console" target="_blank">jsbin</a>