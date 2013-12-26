// modified by @AutoSponge 2013.
//
// Copyright 2011 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function(global) {
    'use strict';

    // Do not show source maps by default.
    traceur.options.sourceMaps = false;

    var SourceMapConsumer = traceur.outputgeneration.SourceMapConsumer;
    var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;
    var ProjectWriter = traceur.outputgeneration.ProjectWriter;
    var ErrorReporter = traceur.util.ErrorReporter;

    var hasError = false;
    var debouncedCompile = debounced(compile, 200, 2000);
    var input = CodeMirror.fromTextArea(document.querySelector('.input'), {
        //onChange: debouncedCompile,
        //onCursorActivity: debouncedCompile.delay,
        lineNumbers: true,
        theme: "ambiance"
    });

    var evalElement = document.querySelector('pre.eval');
    var errorElement = document.querySelector('pre.error');
    var sourceMapElement = document.querySelector('pre.source-map');

    if (location.hash)
        input.setValue(decodeURIComponent(location.hash.slice(1)));

    /**
     * debounce time = min(tmin + [func's execution time], tmax).
     *
     * @param {Function} func
     * @param {number} tmin Minimum debounce time
     * @param {number} tmax Maximum debounce time
     * @return {Function} A debounced version of func with an attached "delay"
     *     function. "delay" will delay any pending debounced function by the
     *     current debounce time. If there are none pending, it is a no-op.
     */
    function debounced(func, tmin, tmax) {
        var id = 0;
        var t = tmin;
        function wrappedFunc() {
            var start = Date.now();
            id = 0;
            func();
            t = tmin + Date.now() - start; // tmin + [func's execution time]
            t = t < tmax ? t : tmax;
        }
        function debouncedFunc() {
            clearTimeout(id);
            id = setTimeout(wrappedFunc, t);
        }
        // id is nonzero only when a debounced function is pending.
        debouncedFunc.delay = function() { id && debouncedFunc(); }
        return debouncedFunc;
    }

    function setOptionsFromSource(source) {
        var re = /^\/\/ Options:\s*(.+)$/mg;
        var optionLines = source.match(re);
        if (optionLines) {
            optionLines.forEach(function(line) {
                re.lastIndex = 0;
                var m = re.exec(line);
                try {
                    traceur.options.fromString(m[1]);
                } catch (ex) {
                    // Ignore unknown options.
                }
            });
            createOptions();
        }
    }

    function compile() {
        hasError = false;
        errorElement.textContent = sourceMapElement.textContent = '';

        var reporter = new ErrorReporter();
        reporter.reportMessageInternal = function(location, format, args) {
            errorElement.textContent +=
                ErrorReporter.format(location, format, args) + '\n';
        };

        var url = location.href;
        var project = new traceur.semantics.symbols.Project(url);
        var name = 'repl';
        var contents = input.getValue();
        if (history.replaceState)
            history.replaceState(null, document.title,
                '#' + encodeURIComponent(contents));
        setOptionsFromSource(contents);
        var sourceFile = new traceur.syntax.SourceFile(name, contents);
        project.addFile(sourceFile);
        var res = traceur.codegeneration.Compiler.compile(reporter, project, false);
        if (reporter.hadError()) {
            hasError = true;
        } else {
            var options;
            if (traceur.options.sourceMaps) {
                var config = {file: 'traceured.js'};
                var sourceMapGenerator = new SourceMapGenerator(config);
                options = {sourceMapGenerator: sourceMapGenerator};
            }

            var source = ProjectWriter.write(res, options);

            try {
                evalElement.textContent = ('global', eval)(source);
            } catch(ex) {
                hasError = true;
                errorElement.textContent = ex;
            }

            if (traceur.options.sourceMaps) {
                var renderedMap = renderSourceMap(source, options.sourceMap);
                sourceMapElement.textContent = renderedMap;
            }
        }

        errorElement.hidden = !hasError;
    }

    function createOptionRow(name) {
        var li = document.createElement('li');
        var label = document.createElement('label');
        label.textContent = name;
        var cb = label.insertBefore(document.createElement('input'),
            label.firstChild);
        cb.type = 'checkbox';
        var checked = traceur.options[name];
        cb.checked = checked;
        cb.indeterminate = checked === null;
        cb.onclick = function() {
            traceur.options[name] = cb.checked;
            createOptions();
            compile();
        };
        li.appendChild(label);
        return li;
    }

    var options = [
        'experimental',
        'debug',
        'sourceMaps',
        'freeVariableChecker',
        'validate'
    ];

    var showAllOpts = true;
    var allOptsLength = Object.keys(traceur.options).length;
    var showMax = allOptsLength;

    function createOptions() {
        var optionsDiv = document.querySelector('.traceur-options');
        optionsDiv.textContent = '';
        if (showAllOpts) {
            var i = 0;
            Object.keys(traceur.options).forEach(function(name) {
                if (i++ >= showMax || options.lastIndexOf(name) >= 0)
                    return;
                optionsDiv.appendChild(createOptionRow(name));
            });
            optionsDiv.appendChild(document.createElement('hr'));
        }
        options.forEach(function(name) {
            optionsDiv.appendChild(createOptionRow(name));
        });
    }

    createOptions();

    function renderSourceMap(source, sourceMap) {
        var consumer = new SourceMapConsumer(sourceMap);
        var lines = source.split('\n');
        var lineNumberTable = lines.map(function(line, lineNo) {
            var generatedPosition = {
                line: lineNo + 1,
                column: 0
            };
            var position = consumer.originalPositionFor(generatedPosition);
            var lineDotColumn = position.line + '.' + position.column;
            return (lineNo + 1) + ': ' + line + ' -> ' + lineDotColumn;
        });
        return 'SourceMap:\n' + lineNumberTable.join('\n');
    }

    global.cm = input;


    $(".CodeMirror").on("keyup", function (e) {
        if ( e.which === 13 || e.which === 27 ) {
            debouncedCompile();
        }
    });

}(this));

(function () {
    //even though it would be cool, resist the tempation to use _part_ here
    //so it doesn't leak into the repl

    var examples = document.getElementById("examples");
    var lists = ["jQueryExamples", "QExamples", "ES6Examples"];
    var elms = {};
    var cache = {};
    var config = {
        jQueryExamples: [
            {
                title: "jQuery basic async function",
                body: function () {
                    /*
function asyncEvent() {
    var thenable = new $.Deferred(), //constructor
        timer = Math.floor( 400 + Math.random() * 2000 );

    setTimeout( thenable[timer % 2 ? "resolve" : "reject"], timer );

    return thenable.promise();  //method
}

asyncEvent()
    //fulfilled
    .then(function() {
        console.log( "done" );
    //rejected
    }, function() {
        console.log( "fail" );
    });
                     */
                }
            }, {
                title: "jQuery progressing function",
                body: function () {
                    /*
function asyncEvent() {
    var thenable = new $.Deferred(), //constructor
        timer = Math.floor( 400 + Math.random() * 2000 );

    setTimeout( thenable[timer % 2 ? "resolve" : "reject"], timer );

    setTimeout(function working() {
        if ( thenable.state() === "pending" ) { //method
            thenable.notify( "pending... " );
            setTimeout( working, 500 );
        }
    }, 1 );
    return thenable.promise();  //method
}

asyncEvent()
    //fulfilled
    .then(function() {
        console.log( "done" );
    //rejected
    }, function() {
        console.log( "fail" );
    //progress
    }, function() {
        console.log( "pending..." );
    });
                     */
                }
            }, {
                title: "jQuery 'all' with $.when",
                body: function () {
                    /*
//$asyncEvent(n {Any}, succeed {Boolean})
$.when($asyncEvent(1), $asyncEvent(2), $asyncEvent(3))
    .then(function() {
        console.log( "All done" );
    }, function() {
        console.log( "Some fail" );
    });
                     */
                }
            }, {
                title: "jQuery 'race'",
                body: function () {
                    /*
//$asyncEvent(n {Any}, succeed {Boolean})
function race(arr) {
    var thenable = $.Deferred();
    arr.map(function (promise) {
        promise.then(thenable.resolve);
    });
    return thenable.promise();
}
race( [$asyncEvent(1), $asyncEvent(2), $asyncEvent(3)] )
    .then(function(n) {
        console.log( "Some done " + n );
    });
                     */
                }
            }, {
                title: "jQuery 'race' with all fail handler",
                body: function () {
                    /*
//$asyncEvent(n {Any}, succeed {Boolean})
function race(arr) {
    var thenable = $.Deferred(),
        count = 0,
        complete = 0;
    arr.map(function (promise) {
        count += 1;
        promise.then( thenable.resolve, thenable.notify );
    });
    thenable.progress(function (n) {
        complete += 1;
        if ( complete === count ) {
            thenable.reject( n );
        }
    });
    return thenable.promise();
}
race( [$asyncEvent( 1 ), $asyncEvent( 2 ), $asyncEvent( 3 )] )
    .then(function(n) {
        console.log( "Some done " + n );
    }, function (n) {
        console.log( "All fail " + n );
    });
                     */
                }
            }, {
                title: "jQuery chain/pipe",
                body: function () {
                    /*
function $fixedAsyncEvent(n) {
    return $asyncEvent(n, true);
}
$asyncEvent(0)
  .then( $asyncEvent )
  .then( $asyncEvent )
  .then(function ( n ) {
    console.log( "All done " + n );
  }, function ( n ) {
    console.log( "Some failed " + n );
  });
                     */
                }
            }, {
                title: "jQuery chain with reduce",
                body: function () {
                    /*
function $fixedAsyncEvent(n) {
    return $asyncEvent(n, true);
}
[$asyncEvent, $asyncEvent].reduce(function (a, b) {
  return a.then(b)
}, $asyncEvent(0))
  .then(function ( n ) {
    console.log( "All done " + n );
  }, function ( n ) {
    console.log( "Some failed " + n );
  });
                     */
                }
            }, {
                title: "jQuery spread",
                body: function () {
                    /*
function spread(arr) {
    var thenable = $.Deferred(),
        results = [];
    arr.map(function (promise) {
        promise.always( thenable.notify );
    });
    thenable.progress(function ( result ) {
        results.push( result );
        if ( results.length === arr.length ) {
            thenable.resolve( results );
        }
    });
    return thenable.promise();
}
//$asyncEvent(n {Any}, succeed {Boolean})
spread( [$asyncEvent( 1 ), $asyncEvent( 2 ), $asyncEvent( 3 )] )
  .then(function ( arr ) {
    console.log( "All completed " + arr );
  });
                     */
                }
            }, {
                title: "jQuery spread with position",
                body: function () {
                    /*
function spread(arr) {
    var thenable = $.Deferred(),
        results = [],
        count = 0;
    arr.map(function (promise) {
        promise.always( thenable.notify.bind( null, i ) );
    });
    thenable.progress(function ( i, result ) {
        results[i] = result;
        count += 1;
        if ( count === arr.length ) {
            thenable.resolve( results );
        }
    });
    return thenable.promise();
}
//$asyncEvent(n {Any}, succeed {Boolean})
spread( [$asyncEvent( 1 ), $asyncEvent( 2 ), $asyncEvent( 3 )] )
  .then(function ( arr ) {
    console.log( "All completed " + arr );
  });
                     */
                }
            }, {
                title: "jQuery branching chain (race)",
                body: function () {
                    /*
function race(arr) {
    var thenable = $.Deferred();
    arr.map(function (promise) {
        promise.then(thenable.resolve);
    });
    return thenable.promise();
}
$asyncEvent( "start > ", true )
  .then( function (n) {
    return race( [
        $asyncEvent( n + "nextA > " ),
        $asyncEvent( n + "nextB > " )
    ] );
  })
  .always(function ( n ) {
    console.log( n + "complete" );
  });
                     */
                }
            }, {
                title: "jQuery branching chain (spread)",
                body: function () {
                    /*
function spread(arr) {
    var thenable = $.Deferred(),
        results = [];
    arr.map(function (promise) {
        promise.always( thenable.notify );
    });
    thenable.progress(function ( result ) {
        results.push( result );
        if ( results.length === arr.length ) {
            thenable.resolve( results );
        }
    });
    return thenable.promise();
}
$asyncEvent("start > ", true)
  .then( function (n) {
    return spread( [
        $asyncEvent( n + "nextA > " ),
        $asyncEvent( n + "nextB > " )
    ] );
  })
  .always(function ( arr ) {
    console.log( arr[0] + "complete" );
  });
                     */
                }
            }, {
                title: "uniqueness of fulfillment functions",
                body: function () {
                    /*
var a = new $.Deferred();
var b = new $.Deferred();
console.log("same handler? " + a.resolve === b.resolve);
a.resolve.call(b);
console.log("a state:" + a.state());
console.log("b state:" + b.state());
                     */
                }
            }
        ],
        QExamples: [
            {
                title: "Q basic async function",
                body: function () {
                    /*
function asyncEvent() {

    var thenable = Q.defer(),  //static method
        timer = Math.floor( 400 + Math.random() * 2000 );

    setTimeout( thenable[timer % 2 ? "resolve" : "reject"], timer );

    return thenable.promise; //property
}

asyncEvent()
    //fulfilled
    .then(function() {
        console.log( "done" );
    //rejected
    }, function() {
        console.log( "fail" );
    });
                    */
                }
            }, {
                title: "Q progressing function",
                body: function () {
                    /*
function asyncEvent() {

    var thenable = Q.defer(),  //static method
        timer = Math.floor( 400 + Math.random() * 2000 );

    setTimeout( thenable[timer % 2 ? "resolve" : "reject"], timer );

    setTimeout( function working() {
        if ( thenable.promise.isPending() ) { //promise method
            thenable.notify();
            setTimeout( working, 500 );
        }
    }, 1 );
    return thenable.promise; //property
}

asyncEvent()
    //fulfilled
    .then(function() {
        console.log( "done" );
    //rejected
    }, function() {
        console.log( "fail" );
    //progress
    }, function() {
        console.log( "pending..." );
    });
                    */
                }
            }
        ],
        ES6Examples: [
            {
                title: "ES6 basic async function",
                body: function () {
                    /*
var log = obj => () => console.log( obj );

function asyncEvent() {
    return new Promise( function(resolve, reject) {
        var timer = Math.floor( 400 + Math.random() * 2000 );
        setTimeout( timer % 2 ? resolve : reject, timer );
    });
}

asyncEvent()
    //fulfilled
    .then( log( "done" ),
    //rejected
    log( "fail" ) );
                     */
                }
            }, {
                title: "ES6 progressing function",
                body: function () {
                    /*
var log = obj => () => console.log( obj );

function asyncEvent() {
    var unresolved = true,
        progress = null,
        promise = new Promise( function(resolve, reject) {
            var timer = Math.floor( 400 + Math.random() * 2000 ),
                advice = fn => () => {unresolved = false, fn()};
            setTimeout( timer % 2 ? advice( resolve ) : advice( reject ), timer );
        });
    promise.progress = fn => {return progress = fn, promise};
    setTimeout( function working() {
        if ( unresolved && progress ) {
            progress();
            setTimeout( working, 500 );
        }
    }, 1 );
    return promise;
}

asyncEvent()
    .progress( log( "pending..." ) )
    //fulfilled
    .then( log( "done" ),
    //rejected
    log( "fail" ) );
                     */
                }
            }
        ]
    };

    //build lists
    lists.forEach(function (name) {
        elms[name] = document.getElementById( name );
    });

    lists.forEach( function (namespace) {
        config[namespace].forEach(function (e, i) {
            var str = e.body
                .toString()
                .replace(/[^\*]+\*/m, "")
                .split("*/")[0]
                .split("\n")
                .filter(function (s) {
                    return !!s && !s.match(/^\s+$/);
                })
                .join("\n");

            cache[e.title] = str;
            $('<li><a href="#">' + e.title + '</a></li>' ).appendTo(elms[namespace]);
        });
    } );

    //add handlers
    $("button[type=reset]" ).on("click", function () {
        window.location.href = window.location.href.split("#")[0];
    });

    $(examples).on("click", function (e) {
        cm.setValue( cache[e.target.textContent] );
        $("#heading" ).text( e.target.textContent );
        e.preventDefault();
    });

    //we don't want to force instances of Error for rejection reasons in demo
    Q.stopUnhandledRejectionTracking();

}());

//global helper functions
function getTimer() {
    return Math.floor( 400 + Math.random() * 2000 );
}
function $asyncEvent(n, succeed) {
    var timer = getTimer(),
        thenable = $.Deferred();
    setTimeout( function () {
        switch ( succeed ) {
            case true:
                thenable.resolve(n);
                break;
            case false:
                thenable.reject(n);
                break;
            default:
                thenable[timer % 2 ? "resolve" : "reject"](n);
        }
    }, timer );
    thenable.then(function(n) {
        console.log( "done " + n );
    }, function() {
        console.log( "fail " + n );
    });
    return thenable.promise();
}
function QasyncEvent(n, succeed) {
    var timer = getTimer(),
        thenable = Q.defer();
    setTimeout( function () {
        switch ( succeed ) {
            case true:
                thenable.resolve(n);
                break;
            case false:
                thenable.reject(n);
                break;
            default:
                thenable[timer % 2 ? "resolve" : "reject"](n);
        }
    }, timer );
    thenable.then(function(n) {
        console.log( "done " + n );
    }, function() {
        console.log( "fail " + n );
    });
    return thenable.promise;
}
function ES6asyncEvent(resolve, reject, n, succeed) {
    return new Promise( function(resolve, reject) {
        var timer = getTimer();
        setTimeout( function () {
            switch ( succeed ) {
                case true:
                    resolve(n);
                    break;
                case false:
                    reject(n);
                    break;
                default:
                    (timer % 2 ? "resolve" : "reject")(n);
            }
        }, timer );
    });
}