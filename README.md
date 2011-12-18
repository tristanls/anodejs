# anode

Humus inspired actor framework for Node.js

## Installation

### Installing node
Follow instructions at `http://nodejs.org/`

### Installing npm ( node package manager )
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### Installing anode
<pre>
  npm install anode
</pre>

### Getting Started

A quick note about `CoffeeScript`... Because of how `anode` actors are implemented, the code relies heavily on the `this` keyword. There is nothing preventing you from writing anode actors in `JavaScript`, however, the `CoffeeScript` syntax just happens to perfectly fit what each actor behavior is trying to express, so I highly recommend taking look at `anode` through the `CoffeeScript` lens.

Taking a pointer from Node.js, here is an example webserver in anode included in `examples/helloworld.example.coffee`
  
    anode = require 'anode'
    
    cnf = new anode.Configuration()
    
    http_actor = cnf.actor anode.http.http_beh()
    helloworld = cnf.actor anode.behavior(
      'http, #created, server' : ->
        @send( @, '#listen', 8080, '127.0.0.1' ).to @server
      'server, #listening, port, host' : ->
        @send( 'Server running at http://' + @host + ':' + @port + '/' ).to \
          cnf.console.log
      'server, #request, request, response' : ->
        @send( null, '#end', 'Hello Actor World\n' ).to @response
    )()
    
    cnf.send( helloworld, '#createServer' ).to http_actor

To run the server, go into the `examples` directory and execute it with `coffee`:

    '% coffee helloworld.example.coffee
    Server running at http://127.0.0.1:8080/

*note: not all of the `node` `'http'` functionality has been wrapped yet.

### Actors

The intent behind `anode` is to provide a way to write "pure" actors in JavaScript. Over the years, the idea of what actors are has evolved quite a bit. In the context of what `anode` is trying to provide, "pure" actors are actors as defined by [Carl Hewitt](http://hdl.handle.net/1721.1/6272) and elaborated by [Gul Agha](http://hdl.handle.net/1721.1/6952). Dale Schumacher (the author of pure actor language Humus on which `anode` is inspired) provides an excellent introduction to this perspective on actors on his blog [here](http://www.dalnefre.com/wp/2010/05/deconstructing-the-actor-model/).

#### tl;dr

Actor processing starts on receipt of a message. In response to a message, an actor can do three things:

1. send a finite number of new messages (`@send`)
2. create a finite number of new actors (`@create`)
3. designate a new behavior to process subsequent messages (`@become`)

### More Examples

I've begun a tutorial to demonstrate some of the elementary concepts of coding actors in `anode`. It is documented in code in `examples/tutorial/one.coffee`.

Take a look at the examples in the `examples` folder. As of this writing, there
are three non-trivial examples of setting up an actor configuration:

1. `erlangMailbox.coffee` is an implementation of Erlang-style mailbox modeled on Dale's [blog post](http://www.dalnefre.com/wp/2011/10/erlang-style-mailboxes/), run `coffee erlangMailbox.example.coffee`
2. `lambda1.coffee` is an implementation of lambda calculus modeled on Dale's [blog post](http://www.dalnefre.com/wp/2010/08/evaluating-expressions-part-1-core-lambda-calculus/), run `coffee lambda1.example.coffee` ( you should see `42` )
3. `lambda2.coffee` is a follow-on implementation of lambda calculus modeled on the second [blog post](http://www.dalnefre.com/wp/2010/09/evaluating-expressions-part-2-conditional-special-form/) in that series, run `coffee lambda2.example.coffee` ( you should see `true` and `false` )

Other examples show simpler functionality:

1. `console.warn.example.coffee` demonstrates actor wrappers around node.js console, run `coffee console.warn.example.coffee`
2. `valuematch.example.coffee` shows how `$` syntax matches pattern by evaluating the variable, run `coffee valuematch.example.coffee`
3. `simple.example.coffee` shows a simple counter system, run `coffee simple.example.coffee`
4. `optional.example.coffee` shows use of optional parameters in a message, run `coffee optional.example.coffee`

## Licence

(The MIT License)

Copyright (c) 2011 Tristan Slominski <tristan.slominski@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.