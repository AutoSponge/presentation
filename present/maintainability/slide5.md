##More Maintainable

    function createSubscription( handler, reciever ) {
        return Function.apply.bind( handler, reciever );
    }
    function getSubscriptions( topic ) {
        return topics[topic] = topics[topic] || [];
    }
    function addSubscription( topics, subscription ) {
        return topics[topics.length] = subscription;
    }
    function subscribe( topic, fn, reciever ){
        return addSubscription( getSubscriptions( topic ), createSubscription( handler, reciever ) );
    }
