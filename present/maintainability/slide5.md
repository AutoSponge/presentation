##More Maintainable

    function Subscription(context, callback) {
        this.context = context;
        this.callback = callback;
    }
    function add( list,  subscription ) {
        return list[list.length] = subscription;
    }
    function getList( topic ) {
        return (topics[topic] = topics[topic] || []);
    }
    function subscribe( topic, callback ){
        return add( getList( topic ), new Subscription(this, callback) );
    }
    //Maintainability: 151
