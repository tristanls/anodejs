var anode = require( '../lib/anode' ),
    beh = anode.beh,
    cnf = new anode.Configuration();

var format_warn_beh = beh( 'log', 'value', function () {
  send( 'my val %d', value ).to( log );
});

var warner = cnf.createActor().withBehavior( 
  format_warn_beh( cnf.console.warn, 6 ) 
);

cnf.send().to( warner );