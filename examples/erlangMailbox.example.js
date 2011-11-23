var anode = require( '../lib/anode' ),
    cnf = new anode.Configuration(),
    erlangMailbox = require( './erlangMailbox' );

//
// The Erlang Mailbox actor
//
var mbox = 
  cnf.createActor().withBehavior( erlangMailbox.mailbox_beh( erlangMailbox ) );

cnf.send( cnf.console.log, '#recv', function ( m ) { return m != '#foo'; } )
  .to( mbox );
cnf.send( cnf.console.log, '#send', '#foo' ).to( mbox );
cnf.send( cnf.console.log, '#send', '#bar' ).to( mbox );
cnf.send( cnf.console.log, '#send', '#baz' ).to( mbox );
cnf.send( cnf.console.log, '#recv', function ( m ) { return m == '#foo'; } )
  .to( mbox );

// should see 2 logs of #foo and #bar and 3 logs of references to actors
//
//  { __handle: [Function],
//    become: [Function],
//    create: [Function],
//    raw: [Function],
//    send: [Function],
//    withBehavior: [Function],
//    __uid: 8 }
//  #foo
//  { __handle: [Function],
//    become: [Function],
//    create: [Function],
//    raw: [Function],
//    send: [Function],
//    withBehavior: [Function],
//    __uid: 8 }
//  #bar
//  { __handle: [Function],
//    become: [Function],
//    create: [Function],
//    raw: [Function],
//    send: [Function],
//    withBehavior: [Function],
//    __uid: 8 }