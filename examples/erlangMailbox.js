var anode = require( '../lib/anode' ),
    beh = anode.beh;

var ErlangMailbox = exports;

//
// Initial lazy-initialization mailbox behavior
//
ErlangMailbox.mailbox_beh = beh( 'mailbox', function () {
  
  var next = create().withBehavior( mailbox.end_mailbox_beh( mailbox, this ) );
  become( mailbox.root_mailbox_beh( mailbox, next ) );
  raw( _ ).to( this );
  
}); // mailbox_beh

//
// End mailbox behavior
//
ErlangMailbox.end_mailbox_beh = beh( 'mailbox', 'root', {
  
  'cust, #recv, pred' : function () {
    
    var next = create().withBehavior( mailbox.end_mailbox_beh( mailbox, root ) );
    become( mailbox.recv_mailbox_beh( mailbox, root, cust, pred, next ) );
    
  }, // cust, #recv, pred
  
  'cust, #send, m' : function () {
    
    var next = create().withBehavior( mailbox.end_mailbox_beh( mailbox, root ) );
    become( mailbox.send_mailbox_beh( mailbox, root, m, next ) );
    send( root ).to( cust );
    
  } // cust, #send, m
  
}); // end_mailbox_beh

//
// Receive mailbox behavior
//
ErlangMailbox.recv_mailbox_beh = beh( 'mailbox', 'root', 'cust', 'pred', 'next', {
  
  'cust2, #send, m' : function () {
    
    if ( pred( m ) ) {
      
      send( m ).to( cust );
      become( mailbox.skip_mailbox_beh( next ) );
      send( this, '#prune', next ).to( root );
      send( root ).to( cust2 );
      
    } else {
      
      raw( _ ).to( next );
      
    }
    
  }, // cust2, #send, m
  
  '$next, #prune, next2' : function () {
    
    become( mailbox.recv_mailbox_beh( mailbox, root, cust, pred, next2 ) );
    
  }, // $next, #prune, next2
  
  '_' : function () {
    
    raw( _ ).to( next );
    
  } // _
  
}); // recv_mailbox_beh

//
// Root mailbox behavior
//
ErlangMailbox.root_mailbox_beh = beh( 'mailbox', 'next', {
  
  '$next, #prune, next2' : function () {
    
    become( mailbox.root_mailbox_beh( mailbox, next2 ) );
    
  }, // $next, #prune, next2
  
  '_' : function () {
    
    raw( _ ).to( next );
    
  } // _
  
}); // root_mailbox_beh

//
// Send mailbox behavior
//
ErlangMailbox.send_mailbox_beh = beh( 'mailbox', 'root', 'm', 'next', {
  
  'cust, #recv, pred' : function () {
    
    if ( pred( m ) ) {
      
      send( m ).to( cust );
      become( mailbox.skip_mailbox_beh( mailbox, next ) );
      send( this, '#prune', next ).to( root );
      
    } else {
      
      raw( _ ).to( next );
      
    }
    
  }, // cust, #recv, pred
  
  '$next, #prune, next2' : function () {
    
    become( mailbox.send_mailbox_beh( mailbox, root, m, next2 ) );
    
  }, // $next, '#prune', next2
  
  '_' : function () {
    
    raw( _ ).to( next );
    
  } // _
  
}); // send_mailbox_beh

//
// Skip mailbox behavior
//
ErlangMailbox.skip_mailbox_beh = beh( 'mailbox', 'next', {
  
  '$next, #prune, next2' : function () {
    
    become( mailbox.skip_mailbox_beh( mailbox, next2 ) );
    
  }, // $next, #prune, next2
  
  '_' : function () {
    
    raw( _ ).to( next );
    
  } // _
  
}); // skip_mailbox_beh