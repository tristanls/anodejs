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

Take a look at the examples in the `examples` folder. As of this writing, there
are three non-trivial examples of setting up an actor configuration.

1. `erlangMailbox.js`, run `node erlangMailbox.example.js`
2. `lambda1.js`, run `node lambda1.example.js` ( you should see `42` )
3. `lambda2.js`, run `node lambda2.example.js` ( you should see `true` and `false` )

Other examples show simpler functionality

1. `console.warn.example.js` demonstrates actor wrappers around node.js console, run `node console.warn.example.js`
2. `valuematch.example.js` shows how `$` syntax matches pattern by evaluating the variable, run `node valuematch.example.js`
3. `simple.example.js` shows a simple counter system, run `node simple.example.js`