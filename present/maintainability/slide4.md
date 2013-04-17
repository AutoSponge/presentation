##Example

[Mediator Pattern] [1]

    var subscribe = function( topic, fn ){

        if ( !topics[topic] ){ 
          topics[topic] = [];
        }

        topics[topic].push( { context: this, callback: fn } );

        return this;
    };


[1]: http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript
