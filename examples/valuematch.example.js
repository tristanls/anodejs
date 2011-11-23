var anode = require( '../lib/anode' ),
    beh = anode.beh,
    cnf = new anode.Configuration();

var match_beh = beh( 'log', 'match', {
  '$match' : function () {
    send( 'matched' ).to( log );
  },
  '_' : function () {
    send( 'not matched' ).to( log );
  }
});

var matcher = cnf.createActor().withBehavior( match_beh( cnf.console.log, 9 ) );

cnf.send( 10 ).to( matcher );
cnf.send( 9 ).to( matcher );

var k = { some: 'thing' };
var l = { some: 'thing' };

var matcher2 = cnf.createActor().withBehavior( match_beh( cnf.console.log, k ) );

cnf.send( 10 ).to( matcher2 );
cnf.send( k ).to( matcher2 );
cnf.send( l ).to( matcher2 );

var matcher3 = cnf.createActor().withBehavior( match_beh( cnf.console.log, function () {
  return 7;
} ) );

cnf.send( 10 ).to( matcher3 );
cnf.send( 7 ).to( matcher3 );