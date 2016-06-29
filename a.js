/**
 * 给定操作数和结果，找出算术表达式。如
 *  5 5 5 1四个数字,用加减乘除,结果等于24
 */
'use strict';

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

/**
 * 为指定数量的操作数生成合法的圆括号方案。
 *
 * @return 方案数组，一个元素就是一是个方案。
 * 一个方案用一个数组来表示，一个元素就是一只括号。
 * 一只括号也用一个数组来表示，这个数组总是有两个元素，
 * 其中第一个数字表示该括号左边一共有多少个操作数（无视左边的其它括号），
 * 第二个数字表示该括号的类型，6=左，9=右。
 *
 * TODO recursive, nest
 */
function parentheses(n) {
  let results = []
  for (var i = 0; i <= n; ++i) {
    for (var j = i + 2; j <= n; ++j) {
      if (j - i == n)
        continue
      results.push([[i, 6], [j, 9]])
    }
  }
  return results
}

/**
 * 3,6,5,9 => +++(**)-
 */
function visParentheses(parenthesesSpec, n) {
  var line = ''
  parenthesesSpec.forEach((p, i, arr) => {
    if (i == 0 && p[0] > 0)
      line += '+'.repeat(p[0])
    else if (i > 0)
      line += '*'.repeat(p[0] - arr[i - 1][0])
    line += p[1] == 6 ? '(' : ')'
    if (i == arr.length - 1 && p[0] < n)
      line += '-'.repeat(n - p[0])
  })
  //console.log(`${parenthesesSpec} => ${line}`)
  return line
}

function parenthesesTest() {
  let tests = [
    [3, '(**)-'],
    [3, '+(**)'],
    [6, '(**)----'],
    [6, '(***)---'],
    [6, '(****)--'],
    [6, '(*****)-'],
    [6, '+(**)---'],
    [6, '+(***)--'],
    [6, '+(****)-'],
  ]

  console.log('begin test parentheses()')
  tests.forEach(d => {
    console.log(`parentheses(${d[0]}) should be able generate ${d[1]}`)
    console.assert(parentheses(d[0])
        .map(ps => visParentheses(ps, d[0]))
        .indexOf(d[1]) != -1)
  })
  console.log('all tests passed!')
}

function isOperand(str) {
  return 'abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(str) != -1
}

function isUnaryOp(c) {
  return '-!√'.indexOf(c) != -1
}

function applyParentheses(parenthesesSpec, expr) {
  var line = ''
    var oprands = 0
  // output content on the left of this parenthesis
  for (var j = 0; j < expr.length; ++j) {
    let isOpd = isOperand(expr[j])
    if (isOpd) {
      let p = parenthesesSpec.find(p => p[0] == oprands)
      if (p && p[1] == 6)
        line += '('
    }
    line += expr[j]
    if (isOpd)
      ++oprands
    if (isOpd) {
      let p = parenthesesSpec.find(p => p[0] == oprands)
      if (p && p[1] == 9)
        line += ')'
    }
  }
  //console.log(`applyParentheses(${parenthesesSpec}, ${expr}) => ${line}`)
  return line
}

function applyParenthesesTest() {
  let tests = [
    [[[0, 6], [1, 9]], 'x + y / z', '(x) + y / z'],
    [[[0, 6], [2, 9]], 'x + y / z', '(x + y) / z'],
    [[[1, 6], [3, 9]], 'x + y / z', 'x + (y / z)'],
    [[[0, 6], [3, 9]], 'x + y / z', '(x + y / z)'],
    [[[0, 6], [1, 6], [3, 9], [4, 9]], 'x + y / z * w', '(x + (y / z) * w)'],
  ]

  console.log('begin test applyParentheses()')
  tests.forEach(d => {
    console.log(`applyParentheses(${d[0]}, ${d[1]}) should be able generate ${d[2]}`)
    console.assert(applyParentheses(d[0], d[1]) == d[2])
  })
  console.log('all tests passed!')
}

/**
 * '(a+b)*c' -> 'abc'
 */
function extractOperands(expr) {
  return expr.split('').map(c => isOperand(c) ? c : '').filter(c => c != '').join('')
}

function extractOperandsTest() {
  let tests = [
    ['(a+b)*c', 'abc'],
    ['(a+b ) *c', 'abc'],
    ['√(√b-c)) * 3', 'bc3'],
    ['-a * -z', 'az'],
  ]

  console.log('begin test extractOperands()')
  tests.forEach(i => {
    let actual = extractOperands(i[0])
    console.log(i[0], '=>', i[1])
    console.assert(actual == i[1], `expect ${i[1]}, got ${actual}`)
  })
  console.log('all tests passed')
}

/**
 * 把表达式中的子表达式抽取为变量，使原表达式更简单。如
 *
 * x + √(y / z) => x + a;a=√(y / z)
 *
 * @param expr String, e.g., 'x + √(y / z)'
 * @return {expr: 'x + a', map: {a: '√(y / z)'}}
 */
function extractSubExprs(expr) {
  var varNames = 'abcdefghijklmn'
  var line = ''
  var nextVarIdx = 0
  var map = {} // var -> sub expr
  for (var i = 0; i < expr.length;) {
    let c = expr[i]
    if (c == '(' || (isUnaryOp(c) && c != '-'/* FIXME 由于 '-' 同时也是双目运算符...*/)) {

      while (nextVarIdx < varNames.length &&
          expr.indexOf(varNames[nextVarIdx]) != -1)
        ++nextVarIdx

      let j = findExprEnd(expr.slice(i))
      line += varNames[nextVarIdx]
      map[varNames[nextVarIdx]] = expr.slice(i, i + j)
      ++nextVarIdx
      i += j
    } else {
      line += c
      ++i
    }
  }
  return {src: expr, expr: line, map: map}
}

function extractSubExprsTest() {
  let tests = [
    ['x + y / z', 'x + y / z'],
    ['x - y / z', 'x - y / z'],
    ['(x - y / z)', 'a;a=(x - y / z)'],
    ['x + (y / z)', 'x + a;a=(y / z)'],
    ['(x + y) / z', 'a / z;a=(x + y)'],
    ['x + √(y / z)', 'x + a;a=√(y / z)'],
    ['x - √(y + z)', 'x - a;a=√(y + z)'],
    ['√(x + y) / z', 'a / z;a=√(x + y)'],
    ['√(a + b) / z', 'c / z;c=√(a + b)'], // test var name conflict
    ['x - y + (u - v)', 'x - y + a;a=(u - v)'],
  ]

  console.log('begin test extractSubExprs()')
  tests.forEach(d => {
    console.log(`extractSubExprs(${d[0]}) should generate ${d[1]}`)
    let obj = extractSubExprs(d[0])
    let actual = obj.expr
    Object.keys(obj.map).forEach(key => actual += ';' + key + '=' + obj.map[key])
    console.assert(actual == d[1], `expect ${d[1]}, got ${actual}`)
  })
  console.log('all tests passed!')
}

/**
 * 给定若干操作数，枚举合法的表达式，不含括号。
 *
 * @param operands String, 操作数序列，每个字符代表一个形参，允许重复，比如'xxy'
 *    表示3个操作数，其中前2个相同。
 * @param binOps Array, 可用的双目运算符的序列，如 ['+', '-', '*', '/']。
 * @param unaryOps Array, 可用的单目运算符的序列，如 ['-', '√', '!']。
 */
function _gen(operands, binOps, unaryOps) {

  if (operands.length == 0) return []
  if (operands.length == 1)
    return [operands[0]].concat(unaryOps.map(op => op + operands[0]))
  else {
    var first = _gen(operands.slice(0, 1), binOps, unaryOps).flatMap(t =>
        binOps.map(op =>
          t + ' ' + op + ' '))
    return _gen(operands.slice(1), binOps, unaryOps).flatMap(rest =>
        first.map(f => f + rest))
  }
}

/**
 * 给定若干操作数，枚举合法的表达式。不会对子表达式进一步应用运算符，比如
 *
 * x, y, z => x * √(y + z) => x * √√(y + z)
 *
 * 其中第二步转换需要把 √(y + z) 视为整体。
 *
 * @param operands String, 操作数序列，参见 _gen() 的同名参数。
 * @param binOps Array, 可用的双目运算符的序列，参见 _gen() 的同名参数。
 * @param unaryOps Array, 可用的单目运算符的序列，参见 _gen() 的同名参数。
 */
function _gen2(operands, binOps, unaryOps, withParentheses) {
  let exprs = _gen(operands, binOps, unaryOps)
  if (withParentheses) {
    let pss = parentheses(operands.length)
      return exprs.concat(exprs.flatMap(expr =>
            pss.map(ps => applyParentheses(ps, expr))))
  } else {
    return exprs
  }
}

/**
 * 给定若干操作数，枚举合法的表达式。会对子表达式进一步应用运算符，比如
 *
 * A. x, y, z => x * √(y + z) => x * √(y + z)
 * B. x, y => !x + !y => !(!x + !y)
 *
 * 目前这个动作不会递归。
 *
 * @param operands String, 操作数序列，参见 _gen() 的同名参数。
 * @param binOps Array, 可用的双目运算符的序列，参见 _gen() 的同名参数。
 * @param unaryOps Array, 可用的单目运算符的序列，参见 _gen() 的同名参数。
 */
function gen(operands, binOps, unaryOps, withParentheses) {
  let exprs = _gen2(operands, binOps, unaryOps, withParentheses)
  let exprs2 = exprs.flatMap(expr => {
    return [extractSubExprs(expr), extractSubExprs('(' + expr + ')')].flatMap(em => {
      if (em.map != {}) {
        let exprs3 = _gen(extractOperands(em.expr), binOps, unaryOps)
        // TODO TOO many duplicated exprs
        return exprs3.map(e => substituteVars(e, em.map))
      } else {
        return []
      }
    })
  })
  return exprs.concat(exprs2)
}

function genTest() {
  let tests = [
    ['xy', '+-*/', '-!', 'x + y'],
    ['xy', '+-*/', '-!', 'x - y'],
    ['xa', '+-*/', '-!√', 'x - √a'],
    ['xy', '+-*/', '-!', 'x * y'],
    ['xy', '+-*/', '-!', 'x / y'],
    ['xy', '+-*/', '-!√', '-x / √y'],
    ['xy', '+-*/', '-!', '-x / y'],
    ['xyz', '+-*/', '-!', 'x + y + z'],
    ['xyz', '+-*/', '-!', 'x + y - z'],
    ['xyz', '+-*/', '-!', 'x - (y - z)'],
    ['xyz', '+-*/', '-!√', '√x + √(y + z)'],
    ['xyz', '+-*/', '-!√', 'x - √(y + z)'],
    ['xyz', '+-*/', '-!√', 'x - √√(y + z)'],
    ['xyz', '+-*/', '-!', '!x + !y + !z'],
    ['xyz', '+-*/', '-!', '!(!x + !y + !z)'],
    ['xy', '+-*/', '-!', '!(!x + !y)'],
    ['x', '+-*/', '-!', '!x'],
    ['x', '+-*/', '-!', '!!x'],
  ]

  console.log('begin test gen()')

  tests.forEach(i => {
    let exprs = gen(i[0].split(''), i[1].split(''), i[2].split(''), true)
    console.log(i[0], 'should be able to generate', i[3])
    console.assert(exprs.indexOf(i[3]) != -1, `expect there's ${i[3]} in ${exprs}`)
  })

  console.log('all tests passed!')
}

function findExprEnd(expr) {
  let sep = ' +-*/√()'
  var unclosed = 0 // count of unclosed parentheses
  var operands = 0 // count of operands
  for (var i = 0; i < expr.length; ++i) {
    let c = expr[i]
    if (isOperand(c))
      ++operands
    if (operands > 0 && unclosed == 0 && sep.indexOf(c) != -1)
      return i
    if (c == '(')
      ++unclosed
    else if (c == ')')
      --unclosed
  }
  return expr.length
}

function findExprEndTest() {
  let tests = [
    ['(a+b)*c', 5],
    ['(a+b) *c', 5],
    ['(a+b ) *c', 6],
    ['d/(a+b)*c', 1],
    ['d2/(a+b)*c', 2],
    ['(a+(b-c)) * 3', 9],
    ['(a+(b-c) / 4) * 3', 13],
    ['(√b-c)) * 3', 6],
    ['√b', 2],
    ['√b + c', 2],
    ['√b + √c', 2],
    ['√√b', 3],
    ['√(√b-c)) * 3', 7],
  ]

  console.log('begin test findExprEnd()')
  tests.forEach(i => {
    let actual = findExprEnd(i[0])
    console.log(i[0], '=>', i[1])
    console.assert(actual == i[1], `expect ${i[1]}, got ${actual}`)
  })
  console.log('all tests passed')
}

/** compile math to JavaScript expression.
 *
 * supported math operator:
 * - √: Math.sqrt
 * - ∠: ?
 * */
function compile(expr) {
  if (expr.length < 1) {
    return expr
  } else if ('√!'.indexOf(expr[0]) != -1) {
    let funcs = {
      '√': 'Math.sqrt',
      '!': 'factorial',
    }

    let end = findExprEnd(expr.substr(1))
    return funcs[expr[0]] + '(' + compile(expr.substr(1, end)) + ')' + compile(expr.substr(1 + end))
  } else {
    return expr[0] + compile(expr.substr(1))
  }
}

function compileTest() {
  let tests = [
    ['(a+b)*c', '(a+b)*c'],
    ['√(a+b) *c', 'Math.sqrt((a+b)) *c'],
    ['√(a+√b)', 'Math.sqrt((a+Math.sqrt(b)))'],
    ['√(a+√b-c)', 'Math.sqrt((a+Math.sqrt(b)-c))'],
    ['√(a+b ) *√c', 'Math.sqrt((a+b )) *Math.sqrt(c)'],
    ['√d/√(a+√b)*c', 'Math.sqrt(d)/Math.sqrt((a+Math.sqrt(b)))*c'],
    ['√d2/(a+b)*c', 'Math.sqrt(d2)/(a+b)*c'],
    ['(a+√(√b-c)) * 3', '(a+Math.sqrt((Math.sqrt(b)-c))) * 3'],
    ['√8 + √(8 + 8)', 'Math.sqrt(8) + Math.sqrt((8 + 8))'],
    ['8 - √√(8 + 8)', '8 - Math.sqrt(Math.sqrt((8 + 8)))'],
    ['!x', 'factorial(x)'],
  ]

  console.log('begin test compile()')
  tests.forEach(i => {
    let actual = compile(i[0])
    console.log(i[0], '=>', i[1])
    console.assert(actual == i[1], `expect ${i[1]}, got ${actual}`)
  })
  console.log('all tests passed')
}

/**
 * 解析变量初始化语句。
 *
 * @param inits e.g., 'x=3;y=2;z=5;...'
 * @return {x:3, y:2, z: 5}
 */
function parseVars(inits) {
  let vals = {}
  inits.split(';').forEach(init => {
    let a = init.split('=')
    vals[a[0]] = a[1]
  })
  return vals
}

/**
 * 把表达式中的变量替换成相应的数值。
 *
 * @param expr e.g., "x + y - z"
 * @param vals a object, e.g., {x:3, y:2, z: 5}
 */
function substituteVars(expr, vals) {
  var line = ''
  for (var i = 0; i < expr.length; ++i) {
    if (isOperand(expr[i]) && vals.hasOwnProperty(expr[i]))
      line += vals[expr[i]]
    else
      line += expr[i]
  }
  return line
}

function substituteVarsTest() {
  let tests = [
    ['x + y', '5 + 1'],
    ['x * (x - y / x)', '5 * (5 - 1 / 5)'],
    ['x * w', '5 * w'],
  ]
  let vals = parseVars('x=5;y=1')

  console.log('begin test substituteVars()')
  tests.forEach(d => {
    let actual = substituteVars(d[0], vals)
    console.log(`substituteVars(${d[0]}) should be ${d[1]}`)
    console.assert(actual == d[1], `expect ${d[1]}, got ${actual}`)
  })
  console.log('all tests passed!')
}

/**
 * 已知操作数和结果，找出算术表达式。
 *
 * @param inits String, 变量初始化语句的序列，参见 parseVars() 的同名参数。
 * @param operands String, 操作数序列，参见 gen() 的同名参数。
 * @param target Number, 算术表达式的结果。
 * @param binOps Array, 可用的双目运算符的序列，参见 gen() 的同名参数。
 * @param unaryOps Array, 可用的单目运算符的序列，参见 gen() 的同名参数。
 * @param withParentheses bool, 是否可用括号？
 * @param allowReorder bool, 可否调整操作数的顺序？
 */
function solve(inits, operands, target, binOps, unaryOps, withParentheses, allowReorder) {
  let vals = parseVars(inits)
  let expr = gen(operands.split(''), binOps, unaryOps, withParentheses).map(
      e => substituteVars(e, vals))
  //console.log(expr.join('\n'))

  let results = []
  expr.forEach(e => {
    let factorial = n => {
      let tbl = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800]
      return tbl[n]
    }

    if (eval(compile(e)) == target) {
      results.push(e)
      console.log(e, '=', target)
    }
  })
  return results
}

function solveTest() {
  let binOps = '+-*/'.split('')
  let unaryOpsNon = []
  let unaryOps = ['-', '√']
  let unaryOps2 = ['-', '√', '!']

  console.log('\n0 0 0 => 3')
  console.assert(solve('x=0', 'xxx', 3, binOps, unaryOps2, 1, 0).length > 0)

  console.log('\n0 0 0 => 6')
  console.assert(solve('x=0', 'xxx', 6, binOps, unaryOps2, 1, 0).length > 0)

  console.log('\n2 2 2 => 6')
  console.assert(solve('x=2', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n3 3 3 => 6')
  console.assert(solve('x=3', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n4 4 4 => 6')
  console.assert(solve('x=4', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n5 5 5 => 6')
  console.assert(solve('x=5', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n6 6 6 => 6')
  console.assert(solve('x=6', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n7 7 7 => 6')
  console.assert(solve('x=7', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n8 8 8 => 6')
  console.assert(solve('x=8', 'xxx', 6, binOps, unaryOps, 1, 0).length > 0)

  console.log('\n5 5 5 1 => 24')
  console.assert(solve('x=5;y=1', 'xxyx', 24, binOps, unaryOpsNon, 1, 0).length > 0)

  // TODO
  //console.log('\n5 5 5 1 => 24')
  //console.assert(solve('x=5;y=1', 'xxxy', 24, binOps, unaryOpsNon, 1, 1).length > 0)

  console.log('\n5 5 5 1 => 25')
  console.assert(solve('x=5;y=1', 'xxxy', 25, binOps, unaryOpsNon, 1, 0).length > 0)

  console.log('\n3 3 8 8 => 24')
  console.assert(solve('x=3;y=8', 'xxyx', 24, binOps, unaryOpsNon, 1, 0).length > 0)

  console.log('\n2 3 4 5 => 24')
  console.assert(solve('x=2;y=3;u=4;v=5', 'xyuv', 24, binOps, unaryOpsNon, 1, 0).length > 0)
}

findExprEndTest()
extractOperandsTest()
extractSubExprsTest()
compileTest()
parenthesesTest()
applyParenthesesTest()
substituteVarsTest()
genTest()
solveTest()

