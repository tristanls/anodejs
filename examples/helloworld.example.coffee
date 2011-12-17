#
# helloworld.example.coffee : node.js inspired http server hello world example
# 
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'
require 'coffee-script' # allows direct 'require' of coffee files
http = require '../src/http'

# create a new actor configuration
cnf = new anode.Configuration()

# create the http actor
http_actor = cnf.actor http.http_beh()

# create the hello world actor
helloworld = cnf.actor anode.beh(

  'http, #created, server' : ->
    @send( @, '#listen', 8080, '127.0.0.1' ).to @server
    
  'server, #listening, port, host' : ->
    @send( 'Server running at http://' + @host + ':' + @port + '/' ).to \
      cnf.console.log
    
  'server, #request, request, response' : ->
    @send( null, '#end', 'Hello Actor World\n' ).to @response

)() # helloworld

# send the #createServer message to http actor with helloworld as the customer
# for the '#created' message
cnf.send( helloworld, '#createServer' ).to http_actor