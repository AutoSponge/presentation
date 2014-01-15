##Have you Decided yet?

- Promises > Callbacks > Promises


##Use Both

    //bluebird and Q give you promise.nodeify
    function createUser( userName, userData, callback ) {
        return database.ensureUserNameNotTaken( userName )
        .then( function () {
            return database.saveUserData( userName, userData );
        } )
        .nodeify( callback );
    }


##Stay Tuned

- _ES6 Promises_ will change some things
- Learn how to use promises in this handy REPL
  - [http://autosponge.github.io/promises](http://autosponge.github.io/promises)