/*
 * lambda2.js: An anode lambda calculus library based on work of Dale Schumacher
 * 
 * see: http://www.dalnefre.com/wp/2010/09/evaluating-expressions-part-2-conditional-special-form/
 * 
 * (C) 2011 Tristan Slominski
 *
 */

var anode = require( '../lib/anode' ),
    beh = anode.beh;

var Lambda = exports;

//
// Abstraction
//
Lambda.abs_expr_beh = beh( 'lambda', 'ident', 'body_expr', {
  'cust, #eval, env' : function () {
    send( 
      create().withBehavior( 
        lambda.closure_beh( lambda, ident, body_expr, env ) 
      ) 
    ).to( cust ); 
  }
});

//
// Application
//
Lambda.app_expr_beh = beh( 'abs_expr', 'arg_expr', {
  'cust, #eval, env' : function () {
    var k_abs = create().withBehavior( beh( 'env', 'arg_expr', 'cust', {
      'abs' : function () {
        var k_arg = create().withBehavior( beh( 'cust', 'abs', {
          'arg' : function () {
            send( cust, '#apply', arg ).to( abs );
          } // arg
        })( cust, abs ) );
        send( k_arg, '#eval', env ).to( arg_expr );
      } // abs
    })( env, arg_expr, cust ));
    send( k_abs, '#eval', env ).to( abs_expr );
  } // cust, #eval, env
});

//
// Case ( choice )
//
Lambda.case_choice_beh = beh( 'ptrn', 'expr', 'next', {
  'cust, #match, value, env' : function () {
    var k_match = create().withBehavior( beh( 
      'cust', 'value', 'env', 'next', 'expr', {
      '#?' : function () {
        send( cust, '#match', value, env ).to( next );
      },
      '_' : function () {
        send( cust, '#eval', _ ).to( expr );
      }
    })( cust, value, env, next, expr ) ); 
    send( k_match, '#match', value, env ).to( ptrn );
  }
});

//
// Case ( end )
//
Lambda.case_end_beh = beh( {
  'cust, #match, _' : function () {
    send( '?' ).to( cust );
  }
});

//
// Case ( expression )
//
Lambda.case_expr_beh = beh( 'value_expr', 'choices', {
  'cust, #eval, env' : function () {
    var k_value = create().withBehavior( beh( 'cust', 'env', 'choices', {
      'value' : function () {
        send( cust, '#match', value, env ).to( choices );
      }
    })( cust, env, choices ) );
    send( k_value, '#eval', env ).to( value_expr );
  }
});

//
// Closure
//
Lambda.closure_beh = beh( 'lambda', 'ident', 'body', 'env', {
  'cust, #apply, arg' : function () {
    var env2 = create().withBehavior( lambda.env_beh( ident, arg, env ) );
    send( cust, '#eval', env2 ).to( body );
  }
});

//
// Constant ( expression )
//
Lambda.const_expr_beh = beh( 'value', {
  'cust, #eval, _' : function () {
    send( value ).to( cust );
  }
});

//
// Constant ( pattern )
//
Lambda.const_ptrn_beh = beh( 'value', {
  'cust, #match, $value, env' : function () {
    send( env ).to( cust );
  },
  'cust, _' : function () {
    send( '?' ).to( cust );
  }
});

//
// Environment (empty)
//
Lambda.empty_env_beh = beh({
  'cust, _' : function () {
    send( '?' ).to( cust );
  }
});

//
// Environment
//
Lambda.env_beh = beh( 'ident', 'value', 'next', {
  'cust, $ident' : function () {
    send( value ).to( cust );
  },
  'cust, _' : function () {
    send( cust, _ ).to( next );
  }
});

//
// Identifier ( expression )
//
Lambda.ident_expr_beh = beh( 'ident', {
  'cust, #eval, env' : function () {
    send( cust, ident ).to( env );
  }
});

//
// Identifier ( pattern )
//
Lambda.ident_ptrn_beh = beh( 'lambda', 'ident', {
  'cust, #match, value, env' : function () {
    var env2 = create().withBehavior( lambda.env_beh( ident, value, env ) );
    send( env2 ).to( cust );
  },
  'cust, _' : function () {
    send( '?' ).to( cust );
  }
});