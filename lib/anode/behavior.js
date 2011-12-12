/*
 * behavior.js: An anode behavior constructor
 * 
 * (C) 2011 Tristan Slominski
 *
 */

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
    
  } // 
    
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

var _createMatcher = function ( args, functionBody ) {
    
  var __context = {};
  
  var matcher = function () {
    
    var _args = Array.prototype.slice.call( arguments );
    
    var __actorContext = _args.pop(); // pop off the actor context
    
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
          break;
          
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
          break;
          
        case 'var':
          // must exist
          if ( typeof _args[ i ] === 'undefined' ) return false;
          // enter into context by the provided name and remove
          __context[ name ] = _args[ i ];
          break;
          
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
          break;
        
      } // switch args[ i ].type
      
    } // var in args.length
    
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

