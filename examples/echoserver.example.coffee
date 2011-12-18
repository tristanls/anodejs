#
# echoserver.example.coffee : Node.js inspired net server echo server example
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'

# create a new actor configuration
cnf = new anode.Configuration debug : true

# create the net actor
netServer = cnf.actor 'netServer', anode.net.server_beh()

# create the echo server application actor
echoServer = cnf.actor 'echoServer', anode.beh( 'netServer'

  '#start' : ->
    
    @send( @, '#listen', 8124 ).to @netServer
    
  '$netServer, #listen' : ->
    
    @send( 'server bound' ).to cnf.console.log
    
  '$netServer, #connection, socket' : ->
    
    @send( 'server connected' ).to cnf.console.log
    
    # request ack after #write completes by including self (@)
    @send( @, '#write', 'hello\r\n' ).to @socket
    
  'socket, #end' : ->
    
    @send( 'server disconnected' ).to cnf.console.log
    
  # once socket gives us its socket object
  'socket, #socket, socketObj' : ->
    
    # pipe the socket to itself to echo
    @send( null, '#pipe', @socketObj ).to @socket
    
  # write ack
  'socket, #write, _' : ->
    
    # request the actual socket object so we can pipe to it
    @send( @, '#socket' ).to @socket

)( netServer ) # echoServer

cnf.send( '#start' ).to echoServer