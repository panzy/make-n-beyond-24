/**
 * 给定操作数和结果，找出算术表达式。如
 *  5 5 5 1四个数字,用加减乘除,结果等于24
 */
'use strict';

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

/**
 * 给定若干操作数，枚举合法的表达式。
 */
function gen(operands) {
  let binOps = ['+', '-', '*', '/']
  let uniOps = ['', '-', '√']

  if (operands.length == 0) return []
  if (operands.length == 1)
    return uniOps.map(op => op + operands[0])
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
  var unclosed = 0 // count of unclosed parenthesis
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
