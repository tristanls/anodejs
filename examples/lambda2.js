(function() {
  var Lambda, anode, beh;
  anode = require('../lib/anode');
  beh = anode.beh;
  Lambda = exports;
  Lambda.abs_expr_beh = beh('ident', 'body_expr', {
    'cust, #eval, env': function() {
      return this.send(this.create(Lambda.closure_beh(this.ident, this.body_expr, this.env))).to(this.cust);
    }
  });
  Lambda.app_expr_beh = beh('abs_expr', 'arg_expr', {
    'cust, #eval, env': function() {
      var k_abs;
      k_abs = this.create(beh('env', 'arg_expr', 'cust', {
        'abs': function() {
          var k_arg;
          k_arg = this.create(beh('cust', 'abs', {
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
  Lambda.case_choice_beh = beh('ptrn', 'expr', 'next', {
    'cust, #match, value, env': function() {
      var k_match;
      k_match = this.create(beh('cust', 'value', 'env', 'next', 'expr', {
        '#?': function() {
          return this.send(this.cust, '#match', this.value, this.env).to(this.next);
        },
        '_': function() {
          return this.send(this.cust, '#eval', this._).to(this.expr);
        }
      })(this.cust, this.value, this.env, this.next, this.expr));
      return this.send(k_match, '#match', this.value, this.env).to(this.ptrn);
    }
  });
  Lambda.case_end_beh = beh({
    'cust, #match, _': function() {
      return this.send('?').to(this.cust);
    }
  });
  Lambda.case_expr_beh = beh('value_expr', 'choices', {
    'cust, #eval, env': function() {
      var k_value;
      k_value = this.create(beh('cust', 'env', 'choices', {
        'value': function() {
          return this.send(this.cust, '#match', this.value, this.env).to(this.choices);
        }
      })(this.cust, this.env, this.choices));
      return this.send(k_value, '#eval', this.env).to(this.value_expr);
    }
  });
  Lambda.closure_beh = beh('ident', 'body', 'env', {
    'cust, #apply, arg': function() {
      var env2;
      env2 = this.create(Lambda.env_beh(this.ident, this.arg, this.env));
      return this.send(this.cust, '#eval', env2).to(this.body);
    }
  });
  Lambda.const_expr_beh = beh('value', {
    'cust, #eval, _': function() {
      return this.send(this.value).to(this.cust);
    }
  });
  Lambda.const_ptrn_beh = beh('value', {
    'cust, #match, $value, env': function() {
      return this.send(this.env).to(this.cust);
    },
    'cust, _': function() {
      return this.send('?').to(this.cust);
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
  Lambda.ident_expr_beh = beh('ident', {
    'cust, #eval, env': function() {
      return this.send(this.cust, this.ident).to(this.env);
    }
  });
  Lambda.ident_ptrn_beh = beh('lambda', 'ident', {
    'cust, #match, value, env': function() {
      var env2;
      env2 = this.create(Lambda.env_beh(this.ident, this.value, this.env));
      return this.send(env2).to(this.cust);
    },
    'cust, _': function() {
      return this.send('?').to(this(cust));
    }
  });
}).call(this);
