(function() {
  var anode, cnf, erlangMailbox, mbox;
  anode = require('../lib/anode');
  cnf = new anode.Configuration();
  erlangMailbox = require('./erlangMailbox');
  mbox = cnf.actor('mailbox', erlangMailbox.mailbox_beh());
  cnf.send(cnf.console.log, '#recv', function(m) {
    return m !== '#foo';
  }).to(mbox);
  cnf.send(cnf.console.log, '#send', '#foo').to(mbox);
  cnf.send(cnf.console.log, '#send', '#bar').to(mbox);
  cnf.send(cnf.console.log, '#send', '#baz').to(mbox);
  cnf.send(cnf.console.log, '#recv', function(m) {
    return m === '#foo';
  }).to(mbox);
}).call(this);
