anode = require '../lib/anode'
beh = anode.beh

ErlangMailbox = exports

# Initial lazy-initialization mailbox behavior
ErlangMailbox.mailbox_beh = beh ->
  next = @create ErlangMailbox.end_mailbox_beh @
  @become ErlangMailbox.root_mailbox_beh next
  @raw( @_ ).to @
  
# End mailbox behavior
ErlangMailbox.end_mailbox_beh = beh 'root',
  'cust, #recv, pred' : ->
    next = @create ErlangMailbox.end_mailbox_beh @root
    @become ErlangMailbox.recv_mailbox_beh @root, @cust, @pred, next
  'cust, #send, m' : ->
    next = @create ErlangMailbox.end_mailbox_beh @root
    @become ErlangMailbox.send_mailbox_beh @root, @m, next
    @send( @root ).to @cust
    
# Receive mailbox behavior
ErlangMailbox.recv_mailbox_beh = beh 'root', 'cust', 'pred', 'next',
  'cust2, #send, m' : ->
    if @pred @m
      @send( @m ).to @cust
      @become ErlangMailbox.skip_mailbox_beh @next
      @send( @, '#prune', @next ).to @root
      @send( @root ).to @cust2
    else
      @raw( @_ ).to @next
  '$next, #prune, next2' : ->
    @become ErlangMailbox.recv_mailbox_beh @root, @cust, @pred, @next2
  '_' : ->
    @raw( @_ ).to @next
    
# Root mailbox behavior
ErlangMailbox.root_mailbox_beh = beh 'next',
  '$next, #prune, next2' : ->
    @become ErlangMailbox.root_mailbox_beh @next2
  '_' : ->
    @raw( @_ ).to @next
    
# Send mailbox behavior
ErlangMailbox.send_mailbox_beh = beh 'root', 'm', 'next',
  'cust, #recv, pred' : ->
    if @pred @m
      @send( @m ).to @cust
      @become ErlangMailbox.skip_mailbox_beh @next
      @send( @, '#prune', @next ).to @root
    else
      @raw( @_ ).to @next
  '$next, #prune, next2' : ->
    @become ErlangMailbox.send_mailbox_beh @root, @m, @next2
  '_' : ->
    @raw( @_ ).to @next
    
# Skip mailbox behavior
ErlangMailbox.skip_mailbox_beh = beh 'next',
  '$next, #prune, next2' : ->
    @become ErlangMailbox.skip_mailbox_beh @next2
  '_' : ->
    @raw( @_ ).to @next