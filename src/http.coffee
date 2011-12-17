#
# http.coffee : anode wrapper around nodejs http library
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'
nodehttp = require 'http'

#
# Behavior controlling the server
#
httpServer_beh = anode.beh 'server'
  
  # issue 'listen' command to the server
  'cust, #listen, port, [host]' : ->
    
    __cust = @cust
    __host = @host
    __httpServer = @
    __port = @port
    __send = @send
    
    if @cust # ack requested
      if @host
        __callback = () ->
          __send( __httpServer, '#listening', __port, __host ).to __cust
      else
        __callback = () ->
          __send( __httpServer, '#listening', __port ).to __cust
          
    @host = if @host then @host else undefined
    __callback = if __callback then __callback else undefined
    @server.listen @port, @host, __callback
      
#
# The main http_beh wrapping node.js 'http' functionality
#
exports.http_beh = anode.beh
 
 'cust, #createServer' : ->
   
   __create = @create
   __cust = @cust
   __send = @send
   
   server = nodehttp.createServer()
   
   server_actor = @create httpServer_beh server, @cust
   
   server.on 'request', ( req, res ) ->
     
     request_actor = __create request_beh __cust, req
     response_actor = __create response_beh res
     
     # all request binding need to happen here before nextTick
     req.on 'data', ( chunk ) ->
       __send( req, '#data', chunk ).to request_actor
     req.on 'end', ->
       __send( req, '#end' ).to request_actor
     req.on 'close', ->
       __send( req, '#close' ).to request_actor
       
     __send( server_actor, '#request', request_actor, response_actor ).to __cust
    
   server.on 'connection', ( socket ) ->
     # TODO review what should happen here
     __send( server_actor, '#socket', socket ).to __cust
    
   server.on 'close', ->
     # TODO
    
   server.on 'checkContinue', ( req, res ) ->
     # TODO
    
   server.on 'upgrade', ( request, socket, head ) ->
     # TODO
    
   server.on 'clientError', ( exception ) ->
     # TODO
    
   @send( @, '#created', server_actor ).to @cust
      
#
# Actor wrapper around the request object that attaches the actor identity
# with each message for distinction between messages from different
# simultaneous requests
#
request_beh = anode.beh 'cust', 'req'

  '$req, #data, chunk' : ->

    @send( @, '#data', @chunk ).to @cust
  
  '$req, #end' : ->
    
    @send( @, '#end' ).to @cust
    
  '$req, #close' : ->
    
    @send( @, '#close' ).to @cust
    
  'cust, #method' : ->
    
    @send( @, '#method', @req.method ).to @cust
    
#
# What can I say, it's a wrapper for response object
#
response_beh = anode.beh 'res'

  'cust, #addTrailers, headers' : ->
    
    @res.addTrailers @headers
    if @cust # ack requested
      @send( @, '#addTrailers' ).to @cust
      
  'cust, #end, [data], [encoding]' : ->
    
    @res.end @data, @encoding
    if @cust # ack requested
      @send( @, '#end' ).to @cust
      
  'cust, #getHeader, name' : ->
    
    @send( @, '#header', @res.getHeader @name ).to @cust
    
  'cust, #removeHeader, name' : ->
    
    @res.removeHeader @name
    if @cust # ack requested
      @send( @, '#removeHeader' ). to @cust

  'cust, #setHeader, name, value' : ->
    
    @res.setHeader @name, @value
    if @cust # ack requested
      @send( @, '#setHeader' ).to @cust

  'cust, #statusCode, statusCode' : ->
    
    @res.statusCode @statusCode
    if @cust # ack requested
      @send( @, '#statusCode' ).to @cust
      
  'cust, #write, chunk, [encoding]' : ->
    
    @res.write @chunk, @encoding
    if @cust # ack requested
      @send( @, '#write' ).to @cust

  'cust, #writeContinue' : ->
    
    @res.wwriteContinue()
    if @cust # ack requested
      @send( @, '#writeContinue' ).to @cust
      
  'cust, #writeHead, statusCode, [reasonPhrase], [headers]' : ->
    
    @res.writeHead @statusCode, @reasonPhrase, @headers
    if @cust # ack requested
      @send( @, '#writeHead' ).to @cust