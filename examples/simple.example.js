var anode = require( '../lib/anode' ),
    beh = anode.beh;

var cnf = new anode.Configuration();

var counter_beh = beh( 'log', 'value', function () {
  send( value ).to( log );
}); // behavior

var counter_0 = cnf.createActor().withBehavior( 
  counter_beh( cnf.console.log, 0 ) 
);

cnf.send( '#get' ).to( counter_0 );

var counter2_beh = beh( 'value', {
  'cust, #get' : function () {
    send( value ).to( cust ); 
  }
});

var counter_2 = cnf.createActor().withBehavior( counter2_beh( 7 ) );

cnf.send( cnf.console.log, '#get' ).to( counter_2 );

var become_beh = beh( 'log', 'counter_beh', function () {
  become( counter_beh( log, 13 ) );
});

var become_a = cnf.createActor().withBehavior( 
  become_beh( cnf.console.log, counter_beh ) 
);

cnf.send( '#get' ).to( become_a );
cnf.send( '#get' ).to( become_a );