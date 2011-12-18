#
# net.coffee : anode wrapper around Node.js net library
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'
nodenet = require 'net'

#
# Initialized net server behavior wrapped around a created server
#
initializedServer_beh = anode.beh 'server'

  'cust, #address' : ->
    
    @send( @, '#address', @server.address() ).to @cust

  'cust, #close' : ->
    
    __cust = @cust
    __send = @send
    __server = @
    
    if @cust # ack requested
      @server.on 'close', ( had_error ) ->
        __send( __server, '#close' ).to __cust
        
    @server.close()
    
  'cust, #connections' : ->
    
    @send( @, '#connections', @server.connections ).to @cust
    
  'cust, #maxConnections, [num]' : ->
    
    if @num # setter
      @server.maxConnections = @num
      if @cust # ack requested
        @send( @, '#maxConnections' ).to @cust
    else # getter
      @send( @, '#maxConnections', @server.maxConnections ).to @cust

  'cust, #pause, msecs' : ->
    
    @server.pause @msecs
    if @cust # ack requested
      @send( @, '#pause' ).to @cust

#
# An uninitialized net server beh that will lazy-initialize the server
# and then become initialized net server beh
#
uninitializedServer_beh = anode.beh

  # creates the server and attempts to listen on given port and host
  'cust, #listen, port, [host], [options]' : ->
    
    # local aliases for use inside closures
    __create = @create
    __cust = @cust
    __net = @
    __send = @send
    
    if @options
      server = nodenet.createServer @options
    else
      server = nodenet.createServer()
    
    if @cust # ack requested
      __callback = ->
        __send( __net, '#listen' ).to __cust
    
    # all server event bindings need to happen before nextTick
    
    server.on 'close', ->
      __send( __net, '#close' ).to __cust
    
    server.on 'connection', ( socket ) ->
      
      socket_actor = __create 'socket', socket_beh __cust, socket
      
      # all socket bindings need to happen before nextTick
      socket.on 'close', ( had_error ) ->
        __send( socket, '#close', had_error ).to socket_actor
      socket.on 'connect', ->
        __send( socket, '#connect' ).to socket_actor
      socket.on 'data', ( data ) ->
        __send( socket, '#data', data ).to socket_actor
      socket.on 'drain', ->
        __send( socket, '#drain' ).to socket_actor
      socket.on 'end', ->
        __send( socket, '#end' ).to socket_actor
      socket.on 'error', ( exception ) ->
        __send( socket, '#error', exception ).to socket_actor
      socket.on 'timeout', ->
        __send( socket, '#timeout' ).to socket_actor
        
      __send( __net, '#connection', socket_actor ).to __cust  
      
    server.on 'error', ( exception ) ->
      __send( __net, '#error', exception ).to __cust
    
    server.on 'listening', ->
      if __callback then __callback()
      
    @host = if @host then @host else undefined
    
    server.listen @port, @host
      
    @become initializedServer_beh server
      
#
# An actor behavior wrapper around Node.js Socket
#
socket_beh = anode.beh '_cust', 'socket'

  # attempt to match the explicit $socket first before trying generic 'cust'

  '$socket, #close, had_error' : ->
  
    @send( @, '#close', @had_error ).to @_cust
  
  '$socket, #connect' : ->
  
    @send( @, '#connect' ).to @_cust
  
  '$socket, #data, data' : ->
  
    @send( @, '#data', @data ).to @_cust
  
  '$socket, #drain' : ->
  
    @send( @, '#drain' ).to @_cust
  
  '$socket, #end' : ->
  
    @send( @, '#end' ).to @_cust
  
  '$socket, #error, exception' : ->
  
    @send( @, '#error', @exception ).to @_cust
  
  '$socket, #timeout' : ->
  
    @send( @, '#timeout' ).to @_cust

  'cust, #address' : ->
    
    @send( @, '#address', @socket.address() ).to @cust

  'cust, #bufferSize' : ->
    
    @send( @, '#bufferSize', @socket.bufferSize ).to @cust
    
  'cust, #bytesRead' : ->
    
    @send( @, '#bytesRead', @socket.bytesRead ).to @cust
    
  'cust, #bytesWritten' : ->
    
    @send( @, '#bytesWritten', @socket.bytesWritten ).to @cust
    
  'cust, #destroy' : ->
    
    @socket.destroy()
    if @cust # ack requested
      @send( @, '#destroy' ).to @cust
    
  'cust, #end, [data], [encoding]' : ->
    
    @socket.end @data, @encoding
    if @cust # ack requested
      @send( @, '#end' ).to @cust
      
  'cust, #pause' : ->
    
    @socket.pause()
    if @cust # ack requested
      @send( @, '#pause' ).to @cust
      
  # Stream method ( should there be a way of behavior composition? )
  'cust, #pipe, destination, [options]' : ->
    
    @socket.pipe @destination, @options
    if @cust # ack requested
      @send( @, '#pipe' ).to @cust
      
  'cust, #remoteAddress' : ->
    
    @send( @, '#remoteAddress', @socket.remoteAddress ).to @cust
    
  'cust, #remotePort' : ->
    
    @send( @, '#remotePort', @socket.remotePort ).to @cust
      
  'cust, #resume' : ->
    
    @socket.resume()
    if @cust # ack requested
      @send( @, '#resume' ).to @cust
    
  'cust, #setEncoding, encoding' : ->
    
    @socket.setEncoding @encoding
    if @cust # ack requested
      @send( @, '#setEncoding' ).to @cust
      
  'cust, #setKeepAlive, enable, [initialDelay]' : ->
    
    @socket.setKeepAlive @enable, @initialDelay
    if @cust # ack requested
      @send( @, '#setKeepAlive' ).to @cust
      
  'cust, #setNoDelay, noDelay' : ->
    
    @socket.setNoDelay @noDelay
    if @cust # ack requested
      @send( @, '#setNoDelay' ).to @cust
      
  'cust, #setTimeout, timeout' : ->
    
    @socket.setTimeout @timeout
    if @cust # ack requested
      @send( @, '#setTimeout' ).to @cust
      
  # get socket associated with this socket actor
  'cust, #socket' : ->
    
    @send( @, '#socket', @socket ).to @cust
      
  'cust, #write, data, [encoding]' : ->
    
    result = @socket.write @data, @encoding
    if @cust # ack requested
      @send( @, '#write', result ).to @cust

#
# The main net_beh wrapping Node.js 'net' functionality
#
exports.server_beh = uninitializedServer_beh