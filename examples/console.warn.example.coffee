anode = require '../lib/anode'
beh = anode.beh
cnf = new anode.Configuration()

format_warn_beh = beh 'log', 'value', ->
  @send( 'my val %d', @value ).to @log
  
warner = cnf.actor format_warn_beh cnf.console.warn, 6

cnf.send().to warner
# should print 'my val 6'

obj =
  foo : 'bar'
  
cnf.send( obj ).to cnf.console.log
# should log 'obj' 