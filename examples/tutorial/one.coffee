# First, lets import the anode module
anode = require '../../lib/anode'

# In order to create any actors to work with, we will need to generate a new actor configuration
# You can think of the configuration as an isolated group of actors that can communicate
# between themselves, we'll go more into the communication part shortly, for now, we'll create a new
# configuration
cnf = new anode.Configuration()

# Each anode actor configuration comes with a wrapper around the standard Node.js console for convenience
# Let's go over sending messages, using the default console.log
cnf.send( 'Hello anode world!' ).to cnf.console.log 

# We can pass in parameters just like in the normal console
cnf.send( 'Hello anode world %s!', 'again' ).to cnf.console.log
cnf.send( '%d', 42 ).to cnf.console.log

# To see what actors are available via cnf.console lets inspect it
cnf.send( cnf.console ).to cnf.console.log

# Great! So far, we used the top-level configuration to send messages, this is how you will usually start
# computation inside a configuration, by sending some initial message to it, but lets create
# some actors to do more interesting things than logging to console

# Let's build some actors

# We'll create a simple zero actor that, upon receipt of any message, will log 0 to the console
zero_actor = cnf.actor anode.beh( ->
  @send( 0 ).to cnf.console.log
)()  
  
cnf.send( 'any message' ).to zero_actor
# should print 0

# Let's break down what just happened
# cnf.actor is a function that takes in a behavior, creates an actor, and its result ( an actor ) is
#     assigned in this case to zero_actor
# anode.beh is a function that constructs a behavior that cnf.actor function will accept
# In the above case, anode.beh specified only one possible behavior to happen on any message which is
# -> @send( 0 ).to cnf.console.log

# Let's now make the behavior more interesting
# We will specify an actor that will echo any message it receives to the console
echo_actor = cnf.actor anode.beh(
  'message' : ->
    @send( @message ).to cnf.console.log
)()

cnf.send( 13 ).to echo_actor
# should print 13
cnf.send( 'foo!' ).to echo_actor
# should print foo!

# Let's keep going.
# We'll create an addition actor that adds two numbers together, and logs the result to the console
add_actor = cnf.actor anode.beh(
  'first, second' : ->
    @send( @first + @second ).to cnf.console.log
)()

cnf.send( 2, 2 ).to add_actor
# should print 4

# The add actor is fairly straightforward with only one behavior
# Let's create a more powerful actor that does addition or substraction
add_or_sub_actor = cnf.actor anode.beh(
  '#add, first, second' : ->
    @send( @first + @second ).to cnf.console.log
  '#sub, first, second' : ->
    @send( @first - @second ).to cnf.console.log
)()

cnf.send( 'add', 5, 3 ).to add_or_sub_actor
# should print 8
cnf.send( '#sub', 5, 3 ).to add_or_sub_actor
# should print 2

# The '#' in front of 'add' and 'sub' makes sure that the first part of the message is a string
# with the corresponding value. '#sub' will match either 'sub' or '#sub'

# Any message that an actor recieves is pattern matched against the available patterns, and
# ignored if nothing is matched

cnf.send( 'foo', 5, 3 ).to add_or_sub_actor
# nothing will happen

# For various reasons, it may be useful to capture messages that didn't match any of the specified patterns
# Anode provides the '_' wildcard just for such task

wildcard_example_actor = cnf.actor anode.beh(
  '#match' : ->
    @send( 'matched' ).to cnf.console.log
  '#match_again' : ->
    @send( 'matched again' ).to cnf.console.log
  '_' : ->
    @send( "didn't match" ).to cnf.console.log
)()

cnf.send( 'match_again' ).to wildcard_example_actor
# prints 'matched again'
cnf.send( 'match' ).to wildcard_example_actor
# prints 'matched'
cnf.send( 'foo!' ).to wildcard_example_actor
# prints "didn't match"

# Notice that the number of arguments must be equal for a successful pattern match
cnf.send( 'match', 'extra' ).to wildcard_example_actor
# prints "didn't match"

# We'll see that often we want to match only a part of the pattern to make a decision 
# on which behavior to execute, we can use the wildcard to stand for
# "whatever is left" in a pattern like so
leftovers_actor = cnf.actor anode.beh(
  '#match, _' : ->
    @send( 'matched' ).to cnf.console.log
  '_' : ->
    @send( "didn't match" ).to cnf.console.log
)()

cnf.send( 'match' ).to leftovers_actor
# prints 'matched'
cnf.send( '#match', 'yay', 'stuff' ).to leftovers_actor
# prints 'matched'
cnf.send( 'other', 'stuff' ).to leftovers_actor
# prints "didn't match"