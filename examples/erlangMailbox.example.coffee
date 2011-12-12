anode = require '../lib/anode'
cnf = new anode.Configuration()
erlangMailbox = require './erlangMailbox'

# The Erlang Mailbox actor
mbox = cnf.actor 'mailbox', erlangMailbox.mailbox_beh()

cnf.send( cnf.console.log, '#recv', ( m ) -> return m != '#foo' ).to mbox
cnf.send( cnf.console.log, '#send', '#foo' ).to mbox
cnf.send( cnf.console.log, '#send', '#bar' ).to mbox
cnf.send( cnf.console.log, '#send', '#baz' ).to mbox
cnf.send( cnf.console.log, '#recv', ( m ) -> return m == '#foo' ).to mbox

# should see '#foo' and '#bar' as well as 3 logs of 'mailbox' actor