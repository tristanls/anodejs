anode = require '../lib/anode'
beh = anode.beh
cnf = new anode.Configuration()

match_beh = beh 'log', 'match', 
  '$match' : ->
    @send( 'matched' ).to @log
  '_' : ->
    @send( 'not matched' ).to @log
    
matcher = cnf.actor match_beh cnf.console.log, 9

cnf.send( 10 ).to matcher
# should print 'not matched'
cnf.send( 9 ).to matcher
# should print 'matched'

k = some : 'thing'
l = some : 'thing'

matcher2 = cnf.actor match_beh cnf.console.log, k

cnf.send( 10 ).to matcher2
# should print 'not matched'
cnf.send( k ).to matcher2
# should print 'matched'
cnf.send( l ).to matcher2
# should print 'not matched'

matcher3 = cnf.actor match_beh cnf.console.log, -> return 7

cnf.send( 10 ).to matcher3
# should print 'not matched'
cnf.send( 7 ).to matcher3
# should print 'matched'