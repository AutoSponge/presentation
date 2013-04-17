##Example



    var subscribe = function( topic, fn ){

        if ( !topics[topic] ){ 
          topics[topic] = [];
        }

        topics[topic].push( { context: this, callback: fn } );

        return this;
    };

