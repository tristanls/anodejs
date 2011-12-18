#
# http.coffee : anode wrapper around Node.js 'http' module
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'
nodehttp = require 'http'

#
# Anode wrapper around the http.clientRequest
#
clientRequest_beh = anode.beh 'request'

  'cust, #abort' : ->
    
    @request.abort()
    if @cust # ack requested
      @send( @, '#abort' ).to @cust

  'cust, #end, [data], [encoding]' : ->
    
    @request.end @data, @encoding
    if @cust # ack requested
      @send( @, '#end' ).to @cust
      
  'cust, #setNoDelay, noDelay' : ->
    
    @request.setNoDelay @noDelay
    if @cust # ack requested
      @send( @, '#setNoDelay' ).to @cust
      
  'cust, #setSocketKeepAlive, enable, [initialDelay]' : ->
    
    @request.setSocketKeepAlive @enable, @initialDelay
    if @cust # ack requested
      @send( @, '#setSocketKeepAlive' ).to @cust
      
  'cust, #setTimeout, timeout' : ->
    
    @request.setTimeout @timeout
    if @cust # ack requested
      @send( @, '#setTimeout' ).to @cust

  'cust, #write, chunk, [encoding]' : ->
    
    @request.write chunk, @encoding
    if @cust # ack requested
      @send( @, '#write' ).to @cust

#
# Anode wrapper around the http.clientResponse
#
clientResponse_beh = anode.beh '_cust', 'response'

  'cust, #headers' : ->
    
    @send( @, '#headers', @response.headers ).to @cust

  'cust, #httpVersion' : ->
    
    @send( @, '#httpVersion', @response.httpVersion ).to @cust
    
  'cust, #pause' : ->
    
    @response.pause()
    if @cust # ack requested
      @send( @, '#pause' ).to @cust
      
  'cust, #resume' : ->
    
    @response.resume()
    if @cust # ack requested
      @send( @, '#resume' ).to @cust
    
  'cust, #setEncoding, [encoding]' : ->
    
    @response.setEncoding( @encoding )
    if @cust # ack requested
      @send( @, '#setEncoding' ).to @cust

  'cust, #statusCode' : ->
    
    @send( @, '#statusCode', @response.statusCode ).to @cust
    
  'cust, #trailers' : ->
    
    @send( @, '#trailers', @response.trailers ).to @cust
    
  '$response, #close, err' : ->
    
    @send( @, '#close', @err ).to @_cust
    
  '$response, #data, chunk' : ->
    
    @send( @, '#data', @chunk ).to @_cust
    
  '$response, #end' : ->
    
    @send( @, '#end' ).to @_cust

#
# Initialized http server beh wrapped around a created server
#
initializedServer_beh = anode.beh 'server',

  # stops the server from accepting new connections
  'cust, #close' : ->
    @server.close()
    if @cust # ack requested
      @send( @, '#close' ).to @cust
      
#
# Actor wrapper around the request object that attaches the actor identity
# with each message for distinction between messages from different
# simultaneous requests
#
request_beh = anode.beh '_cust', 'req'

  'cust, #connection' : ->
    
    # TODO: implement net.Socket as actor
    @send( @, '#connection', @req.connection ).to @cust
    
  # headers
  'cust, #headers' : ->
    
    @send( @, '#headers', @req.headers ).to @cust
    
  'cust, #httpVersion' : ->
    
    @send( @, '#httpVersion', @req.httpVersion ).to @cust

  # the request method as a string
  'cust, #method' : ->

    @send( @, '#method', @req.method ).to @cust
    
  # pauses request from emitting events
  'cust, #pause' : ->
    
    @req.pause()
    if @cust # ack requested
      @send( @, '#pause' ).to @cust
      
  'cust, #resume' : ->
    
    @req.resume()
    if @cust # ack requested
      @send( @, '#resume' ).to @cust
    
  'cust, #setEncoding, encoding' : ->
    
    @req.setEncoding @encoding
    if @cust # ack requested
      @send( @, '#setEncoding' ).to @cust
    
  # trailers
  'cust, #trailers' : ->
    
    @send( @, '#trailers', @req.trailers ).to @cust
    
  # requested URL string
  'cust, #url' : ->
    
    @send( @, '#url', @req.url ).to @_cust
    
  '$req, #close' : ->

    @send( @, '#close' ).to @_cust
    
  '$req, #data, chunk' : ->

    @send( @, '#data', @chunk ).to @_cust

  '$req, #end' : ->

    @send( @, '#end' ).to @_cust
    
#
# An actor wrapper for the response object
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

    @res.writeContinue()
    if @cust # ack requested
      @send( @, '#writeContinue' ).to @cust

  'cust, #writeHead, statusCode, [reasonPhrase], [headers]' : ->

    @res.writeHead @statusCode, @reasonPhrase, @headers
    if @cust # ack requested
      @send( @, '#writeHead' ).to @cust
      
#
# An http client beh that will execute client requests
#
client_beh = anode.beh

  # get convenience method, will create a request, set method to 'GET'
  # and automatically send '#end' message to request actor
  'cust, #get, options' : ->
    
    # set method to GET
    @options.method = 'GET'
    
    # local aliases for use inside closures
    __httpClient = @
    __cust = @cust
    __send = @send
    
    clientRequest = nodehttp.request @options
    
    request_actor = @create clientRequest_beh clientRequest
    
    # all clientRequest event bindings need to happen before nextTick
    
    clientRequest.on 'response', ( response ) ->
      
      response_actor = __create clientResponse_beh __cust, response
      
      response.on 'data', ( chunk ) ->
        __send( response, '#data', chunk ).to response_actor
      response.on 'end', ->
        __send( response, '#end' ).to response_actor
      response.on 'close', ( err ) ->
        __send( response, '#close', err ).to response_actor
        
      __send( __httpClient, '#response', response_actor ).to __cust
        
    clientRequest.on 'socket', ( socket ) ->
      # TODO

    clientRequest.on 'upgrade', ( response, socket, head ) ->
      # TODO

    clientRequest.on 'continue', ->
      __send( __httpClient, '#continue' ).to __cust
      
    # create 'callback' ack actor to execute once the 'get' request has been
    # sent, it matches this specific request_actor instance via $_request
    if @cust # ack requested
      ack = @create anode.beh( '_request'

        '$_request, #end' : ->

          __send( __httpClient, '#get', @_request ).to __cust

      )( request_actor )
      
    ack = if ack then ack else undefined
    
    # send '#end' to request actor, executing the request, but give it
    # 'ack' actor ( if ack requested ) to listen for acknowledgment once '#end'
    # is executed, at which point, 'ack' will send an acknowledgment to the 
    # customer of original '#get' request
    @send( ack, '#end' ).to request_actor

  # creates the request client
  'cust, #request, options' : ->
    
    # local aliases for use inside closures
    __httpClient = @
    __cust = @cust
    __send = @send
    
    clientRequest = nodehttp.request @options
    
    request_actor = @create clientRequest_beh clientRequest
    
    # all clientRequest event bindings need to happen before nextTick

    clientRequest.on 'response', ( response ) ->
      
      response_actor = __create clientResponse_beh __cust, response
      
      response.on 'data', ( chunk ) ->
        __send( response, '#data', chunk ).to response_actor
      response.on 'end', ->
        __send( response, '#end' ).to response_actor
      response.on 'close', ( err ) ->
        __send( response, '#close', err ).to response_actor
        
      __send( __httpClient, '#response', response_actor ).to __cust
        
    clientRequest.on 'socket', ( socket ) ->
      # TODO
      
    clientRequest.on 'upgrade', ( response, socket, head ) ->
      # TODO
      
    clientRequest.on 'continue', ->
      __send( __httpClient, '#continue' ).to __cust
      
    @send( @, '#request', request_actor ).to @cust

#
# An uninitialized http server beh that will lazy-initialize the server
# and then become initialized http server beh
#
uninitializedServer_beh = anode.beh

  # creates the server and attempts to listen on given port and host
  'cust, #listen, port, [host]' : ->
    
    # local aliases for use inside closures
    __create = @create
    __cust = @cust
    __host = @host
    __http = @
    __port = @port
    __send = @send
    
    server = nodehttp.createServer()
    
    # all server event bindings need to happen before nextTick
    
    # on 'request'
    server.on 'request', ( req, res ) ->
      
      request_actor = __create request_beh __cust, req
      response_actor = __create response_beh res
      
      # all request binding needs to happen here before nextTick
      req.on 'data', ( chunk ) ->
        __send( req, '#data', chunk ).to request_actor
      req.on 'end', ->
        __send( req, '#end' ).to request_actor
      req.on 'close', ->
        __send( req, '#close' ).to request_actor
        
      __send( __http, '#request', request_actor, response_actor ).to __cust
      
    # on 'connection'
    server.on 'connection', ( socket ) ->
      # TODO
      
    # on 'close'
    server.on 'close', ->
      # TODO
      
    # on 'checkContinue'
    server.on 'checkContinue', ( req, res ) ->
      # TODO
      
    # on 'upgrade'
    server.on 'upgrade', ( request, socket, head ) ->
      # TODO
      
    # on clientError
    server.on 'clientError', ( exception ) ->
      # TODO
      
    # start listening
    if @cust # ack requested
      __callback = ->
        __send( __http, '#listen' ).to __cust
    
    @host = if @host then @host else undefined
    __callback = if __callback then __callback else undefined
    
    server.listen @port, @host, __callback
    
    @become initializedServer_beh server

#
# The request behavior for making http requests
#
exports.client_beh = client_beh

#
# The server behavior for serving http requests
#
exports.server_beh = uninitializedServer_beh