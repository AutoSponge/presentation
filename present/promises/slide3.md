##Compare
simple, functional example only


##Callback

    function handleResults( result ) {
        // do something with result
    }
    function handleError( err ) {
        // do something with err
    }
    function request( options ) {
        var req = http.request( options, handleResult );
        req.on( "error", handleError );
        req.end();
    }
    thingsList.map( createOptions ).map( request );


##Promise

    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } );
    }
    function handleResults( results ) {
        // do something with results
    }
    function handleError( err ) {
        // do something with err
    }
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( handleResults, handleError );


##Promise - Maintainable

    // (⌐■_■) remove dependencies and reuse
    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } );
    }
    function handleResults( results ) {
        // do something with results
    }
    function handleError( err ) {
        // do something with err
    }
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( handleResults, handleError );


##Promise - Testable

    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } ); // (⌐■_■) return values easier to test
    }
    function handleResults( results ) {
        // do something with results
    }
    function handleError( err ) {
        // do something with err
    }
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( handleResults, handleError );


##Promise - Composable

    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } );
    }
    // (⌐■_■) wrap it up
    function getRequest( fullPath ) {
        var split = url.split( "/" );
        return request( {
            method: "GET",
            hostname: split[0],
            path: split[1] || ""
        } );
    }


##Promise - Chainable

    function stringify( obj ) {
        return JSON.stringify( obj );
    }
    function save( path ) {
        return function ( str ) {
            return new Promise( function ( resolve, reject ) {
                fs.writeFile( path, str, function ( err ) {
                    ( err ? reject : resolve )( err || path );
                } );
            } );
        };
    }
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( handleResults )
      .then( stringify )
      .then( save( "path/file.json" ) )
      .catch( handleError ); // (⌐■_■) so much chain


##Promise - Debug

    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } );
    }
    function handleResults( results ) {
        // (╯°□°)╯︵ ʞɔɐʇsllɐɔ - distance from invocation, shared handlers
    }
    function handleError( err ) {
        // (╯°□°)╯︵ ǝɔɐɹʇ ʞɔɐʇs
    }
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( handleResults, handleError );


##Promise - Memory

    function request( options ) {
        return new Promise( function ( resolve, reject ) {
            var req = http.request( options, resolve );
            req.on( "error", reject );
            req.end();
        } );
    }
    function handleResults( results ) {
        // do something with results
    }
    function handleError( err ) {
        // do something with err
    }
    var resultsPromise = Promise.all( list.map( opts ).map( request ) );
      // ಠ_ಠ how much data in this array?
      // how old is this result? ಠ_ಠ


##Promise - Side-effects

    //(⌐■_■)
    Promise.all( thingsList.map( createOptions ).map( request ) )
      .then( appendDataToResults ) // local side-effect
      .then( stringify )
      .then( postIds ) // remote side-effect
      .then( save( "path/receipt.json" ) )
      .catch( handleError ); // error... retry? ( •_•)>⌐■-■

      // welcome to promise hell  /(.□. \） Ψ-(`_´ # )↝

