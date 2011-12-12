(function() {
  var Lambda, anode, beh;
  anode = require('../lib/anode');
  beh = anode.beh;
  Lambda = exports;
  Lambda.const_expr_beh = beh('value', {
    'cust, #eval, _': function() {
      return this.send(this.value).to(this.cust);
    }
  });
  Lambda.ident_expr_beh = beh('ident', {
    'cust, #eval, env': function() {
      return this.send(this.cust, this.ident).to(this.env);
    }
  });
  Lambda.empty_env_beh = beh({
    'cust, _': function() {
      return this.send('?').to(this.cust);
    }
  });
  Lambda.env_beh = beh('ident', 'value', 'next', {
    'cust, $ident': function() {
      return this.send(this.value).to(this.cust);
    },
    'cust, _': function() {
      return this.send(this.cust, this._).to(this.next);
    }
  });
  Lambda.abs_expr_beh = beh('ident', 'body_expr', {
    'cust, #eval, env': function() {
      return this.send(this.create().withBehavior(Lambda.closure_beh(this.ident, this.body_expr, this.env))).to(this.cust);
    }
  });
  Lambda.closure_beh = beh('ident', 'body', 'env', {
    'cust, #apply, arg': function() {
      var env2;
      env2 = this.create().withBehavior(Lambda.env_beh(this.ident, this.arg, this.env));
      return this.send(this.cust, '#eval', env2).to(this.body);
    }
  });
  Lambda.app_expr_beh = beh('abs_expr', 'arg_expr', {
    'cust, #eval, env': function() {
      var k_abs;
      k_abs = this.create().withBehavior(beh('env', 'arg_expr', 'cust', {
        'abs': function() {
          var k_arg;
          k_arg = this.create().withBehavior(beh('cust', 'abs', {
            'arg': function() {
              return this.send(this.cust, '#apply', this.arg).to(this.abs);
            }
          })(this.cust, this.abs));
          return this.send(k_arg, '#eval', this.env).to(this.arg_expr);
        }
      })(this.env, this.arg_expr, this.cust));
      return this.send(k_abs, '#eval', this.env).to(this.abs_expr);
    }
  });
}).call(this);
