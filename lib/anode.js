/*
 * anode.js: Wrapper for anode exports
 * 
 * (C) 2011 Tristan Slominski
 *
 */

var anode = exports;

require( 'pkginfo' )( module, 'version' );

//
// anode core
//
anode.Actor = require( './anode/actor' ).Actor;
anode.behavior = require( './anode/behavior' ).behavior;
anode.beh = anode.behavior; // alias
anode.Configuration = require( './anode/configuration' ).Configuration;