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
_Assuming that you unzipped anode into_ `/anode`

<pre>
  cd /anode
  /anode:> npm link
</pre>

npm should install `async-events` package in `/anode/node_modules` directory

### Getting Started

A quick note about `CoffeeScript`. Because of how `anode` actors are implemented, the code relies heavily on the `this` keyword. There is nothing preventing you from writing anode actors in `JavaScript`, however, the `CoffeeScript` syntax just happens to perfectly fit what each actor behavior is trying to express, so I highly recommend taking look at `anode` through the `CoffeeScript` lens.

Take a look at the examples in the `examples` folder. As of this writing, there
are three non-trivial examples of setting up an actor configuration.

1. `erlangMailbox.js`, run `coffee erlangMailbox.example.coffee`
2. `lambda1.js`, run `coffee lambda1.example.coffee` ( you should see `42` )
3. `lambda2.js`, run `coffee lambda2.example.coffee` ( you should see `true` and `false` )

Other examples show simpler functionality

1. `console.warn.example.coffee` demonstrates actor wrappers around node.js console, run `coffee console.warn.example.coffee`
2. `valuematch.example.coffee` shows how `$` syntax matches pattern by evaluating the variable, run `coffee valuematch.example.coffee`
3. `simple.example.coffee` shows a simple counter system, run `coffee simple.example.coffee`