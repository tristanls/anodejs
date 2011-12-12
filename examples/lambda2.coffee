# 
# lambda2.coffee: An anode lambda calculus library based on work of Dale Schumacher
#
# see: http://www.dalnefre.com/wp/2010/09/evaluating-expressions-part-2-conditional-special-form/
#
# (C) 2011 Tristan Slominski
#

anode = require '../lib/anode'
beh = anode.beh

Lambda = exports

# Abstraction
Lambda.abs_expr_beh = beh 'ident', 'body_expr',
  'cust, #eval, env' : ->
    @send( @create Lambda.closure_beh @ident, @body_expr, @env ).to @cust
  # cust, #eval, env
  
# Application
Lambda.app_expr_beh = beh 'abs_expr', 'arg_expr',
  'cust, #eval, env' : ->
    k_abs = @create beh( 'env', 'arg_expr', 'cust',
      'abs' : ->
        k_arg = @create beh( 'cust', 'abs',
          'arg' : ->
            @send( @cust, '#apply', @arg ).to @abs
          # arg
        )( @cust, @abs )
        @send( k_arg, '#eval', @env ).to @arg_expr
      # abs
    )( @env, @arg_expr, @cust )
    @send( k_abs, '#eval', @env ).to @abs_expr
  # cust, #eval, env
  
# Case
Lambda.case_choice_beh = beh 'ptrn', 'expr', 'next',
  'cust, #match, value, env' : ->
    k_match = @create beh( 'cust', 'value', 'env', 'next', 'expr',
      '#?' : ->
        @send( @cust, '#match', @value, @env ).to @next
      # ?
      '_' : ->
        @send( @cust, '#eval', @_ ).to @expr
      # _
    )( @cust, @value, @env, @next, @expr )
    @send( k_match, '#match', @value, @env ).to @ptrn
  # cust, #match, value, env

# Case ( end )
Lambda.case_end_beh = beh
  'cust, #match, _' : ->
    @send( '?' ).to @cust

# Case ( expression )
Lambda.case_expr_beh = beh 'value_expr', 'choices',
  'cust, #eval, env' : ->
    k_value = @create beh( 'cust', 'env', 'choices',
      'value' : ->
        @send( @cust, '#match', @value, @env ).to @choices
      # value
    )( @cust, @env, @choices )
    @send( k_value, '#eval', @env ).to @value_expr
  # cust, #eval, env
  
# Closure
Lambda.closure_beh = beh 'ident', 'body', 'env',
  'cust, #apply, arg' : ->
    env2 = @create Lambda.env_beh @ident, @arg, @env
    @send( @cust, '#eval', env2 ).to @body
  # cust, #apply, arg
  
# Constant ( expression )
Lambda.const_expr_beh = beh 'value',
  'cust, #eval, _' : ->
    @send( @value ).to @cust
  # cust, #eval, _
  
# Constant ( pattern )
Lambda.const_ptrn_beh = beh 'value',
  'cust, #match, $value, env' : ->
    @send( @env ).to @cust
  'cust, _' : ->
    @send( '?' ).to @cust
    
# Environment ( empty )
Lambda.empty_env_beh = beh 
  'cust, _' : ->
    @send( '?' ).to @cust

# Environment ( expression )
Lambda.env_beh = beh 'ident', 'value', 'next',
  'cust, $ident' : ->
    @send( @value ).to @cust
  'cust, _' : ->
    @send( @cust, @_ ).to @next

# Identifier ( expression )
Lambda.ident_expr_beh = beh 'ident',
  'cust, #eval, env' : ->
    @send( @cust, @ident ).to @env
    
# Identifier ( pattern )
Lambda.ident_ptrn_beh = beh 'lambda', 'ident',
  'cust, #match, value, env' : ->
    env2 = @create Lambda.env_beh @ident, @value, @env
    @send( env2 ).to @cust
  'cust, _' : ->
    @send( '?' ).to @ cust
