/*
 * anode.js: Wrapper for anode exports
 * 
 * (C) 2011 Tristan Slominski
 *
 */
require( 'coffee-script' ); // allow requiring .coffee modules directly

var anode = exports;

require( 'pkginfo' )( module, 'version' );

//
// anode core
//
anode.Actor = require( './anode/actor' ).Actor;
anode.behavior = require( './anode/behavior' ).behavior;
anode.beh = anode.behavior; // alias
anode.Configuration = require( './anode/configuration' ).Configuration;

//
// anode assert
//
anode.assert = require( '../src/assert.coffee' );

//
// anode http
//
anode.http = require( '../src/http.coffee' );

//
// anode net
//
anode.net = require( '../src/net.coffee' );