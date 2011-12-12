anode = require '../lib/anode'
beh = anode.beh

cnf = new anode.Configuration()

counter_beh = beh 'log', 'value', ->
  @send( @value ).to @log
  
counter_0 = cnf.actor counter_beh cnf.console.log, 0

cnf.send( '#get' ).to counter_0
# should print 0

counter7_beh = beh 'value',
  'cust, #get' : ->
    @send( @value ).to @cust
    
counter_7 = cnf.actor counter7_beh 7

cnf.send( cnf.console.log, '#get' ).to counter_7
# should print 7

become_beh = beh 'log', ->
  @become counter_beh @log, 13
  
become_a = cnf.actor become_beh cnf.console.log

cnf.send( '#get' ).to become_a
# should see nothing because actor become was called
cnf.send( '#get' ).to become_a
# should print 13