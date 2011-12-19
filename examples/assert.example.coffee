#
# assert.example.coffee : an example of built-in anode configuration assert
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'

cnf = new anode.Configuration debug : true

thrower = ->
  throw new Error( 'error' )
  
ack = cnf.actor 'ack actor', anode.beh(

  'assert, #throws' : ->
    
    @send( '#throws assertion passed' ).to cnf.console.log

    # now assert something that will break
    @send( @, @_, '#ok', false ).to cnf.assert

)()

cnf.send( ack, null, '#throws', thrower ).to cnf.assert