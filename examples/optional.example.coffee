anode = require '../lib/anode'

cnf = new anode.Configuration()

optional_beh = anode.beh
  'number, [optional]' : ->
    if @optional
      @send( @number + ' -> ' + @optional ).to cnf.console.log
    else
      @send( @number + ' ::' ).to cnf.console.log
      
optional = cnf.actor optional_beh()

cnf.send( 7 ).to optional
cnf.send( 8, 'opt' ).to optional