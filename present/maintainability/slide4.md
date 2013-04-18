##Example

[Mediator Pattern][1]

[1]: http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript

    var subscribe = function( topic, fn ){

        if ( !topics[topic] ){ 
          topics[topic] = [];
        }

        topics[topic].push( { context: this, callback: fn } );

        return this;
    };
    //Maintainability: 117
