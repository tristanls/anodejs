var anode = require( '../lib/anode' ),
    cnf = new anode.Configuration(),
    lambda = require( './lambda2' );

var empty_env = cnf.createActor().withBehavior( lambda.empty_env_beh() );

var global_env = cnf.createActor().withBehavior( 
  lambda.env_beh(
    '#zero?',
    cnf.createActor().withBehavior(
      lambda.closure_beh(
        lambda,
        '#x',
        cnf.createActor().withBehavior(
          lambda.case_expr_beh(
            cnf.createActor().withBehavior(
              lambda.ident_expr_beh( '#x' )
            ), // ident_expr_beh actor
            cnf.createActor().withBehavior(
              lambda.case_choice_beh(
                cnf.createActor().withBehavior( lambda.const_ptrn_beh( 0 ) ),
                cnf.createActor().withBehavior( lambda.const_expr_beh( true ) ),
                cnf.createActor().withBehavior(
                  lambda.case_choice_beh(
                    cnf.createActor().withBehavior( 
                      lambda.ident_ptrn_beh( lambda, '#_' )
                    ), // ident_ptrn_beh actor
                    cnf.createActor().withBehavior(
                      lambda.const_expr_beh( false )
                    ), // const_expr_beh actor
                    cnf.createActor().withBehavior( lambda.case_end_beh() )
                  ) // case_choice_beh
                ) // case_choice_beh actor
              ) // case_choice_beh
            ) // case_choice_beh actor
          ) // case_expr_beh
        ), // case_expr_beh actor
        empty_env
      ) // closure_beh
    ), // closure_beh actor
    empty_env
  ) // env_beh
); // global_env

cnf.send( cnf.console.log, '#eval', global_env ).to(
  cnf.createActor().withBehavior( 
    lambda.app_expr_beh(
      cnf.createActor().withBehavior( lambda.ident_expr_beh( '#zero?' ) ),
      cnf.createActor().withBehavior( lambda.const_expr_beh( 0 ) )
    ) // app_expr_beh
  ) // app_expr_beh actor
); // send
// should print 'true'


cnf.send( cnf.console.log, '#eval', global_env ).to(
  cnf.createActor().withBehavior( 
    lambda.app_expr_beh(
      cnf.createActor().withBehavior( lambda.ident_expr_beh( '#zero?' ) ),
      cnf.createActor().withBehavior( lambda.const_expr_beh( 1 ) )
    ) // app_expr_beh
  ) // app_expr_beh actor
); // send
// should print 'false'