/*
 * anode.js: Wrapper for anode exports
 * 
 * (C) 2011 Tristan Slominski
 *
 */

var anode = exports;

require( 'pkginfo' )( module, 'version' );

anode.Configuration = require( './anode/configuration' ).Configuration;