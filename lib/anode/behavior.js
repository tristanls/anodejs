/*
 * behavior.js: An anode behavior constructor
 * 
 * (C) 2011 Tristan Slominski
 *
 */

//
// ### function behavior ( [constructorParams...], behaviorSpec )
// #### @constructorPrams {array} things available to the behavior context
//      on construction
// #### @behaviorSpec {function|object} the behavior specification, that 
//      could be a function that will always be executed on any message, 
//      or an object specifying a pattern string : function pair that will 
//      match an incoming message to the pattern, and if the pattern is matched
//      it will execute the behavior specified in the function
// Returns a behavior constructor that needs to be called with appropriate
// constructor parameters and then passed to the actor creating function
//
var behavior = exports.behavior = function () {
  
  var __args = Array.prototype.slice.call( arguments );
  
  var beh = __args.pop(); // last argument is the behavior
  
  for ( var i = 0; i < __args.length; i++ ) {
    
    if ( typeof __args[ i ] !== 'string' )
      throw new Error( 'behavior constructor arguments must be strings' );
    
  } // for i in __args.length
  
  var matchers = [];
  
  if ( typeof beh === 'function' ) {
    
    matchers.push( 
      _createMatcher( [ { type: '_' } ], beh ) );
    
  } // behavior is a simple function
  else if ( typeof beh === 'object' ) { 
    
    for ( var pattern in beh ) {
      if ( ! beh.hasOwnProperty( pattern ) ) continue;
      
      // remove whitespace from pattern
      var tokens = pattern.replace( / /g, '' );
      
      // tokenize the pattern
      tokens = tokens.split( ',' );
      
      var args = []; // argument objects
      
      for ( var i = 0; i < tokens.length; i++ ) {
        
        var ptrn = tokens[ i ];
        
        if ( ptrn.indexOf( '#' ) == 0 ) {
          // string literal pattern
          
          args.push( { type: '#', name: ptrn.slice( 1 ) } );
          
        } // if ptrn starts with # ( ex: #get )
        else if ( ptrn.indexOf( '$' ) == 0 ) {
          // evaluate and match pattern
          
          args.push( { type: '$', name: ptrn.slice( 1 ) } );
          
        } // if ptrn starts with $ ( ex: $value )
        else if ( ptrn.indexOf( '[' ) == 0 ) {
          // optional variable pattern
          
          // strip the pattern of [ or ]
          ptrn = ptrn.slice( 1 );
          ptrn = ptrn.replace( /[\[\]]/g, '' );
          
          args.push( { type: 'optional', name: ptrn } );
          
        } // if ptrn starts with [ ( ex: [optional] )
        else if ( ptrn != '_' ) {
          // variable pattern
          
          args.push( { type: 'var', name: ptrn } );
          
        } // variable pattern ( ex: cust )
        else {
          
          args.push( { type: '_' } );
          
        } // wildcard '_'
        
      } // for i in tokens.length
      
      var functionBody = beh[ pattern ];
      
      matchers.push( _createMatcher( args, functionBody ) );
      
    } // for pattern in behavior
    
  } // else behavior is an object
    
  return function () {
    
    var __context = {};
    
    // setup the context
    var _matcherArgs = Array.prototype.slice.call( arguments );
    
    for ( var i = 0; i < _matcherArgs.length; i++ ) {
      
      __context[ __args[ i ] ] = _matcherArgs[ i ];
      
    } // for i in _matcherArgs.length
    
    return function () {
      
      var _callArgs = Array.prototype.slice.call( arguments );
      
      // attach context as last matcher argument
      _callArgs.push( __context );
      
      for ( var j = 0; j < matchers.length; j++ ) {
        
        var matcher = matchers[ j ];
        
        if ( matcher.apply( matcher, _callArgs ) ) {
          
          var __matcherContext = __context;
          
          for ( var cVar in matcher.__context ) {
            if ( ! matcher.__context.hasOwnProperty( cVar ) ) continue;
            
            __matcherContext[ cVar ] = matcher.__context[ cVar ];
            
          } // for cVar in matcher.__context
          
          // keep track of added context
          var addedContext = new Array();
          
          // populate current behavior context with matcher context
          for ( var k in __matcherContext ) {
            if ( ! __matcherContext.hasOwnProperty( k ) ) continue;
            
            this[ k ] = __matcherContext[ k ];
            addedContext.push( k );
            
          } // for k in __matcherContext
          
          // execute in current context
          matcher.__body.apply( this );
          
          // destroy added context
          for ( var z = 0; z < addedContext.length; z++ ) {
            
            delete this[ addedContext[ z ] ];
            
          } // for z in addedContext.length
          
          return; // matched and done
          
        } // if pattern matches
        
      } // for j in matchers.length
      
    }; // return behavior
    
  }; // return matcher constructor
  
}; // behavior

//
// ### function _createMatcher ( args, functionBody )
// #### @args {array} an array of { type, name } pairs represening
//      in sequence the expected arguments in an incoming message
// #### @functionBody {function} the behavior to be executed if
//      the message matches the pattern specified via @args
// Returns a matcher function that will return true if called with a message
// containing arguments that match @args, or false otherwise
// The behavior to be executed is attached as __body parameter on
// the returned matcher function.
//
var _createMatcher = function ( args, functionBody ) {
    
  var __context = {};
  
  var matcher = function () {
    
    var _args = Array.prototype.slice.call( arguments );
    
    var __actorContext = _args.pop(); // pop off the actor context
    
    var __wildcardUsed = false;
    var __skippedOptionalArgCount = 0;
    
    for ( var i = 0; i < args.length; i++ ) {
      
      var type = args[ i ].type;
      var name = args[ i ].name;
      
      switch( type ) {
        
        case '#' :
          // must exist
          if ( typeof _args[ i ] === 'undefined' ) return false;
          // must be a string to match
          if ( typeof _args[ i ] !== 'string' ) return false;
          // must equal either 'name' or '#name' for any name
          if ( _args[ i ] != name && _args[ i ] != '#' + name ) return false;
          
          break; // case #
          
        case '$' :
          // must exist
          if ( typeof _args[ i ] === 'undefined' ) return false;
          // evaluate existing arg to see if it is equal
          if ( __actorContext[ name ] instanceof Function ) {
            
            if ( _args[ i ] !== __actorContext[ name ]() ) return false;
            
          } else if ( __actorContext[ name ] instanceof Object ) {
            
            if ( _args[ i ] !== __actorContext[ name ] ) return false;
            
          } else {
            
            if ( _args[ i ] != __actorContext[ name ] ) return false;
            
          }
          
          break; // case $
          
        case 'optional':
          // doesn't have to exist
          if ( i >= _args.length ) {
            // we don't have any more arguments, but it's optional, so fill it with null
            __context[ name ] = null;
            __skippedOptionalArgCount++;
          } else {
            // enter into context by the provided name
            __context[ name ] = _args[ i ];
          } 
          
          break; // case optional
          
        case 'var':
          // must exist
          if ( typeof _args[ i ] === 'undefined' ) return false;
          // enter into context by the provided name and remove
          __context[ name ] = _args[ i ];
          
          break; // case var
          
        case '_':
          // enter into wildcard context the rest of arguments if at the end
          // of pattern ex. ( cust, _ ) given ( cust, one, two ) should assign
          // [ one, two ] to _
          if ( ( i + 1 ) < args.length ) {
            // not at the end, assign only this var to _
            __context[ '_' ] = _args[ i ];
          } else {
            // at the end of pattern, assign remaining vars to _
            __context[ '_' ] = Array.prototype.slice.call( arguments, i );
          }
          __wildcardUsed = true;
          break; // case _
        
      } // switch args[ i ].type
      
    } // var in args.length
    
    // if wildcard was not used, then we require the number of arguments in the message
    // to match the number of arguments in the pattern ( except for optional ones )
    if ( ! __wildcardUsed )
      if ( args.length != ( _args.length + __skippedOptionalArgCount ) ) return false;
    
    // populate the context since we matched
    matcher.__context = __context;
    
    // if we don't have a _ from the pattern, populate it with entire message
    if ( ! matcher.__context[ '_' ] ) matcher.__context[ '_' ] = _args;
    
    // if we got here, we didn't fail a match, so match!
    return true;
    
  }; // matcher
  
  matcher.__body = functionBody;
  
  return matcher;
  
}; // _createMatcher

