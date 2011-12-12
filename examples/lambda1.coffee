# 
# lambda1.coffee: An anode lambda calculus library based on work of Dale Schumacher
#
# see: http://www.dalnefre.com/wp/2010/08/evaluating-expressions-part-1-core-lambda-calculus/
#
# (C) 2011 Tristan Slominski
#

anode = require '../lib/anode'
beh = anode.beh

Lambda = exports

# Constants
Lambda.const_expr_beh = beh 'value', 
  'cust, #eval, _' : ->
    @send( @value ).to @cust

# Identifier
Lambda.ident_expr_beh = beh 'ident',
  'cust, #eval, env' : ->
    @send( @cust, @ident ).to @env

# Environment ( empty )
Lambda.empty_env_beh = beh 
  'cust, _' : ->
    @send( '?' ).to @cust

# Environment
Lambda.env_beh = beh 'ident', 'value', 'next',
  'cust, $ident' : ->
    @send( @value ).to @cust
  'cust, _' : ->
    @send( @cust, @_ ).to @next

# Abstraction
Lambda.abs_expr_beh = beh 'ident', 'body_expr',
  'cust, #eval, env' : ->
    @send(
      @create().withBehavior( Lambda.closure_beh @ident, @body_expr, @env )
    ).to @cust
  # 'cust, #eval, env'

# Closure
Lambda.closure_beh = beh 'ident', 'body', 'env',
  'cust, #apply, arg' : ->
    env2 = @create().withBehavior( Lambda.env_beh @ident, @arg, @env )
    @send( @cust, '#eval', env2 ).to @body

# Application
Lambda.app_expr_beh = beh 'abs_expr', 'arg_expr',
  'cust, #eval, env' : ->
    k_abs = @create().withBehavior( beh( 'env', 'arg_expr', 'cust',
      'abs' : ->
        k_arg = @create().withBehavior( beh( 'cust', 'abs',
          'arg' : ->
            @send( @cust, '#apply', @arg ).to @abs
        )( @cust, @abs ))
        @send( k_arg, '#eval', @env ).to @arg_expr
      # 'abs'
    )( @env, @arg_expr, @cust ))
    @send( k_abs, '#eval', @env ).to @abs_expr
  # 'cust, #eval, env'