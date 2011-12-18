/*
 * configuration.js: An anode actor configuration
 * 
 * (C) 2011 Tristan Slominski
 *
 */

var Actor = require( './actor' ).Actor,
    AsyncEventEmitter = require( 'async-events' ).AsyncEventEmitter,
    util = require( 'util' );

//
// ### function Configuration ()
// An actor configuration constructor function.
//
var Configuration = exports.Configuration = function ( options ) {
  
  var self = this;
  
  if ( ! options ) options = {};
  
  // 
  // Options
  //
  self.__debug = options.debug || false;
  
  //
  // Private configuration variables
  //
  var __actorBehaviorStore = {}, // used for storing actor behaviors
      __actorReferenceStore = {}, // used for actor address security
      __configurationUniqueId = 1, // start with one for easier boolean checks
      __bus = new AsyncEventEmitter();
  
  //
  // ### function createActor
  // Creates an actor bound to the configuration
  //
  self.createActor = function () {
    
    var actor = new Actor( self );
    
    actor.__uid = __configurationUniqueId++;
    
    // store the object reference for address tampering check
    __actorReferenceStore[ actor.__uid ] = actor;
    
    // register this actor to listen for events
    __bus.on( actor.__uid + '::message', function () {
      actor.__handle.apply( actor, arguments );
    });
    
    return actor;
    
  }; // createActor
  
  //
  // ### function actor
  // Syntactic sugar allowing naming actors
  //  cnf.actor( 'mine', beh() )
  //  cnf.actor( beh() )
  //
  self.actor = function( name, behavior ) {
        
    if ( typeof name === 'function' ) {
      behavior = name;
      name = null;
    }
    
    var actor = self.createActor().withBehavior( behavior );
    
    if ( name && typeof name === 'string' )
      actor.__name = name;
    
    return actor;
    
  };
  
  //
  // ### function __send ()
  // Sends a message to the specified actor(s)
  //
  self.__send = function ( actors ) {
    
    if ( ! _validateActorsParam( actors ) )
      throw new Error( 'Invalid actor(s) specified for receipt of message :\n' +
        util.inspect( actors ) );
    
    var args = Array.prototype.slice.call( arguments );
    
    // get rid of the 'actors' param from the arguments
    args.shift();
    
    if ( actors instanceof Array ) {
      
      // send message to each actor
      for ( var i = 0; i < actors.length; i++ ) {
        
        var actor = actors[ i ];
        
        // copy arguments for this message
        var _args = Array.prototype.slice.call( args, 0 );
        
        if ( self.__debug ) _logMessage( actor, _args );
        
        // add address of the actor
        _args.unshift( actor.__uid + '::message' );
        // emit the message
        __bus.emit.apply( __bus, _args );
        
      } // for i in actors.length
      
    } // if actors is Array
    else {
      
      if ( self.__debug ) _logMessage( actors, args );
      
      // add address of the actor
      args.unshift( actors.__uid + '::message' );
      // emit the message
      __bus.emit.apply( __bus, args );
      
    } // else actors is one actor
    
  }; // __send
  
  //
  // ### function __handle ( actor, behavior, args )
  // #### @actor {object} actor who's behavior is to be executed
  // #### @behavior {function} behavior to be executed
  // #### @args {array} argument array for the behavior function
  // Executes an actor's behavior
  //
  self.__handle = function ( actor, behavior, args ) {
    
    if ( ! _validateActor( actor, __actorReferenceStore ) ) 
      throw new Error();
    if ( ! _validateActorBehavior( actor, behavior, __actorBehaviorStore ) )
      throw new Error();
    
    behavior.apply( actor, args );
    
  }; // __handle
  
  //
  // ### function __register ( actor, behavior )
  // #### @actor {object} an actor who's behavior will be registered
  // #### @behavior {function} behavior to register for the actor
  //
  self.__register = function ( actor, behavior ) {
    
    if ( ! _validateActor( actor, __actorReferenceStore ) )
      throw new Error();
    
    __actorBehaviorStore[ actor.__uid ] = behavior;
    
  }; // __register
  
  //
  // actor wrapper around node console
  //
  self.console = {};
  
  var log = self.actor( function () {
    console.log.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.log = log;
  self.console.info = log;
  
  var warn = self.actor( function () {
    console.warn.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.warn = warn;
  self.console.error = warn;
  
  var dir = self.actor( function () {
    console.dir.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.dir = dir;
  
  var time = self.actor( function () {
    console.time.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.time = time;
  
  var timeEnd = self.actor( function () {
    console.timeEnd.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.timeEnd = timeEnd;
  
  var trace = self.actor( function () {
    console.trace.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.trace = trace;
  
  var assert = self.actor( function () {
    console.assert.apply( this, Array.prototype.slice.call( arguments ) );
  });
  
  self.console.assert = assert;
  
}; // Configuration

//
// ### function send
// Wrapper around __send method to enable send( msg ).to( actor ) semantics
//
Configuration.prototype.send = function () {
  
  var self = this,
      _args = Array.prototype.slice.call( arguments );
  
  return {
    
    to : function ( actors ) {
      
      Array.prototype.unshift.call( _args, actors );
      self.__send.apply( self, _args );
      
    } // to
    
  }; // intialized send without actors to call
  
}; // send

var _logMessage = function ( to, message ) {
  
  var header = 'message to [';
  if ( to.__name )
    header += to.__name + '::';
  header += to.__uid + '] :'
  
  var msg = [];
  
  for ( var i = 0; i < message.length; i++ ) {
    
    var portion = message[ i ];
    var partialMsg = '';
    
    if ( portion instanceof Actor ) {
      
      partialMsg = '[';
      
      if ( portion.__name )
        partialMsg += portion.__name + '::';
      
      partialMsg += portion.__uid + ']';
      
    } // if portion instanceof Actor
    else {
      
      partialMsg = portion ? portion.toString() : '';
      
    } // else
    
    msg.push( partialMsg );
    
  } // for i in message.length
  
  console.log( header, msg );
  
}; // _logMessage

//
// ### function _validateActor ( actor, referenceStore )
// #### @actor {object} an Actor instance to be validated
// #### @referenceStore {object} actor reference store to be validated against
// Validates the actor against actor reference store
//
var _validateActor = function ( actor, referenceStore ) {
  
  if ( actor && actor.__uid && referenceStore[ actor.__uid ] === actor )
    return true;
  
  return false;
  
}; // _validateActor

//
// ### function _validateActorBehavior ( actor, behavior, behaviorStore )
// #### @actor {object} an Actor instance who's behavior is being validated
// #### @behavior {function} behavior function to be validated
// #### @behaviorStore {object} actor behavior store to be validated against
// Validates the actor behavior against actor behavior store
//
var _validateActorBehavior = function ( actor, behavior, behaviorStore ) {
  
  if ( ! behavior && actor && actor.__uid && ! behaviorStore[ actor.__uid ] ) 
    return true;
  
  // if behavior is defined it should be a function
  if ( ! ( behavior instanceof Function ) ) 
    throw new Error( 'Behavior should be a function' );
  
  if ( actor && actor.__uid && behaviorStore[ actor.__uid ] === behavior )
    return true;
  
  return false;
  
}; // _validateActorBehavior

//
// ### function _validateActorsParam ( actors )
// #### @actors {object||array} either a single Actor instance or an array of
//      Actor instances
// Validates the 'actors' parameter for __send() method
//
var _validateActorsParam = function ( actors ) {
  
  if ( ! actors ) return false;
  
  if ( ! ( actors instanceof Actor ) && ! ( actors instanceof Array ) ) 
    return false;
  
  if ( actors instanceof Array ) {
    
    actors = Array.prototype.slice.call( actors );
    
    for ( var i = 0; i < actors.length; i++ ) {
      
      if ( ! ( actors[ i ] instanceof Actor ) ) return false;
      
    } // for i in actors.length
    
  } // if actors instanceof Array
  
  return true;
  
}; // _validateActorsParam