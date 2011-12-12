anode = require '../lib/anode'
cnf = new anode.Configuration()
lambda = require './lambda1'

x_ident = cnf.actor '#x', lambda.ident_expr_beh '#x' 
abs_expr = cnf.actor 'abs_expr', lambda.abs_expr_beh '#x', x_ident
const_42 = cnf.actor '42', lambda.const_expr_beh 42
example = cnf.actor 'example', lambda.app_expr_beh abs_expr, const_42
empty_env = cnf.actor lambda.empty_env_beh()

cnf.send( cnf.console.log, '#eval', empty_env ).to example
# should see 42 printed to the console