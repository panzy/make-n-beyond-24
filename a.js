'use strict';

let x = 4
let vals = ['x', 'y', 'z']
let binOps = ['+', '-', '*', '/']
let uniOps = ['-', '√']

//vals.forEach(v => {
//  v.binOp = ''
//  v.uniOp = ''
//})

//vals[0].binOp = '+'
//vals[1].binOp = '-'
//vals[2].uniOp = '√'

Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)); 
}

function gen(tokens) {
  if (tokens.length == 0) return []
  if (tokens.length == 1)
    return [tokens[0]].concat(uniOps.map(op => op + tokens[0]))
  else {
    var first = gen(tokens.slice(0, 1)).flatMap(t =>
        binOps.map(op =>
          t + ' ' + op + ' '))
    return gen(tokens.slice(1)).flatMap(rest => first.map(f => f + rest))

  }
}

let expr = gen(vals)

//let expr = vals.map(v => v.uniOp + v.x + ' ' + v.binOp + ' ').join('')

console.log(expr.join('\n'))
