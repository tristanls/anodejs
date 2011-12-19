#
# assert.coffee : anode wrapper around Node.js 'assert' module
#
# (C) 2011 Tristan Slominski
#
anode = require '../lib/anode'
nodeassert = require 'assert'
nodeutil = require 'util'

#
# helper function to make the assertion failures more meaningful by displaying which
# actor generated the failed assertion
#
processAssertionError = ( @cust, @msg, error ) ->
  
  text = 'AssertionError'
  
  if @cust
    __name = if @cust.__name then @cust.__name + '::' else ''
    text += ' in: [' + __name + @cust.__uid + ']'
    
  if @msg
    msgText = []
    
    for element in @msg
      do ( element ) ->
        
        if element instanceof anode.Actor
          __label = '[' 
          if element.__name 
            __label += element.__name + '::'
          __label += element.__uid + ']'
          
          msgText.push __label
        
        else 
        
          msgText.push element
    
    text += ' on: ' + nodeutil.inspect msgText
    
  console.error text
  
  throw error

assert_beh = anode.beh
      
  'cust, msg, #deepEqual, actual, expected, [message]' : ->
    
    try
      nodeassert.deepEqual @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#deepEqual' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, #doesNotThrow, block, [error], [message]' : ->
    
    try
      nodeassert.doesNotThrow @block, @error, @message
      if @cust # ack requested
        @send( @, '#doesNotThrow' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
    
  'cust, msg, #equal, actual, expected, [message]' : ->
    
    try
      nodeassert.equal @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#equal' ).to @cust
    catch error
      processAssertionError @cust, @msg, error

  'cust, msg, #fail, actual, expected, message, operator' : ->
  
    try  
      nodeassert.fail @actual, @expected, @message, @operator
    catch error
      processAssertionError @cust, @msg, error
    
  'cust, msg, #ifError, value' : ->
    
    try
      nodeassert.ifError @value
      if @cust # ack requested
        @send( @, '#ifError' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
    
  'cust, msg, #notDeepEqual, actual, expected, [message]' : ->
    
    try
      nodeassert.notDeepEqual @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#notDeepEqual' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, #notStrictEqual, actual, expected, [message]' : ->
    
    try
      nodeassert.notStrictEqual @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#notStrictEqual' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, #notEqual, actual, expected, [message]' : ->
    
    try 
      nodeassert.notEqual @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#notEqual' ).to @cust   
    catch error
      processAssertionError @cust, @msg, error
    
  'cust, msg, #ok, value, [message]' : ->
    
    try  
      nodeassert.ok @value, @message
      if @cust # ack requested
        @send( @, '#ok' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, #strictEqual, actual, expected, [message]' : ->
    
    try
      nodeassert.strictEqual @actual, @expected, @message
      if @cust # ack requested
        @send( @, '#strictEqual' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, #throws, block, [error], [message]' : ->

    try
      nodeassert.throws @block, @error, @message
      if @cust # ack requested
        @send( @, '#throws' ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
  'cust, msg, value, message' : ->

    try
      nodeassert @value, @message
      if @cust # ack requested
        @send( @ ).to @cust
    catch error
      processAssertionError @cust, @msg, error
      
#
# export assert behavior
#
exports.assert_beh = assert_beh