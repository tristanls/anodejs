(function() {
  var anode, beh, cnf, format_warn_beh, warner;
  anode = require('../lib/anode');
  beh = anode.beh;
  cnf = new anode.Configuration();
  format_warn_beh = beh('log', 'value', function() {
    return this.send('my val %d', this.value).to(this.log);
  });
  warner = cnf.actor(format_warn_beh(cnf.console.warn, 6));
  cnf.send().to(warner);
}).call(this);
