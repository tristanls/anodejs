/*
 * configuration.test.js: Tests for actor configuration
 * 
 * (C) 2011 Tristan Slominski
 * 
 */

var anode = require( '../lib/anode' ),
    assert = require( 'assert' ),
    vows = require( 'vows' );

var configuration = new anode.Configuration();

vows.describe( 'anode/configuration' ).addBatch( {
  
  "The anode actor configuration" : {
    
    "send() method" : {
      
      "should be defined" : function () {
        
        assert.isFunction( configuration.send );
        
      } // should be defined
      
    } // send() method
    
  } // the anode actor configuration
  
}).export( module );