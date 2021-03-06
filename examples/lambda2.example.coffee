anode = require '../lib/anode'
cnf = new anode.Configuration()
lambda = require './lambda2'

empty_env = cnf.actor lambda.empty_env_beh()

global_env = cnf.actor \
  lambda.env_beh \
    '#zero?',
    cnf.actor( lambda.closure_beh(
      '#x',
      cnf.actor( lambda.case_expr_beh( 
        cnf.actor( lambda.ident_expr_beh( '#x' ) ),
        cnf.actor(  lambda.case_choice_beh(
          cnf.actor( lambda.const_ptrn_beh( 0 ) ),
          cnf.actor( lambda.const_expr_beh( true ) ),
          cnf.actor( lambda.case_choice_beh( 
            cnf.actor( lambda.ident_ptrn_beh( lambda, '#_' ) ),
            cnf.actor( lambda.const_expr_beh( false ) ),
            cnf.actor( lambda.case_end_beh() )
          ) ) # case_choice_beh
        ) )# case_choice_beh
      ) ), # case_expr_beh
      empty_env
    ) ), # closure_beh
    empty_env
    
cnf.send( cnf.console.log, '#eval', global_env ).to(
  cnf.actor( lambda.app_expr_beh(
    cnf.actor( lambda.ident_expr_beh '#zero?' ),
    cnf.actor( lambda.const_expr_beh 0 )
  )) # actor
) # send
# should print 'true'

cnf.send( cnf.console.log, '#eval', global_env ).to(
  cnf.actor( lambda.app_expr_beh(
    cnf.actor( lambda.ident_expr_beh '#zero?' ),
    cnf.actor( lambda.const_expr_beh 1 )
  )) # actor
) # send
# shoudl print 'false'