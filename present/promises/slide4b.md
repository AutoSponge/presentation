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

<a href="https://c9.io/autosponge/promises#openfile-q_example.js" target="_blank">cloud9</a>