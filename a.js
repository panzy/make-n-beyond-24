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

function applyParentheses(parenthesesSpec, expr) {
  var line = ''
    var oprands = 0
  // output content on the left of this parenthesis
  for (var j = 0; j < expr.length; ++j) {
    let isOperand = 'uvwxyz'.indexOf(expr[j]) != -1
    if (isOperand) {
      let p = parenthesesSpec.find(p => p[0] == oprands)
      if (p && p[1] == 6)
        line += '('
    }
    line += expr[j]
    if (isOperand)
      ++oprands
    if (isOperand) {
      let p = parenthesesSpec.find(p => p[0] == oprands)
      if (p && p[1] == 9)
        line += ')'
    }
  }
  console.log(`applyParentheses(${parenthesesSpec}, ${expr}) => ${line}`)
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

parenthesesTest()
applyParenthesesTest()
return

/**
 * 给定若干操作数，枚举合法的表达式。
 */
function gen(operands) {
  let binOps = ['+', '-', '*', '/']
  let uniOps = ['-', '√']

  if (operands.length == 0) return []
  if (operands.length == 1)
    return [operands[0]].concat(uniOps.map(op => op + operands[0]))
  else {
    var first = gen(operands.slice(0, 1)).flatMap(t =>
        binOps.map(op =>
          t + ' ' + op + ' '))
    return gen(operands.slice(1)).flatMap(rest => first.map(f => f + rest))
  }
}

function genTest() {
  let tests = [
    ['xy', 'x + y'],
    ['xy', 'x - y'],
    ['xy', 'x * y'],
    ['xy', 'x / y'],
    ['xy', '-x / √y'],
    ['xy', '-x / y'],
    ['xyz', 'x + y + z'],
    ['xyz', 'x + y - z'],
    // ['xyz', 'x - (y - z)'],
  ]

  console.log('begin test gen()')

  tests.forEach(i => {
    console.log(i[0], 'should be able to generate', i[1])
    console.assert(gen(i[0].split('')).indexOf(i[1]) != -1)
  })

  console.log('all tests passed!')
}

function findExprEnd(expr) {
  let sep = ' +-*/√()'
  var unclosed = 0 // count of unclosed parentheses
  for (var i = 0; i < expr.length; ++i) {
    let c = expr[i]
    if (i > 0 && unclosed == 0 && sep.indexOf(c) != -1)
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
  ]

  console.log('begin test findExprEnd()')
  tests.forEach(i => {
    let actual = findExprEnd(i[0])
    console.log(i[0], '=>', i[1])
    console.assert(actual == i[1], `expect ${i[1]}, got ${actual}`)
  })
  console.log('all tests passed')
}

/** compile math to JavaScript expression. */
function compile(expr) {
  if (expr.length < 1) {
    return expr
  } else if (expr[0] == '√') {
    let end = findExprEnd(expr.substr(1))
    return 'Math.sqrt(' + compile(expr.substr(1, end)) + ')' + compile(expr.substr(1 + end))
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
  ]

  console.log('begin test compile()')
  tests.forEach(i => {
    let actual = compile(i[0])
    console.log(i[0], '=>', i[1])
    console.assert(actual == i[1], `expect ${i[1]}, got ${actual}`)
  })
  console.log('all tests passed')
}

findExprEndTest()
compileTest()
genTest()

let target = 6
let x = 5
let vals = ['x', 'x', 'x']

let expr = gen(vals)
console.log(expr.join('\n'))

expr.forEach(e => {
  if (eval(compile(e)) == target)
    console.log(e, '=', target)
})
