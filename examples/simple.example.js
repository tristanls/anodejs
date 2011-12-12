(function() {
  var anode, become_a, become_beh, beh, cnf, counter7_beh, counter_0, counter_7, counter_beh;
  anode = require('../lib/anode');
  beh = anode.beh;
  cnf = new anode.Configuration();
  counter_beh = beh('log', 'value', function() {
    return this.send(this.value).to(this.log);
  });
  counter_0 = cnf.actor(counter_beh(cnf.console.log, 0));
  cnf.send('#get').to(counter_0);
  counter7_beh = beh('value', {
    'cust, #get': function() {
      return this.send(this.value).to(this.cust);
    }
  });
  counter_7 = cnf.actor(counter7_beh(7));
  cnf.send(cnf.console.log, '#get').to(counter_7);
  become_beh = beh('log', function() {
    return this.become(counter_beh(this.log, 13));
  });
  become_a = cnf.actor(become_beh(cnf.console.log));
  cnf.send('#get').to(become_a);
  cnf.send('#get').to(become_a);
}).call(this);
