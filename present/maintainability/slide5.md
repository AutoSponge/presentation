##More Maintainable

    function Subscription( context, callback ) {
        this.context = context;
        this.callback = callback;
    }
    function add( list,  handler ) {
        return list[list.length] = handler;
    }
    function getList( topic ) {
        return ( topics[topic] = topics[topic] || [] );
    }
    function subscribe( topic, callback ) {
        return add( getList( topic ), new Subscription( this, callback ) );
    }
    //Maintainability: 151
