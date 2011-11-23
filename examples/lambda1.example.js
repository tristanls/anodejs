var anode = require( '../lib/anode' ),
    cnf = new anode.Configuration(),
    lambda = require( './lambda1' );

var x_ident = cnf.createActor().withBehavior( lambda.ident_expr_beh( '#x' ) );

var abs_expr = cnf.createActor().withBehavior( 
  lambda.abs_expr_beh( lambda, '#x', x_ident ) );

var const_42 = cnf.createActor().withBehavior( lambda.const_expr_beh( 42 ) );

var example = cnf.createActor().withBehavior( 
  lambda.app_expr_beh( abs_expr, const_42 ) );

var empty_env = cnf.createActor().withBehavior( lambda.empty_env_beh() );

cnf.send( cnf.console.log, '#eval', empty_env ).to( example );

// should see 42 printed to the console