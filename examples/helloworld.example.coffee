#
# helloworld.example.coffee : node.js inspired http server hello world example
# 
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'

# create a new actor configuration
cnf = new anode.Configuration()

# create the http actor
httpServer = cnf.actor anode.http.server_beh()

# create the hello world application actor
helloworld = cnf.actor anode.beh( 'httpServer'

  '#start' : ->
    @send( @, '#listen', 8080, '127.0.0.1' ).to @httpServer

  '$httpServer, #listen' : ->
    @send( 'Server running at http://127.0.0.1:8080/' ).to cnf.console.log
    
  '$httpServer, #request, request, response' : ->
    @send( null, '#end', 'Hello Actor World\n' ).to @response

)( httpServer ) # helloworld

cnf.send( '#start' ).to helloworld