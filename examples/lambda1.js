/*
 * lambda1.js: An anode lambda calculus library based on work of Dale Schumacher
 * 
 * see: http://www.dalnefre.com/wp/2010/08/evaluating-expressions-part-1-core-lambda-calculus/
 * 
 * (C) 2011 Tristan Slominski
 *
 */

var anode = require( '../lib/anode' ),
    beh = anode.beh;

var Lambda = exports;

//
// Constant
//
Lambda.const_expr_beh = beh( 'value', {
  'cust, #eval, _' : function () {
    send( value ).to( cust );
  }
});

//
// Identifier
//
Lambda.ident_expr_beh = beh( 'ident', {
  'cust, #eval, env' : function () {
    send( cust, ident ).to( env );
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
// Closure
//
Lambda.closure_beh = beh( 'lambda', 'ident', 'body', 'env', {
  'cust, #apply, arg' : function () {
    var env2 = create().withBehavior( lambda.env_beh( ident, arg, env ) );
    send( cust, '#eval', env2 ).to( body );
  }
});

//
// Application
//
Lambda.app_expr_beh = beh( 'abs_expr', 'arg_expr', {
  'cust, #eval, env' : function () {
    debugger;
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