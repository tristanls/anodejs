(function() {
  var anode, beh, cnf, k, l, match_beh, matcher, matcher2, matcher3;
  anode = require('../lib/anode');
  beh = anode.beh;
  cnf = new anode.Configuration();
  match_beh = beh('log', 'match', {
    '$match': function() {
      return this.send('matched').to(this.log);
    },
    '_': function() {
      return this.send('not matched').to(this.log);
    }
  });
  matcher = cnf.actor(match_beh(cnf.console.log, 9));
  cnf.send(10).to(matcher);
  cnf.send(9).to(matcher);
  k = {
    some: 'thing'
  };
  l = {
    some: 'thing'
  };
  matcher2 = cnf.actor(match_beh(cnf.console.log, k));
  cnf.send(10).to(matcher2);
  cnf.send(k).to(matcher2);
  cnf.send(l).to(matcher2);
  matcher3 = cnf.actor(match_beh(cnf.console.log, function() {
    return 7;
  }));
  cnf.send(10).to(matcher3);
  cnf.send(7).to(matcher3);
}).call(this);
