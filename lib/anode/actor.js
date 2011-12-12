/*
 * actor.js: An anode actor
 * 
 * (C) 2011 Tristan Slominski
 *
 */
var behavior = require( './behavior' ).behavior,
    vm = require( 'vm' );

//
// ### function Actor ( configuration )
// #### @configuration {object} an anode Configuration to which to attach this
//      Actor
// Creates a new Actor in the given configuration
//
var Actor = exports.Actor = function ( configuration ) {
  
  var self = this;
  
  //
  // Private actor variables
  //
  var __behavior = undefined,
      __behaviorInitialized = false,
      __configuration = configuration,
      __isHandlingMessage = false,
      __newBehavior = undefined,
      __newBehaviorPending = false;
  
  // 
  // ### function __handle
  // Called by the configuration when a message is passed to the actor
  //
  self.__handle = function () {
    
    // check if actor became something else last time, and implement new
    //  behavior if that is the case
    if ( __newBehaviorPending ) {
      
      __behavior = __newBehavior;
      __configuration.__register( self, __behavior );
      __behaviorInitialized = true;
      __newBehavior = undefined;
      __newBehaviorPending = false;
      
    } // if __newBehaviorPending
    
    __isHandlingMessage = true;
    __configuration.__handle( self, __behavior, arguments );
    __isHandlingMessage = false;
    
  }; // __handle
  
  // 
  // ### function become ( behavior )
  // #### @behavior {function} new behavior to execute on next message
  // Becomes an actor with a different behavior
  //
  self.become = function ( behavior ) {
    
    if ( ! ( behavior instanceof Function ) ) 
      throw new Error( 'Behavior must be a function' );
    
    // need to make sure that behavior is not changed in the middle of an actor
    //  executing another behavior but before handling another message
    if ( __newBehaviorPending ) throw new Error( 'Become can only be called ' +
      'once in an actor behavior' );
    
    // can only be called from within the actor itself and not by some other
    //  actor
    if ( ! __isHandlingMessage ) throw new Error( 'Security exception ' +
      '(are you trying to call become() on some other actor?)' );
    
    __newBehavior = behavior;
    __newBehaviorPending = true;
    
  }; // become
  
  self.behavior = behavior;
  
  self.beh = self.behavior; // alias
  
  //
  // ### function create
  // Wrapper around configuration's createActor method to make actor creation
  // accessible within an actor via 'this'
  //
  self.create = __configuration.actor;
  
  //
  // ### function raw ( args )
  // An alias for this.send.apply( self, args );
  //
  self.raw = function ( args ) {
   
   return self.send.apply( this, args );
   
  }; // raw
  
  //
  // ### function send
  // Wrapper around configuration's send method to make it accessible to the
  // behavior via 'this'. Enables send( msg ).to( actor ) semantics
  //
  self.send = function () {
    
    var _args = Array.prototype.slice.call( arguments );
    
    return {
      
      to : function ( actors ) {
        
        Array.prototype.unshift.call( _args, actors );
        __configuration.__send.apply( __configuration, _args );
        
      } // to
      
    }; // initialized send without actors to call
    
  }; // send
  
  //
  // ### withBehavior ( behavior )
  // #### @behavior {function} behavior to initialize actor with
  // Initializes actor behavior (allowed only once per actor)
  //
  self.withBehavior = function ( behavior ) {
    
    if ( ! ( behavior instanceof Function ) )
      throw new Error( 'Behavior must be a function' );
    
    if ( __behaviorInitialized )
      throw new Error( 'Behavior can only be intialized once' );
    
    __behavior = behavior;
    __configuration.__register( self, __behavior );
    __behaviorInitialized = true;
    
    return self;
    
  }; // withBehavior
  
}; // Actor