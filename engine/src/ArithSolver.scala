import scala.collection.mutable

/**
  * Created by pzy on 7/2/16.
  */
object ArithSolver extends App {

  def parentheses(n: Int): Array[Array[(Int, Int)]] = {
    val results = mutable.ArrayBuilder.make[Array[(Int, Int)]]()
    for (i <- 0 to n) {
      for (j <- i + 2 to n) {
        results += Array((i, 6), (j, 9))
      }
    }

    results.result()
  }

  def isOperand(str: Char) =
    "abcdefghijklmnopqrstuvwxyz0123456789".contains(str)

  def isUnaryOp(c: Char) = "~!√L".contains(c)

  def isSeparator(c: Char) = " +-*/()".contains(c) || isUnaryOp(c)

  def applyParentheses(parenthesesSpec: Array[(Int, Int)],
                       expr: String): String = {
    val line = StringBuilder.newBuilder
    var operands = 0
    for (j <- 0 until expr.length) {
      val isOpd = isOperand(expr(j))
      if (isOpd) {
        val p = parenthesesSpec.find(p => p._1 == operands)
        if (p.nonEmpty && p.get._2 == 6)
          line += '('
      }
      line += expr(j)
      if (isOpd) {
        operands += 1
        val p = parenthesesSpec.find(p => p._1 == operands)
        if (p.nonEmpty && p.get._2 == 9)
          line += ')'
      }
    }

    line.result()
  }

  def findExprEnd(expr: String): Int = {
    var unclosed = 0
    var operands = 0
    for (i <- 0 until expr.length) {
      val c = expr(i)
      if (isOperand(c))
        operands += 1
      if (operands > 0 && unclosed == 0 && isSeparator(c))
        return i
      if (c == '(')
        unclosed += 1
      else if (c == ')')
        unclosed -= 1
    }
    return expr.length
  }

  def extractOperands(expr: String) =
    expr.toCharArray
      .map(c => if (isOperand(c)) c else '?')
      .filter(_ != '?')
      .mkString("")

  def extractSubExprs(expr: String): (String, Map[Char, String]) = {
    val varNames = "abcdefghijklmn"
    var line = StringBuilder.newBuilder
    var nextVarIdx = 0
    var map = new mutable.LinkedHashMap[Char, String]
    var i = 0
    while (i < expr.length) {
      val c = expr(i)
      if (c == '(' || isUnaryOp(c)) {
        while (nextVarIdx < varNames.length &&
          expr.contains(varNames(nextVarIdx)))
          nextVarIdx += 1

        val j = findExprEnd(expr.substring(i))
        line += varNames(nextVarIdx)
        val sub = expr.substring(i, i + j)
        map.put(varNames(nextVarIdx),
          if (sub.startsWith("(")) sub else "(" + sub + ")")
        nextVarIdx += 1
        i += j
      } else {
        line += c
        i += 1
      }
    }
    if (line.length > 1) {
      (line.result(), map.toMap[Char, String])
    } else {
      map.clear()
      (expr, map.toMap[Char, String])
    }
  }

  def substituteVars(expr: String, vals: Map[Char, String]): String = {
    expr.map(c => if (isOperand(c) && vals.contains(c))
      vals.get(c).get else c.toString)
      .mkString("")
  }

  def addUnaryOps(expr: String, ops: Array[Char]): Array[String] =
    _addUnaryOps(expr, ops).filter(e => e != expr)

  def _addUnaryOps(expr: String, ops: Array[Char]): Array[String] = {
    if (expr.isEmpty) return Array()
    val c = expr(0)
    val heads = mutable.ArrayBuilder.make[String]()

    heads += c.toString

    if (isOperand(c)) {
      ops.foreach(op => heads += op + c.toString)
    }

    if (expr.length > 1) {
      val tails = _addUnaryOps(expr.substring(1), ops)
      heads.result().flatMap(head => tails.map(tail => head + tail))
    } else {
      heads.result()
    }
  }

  def gen1(operands: String, binOps: Array[Char], unaryOps: Array[Char])
  : Array[String] = {
    if (operands.isEmpty) return Array()
    if (operands.length == 1) {
      val d = operands(0).toString
      Array(d) ++ unaryOps.map(op => op + d)
    } else {
      val first = gen1(operands.substring(0, 1), binOps, unaryOps)
        .flatMap(t => binOps.map(op => t + " " + op + " "))
      gen1(operands.substring(1), binOps, unaryOps)
        .flatMap(rest => first.map(f => f + rest))
    }
  }

  def gen2(operands: String, binOps: Array[Char], unaryOps: Array[Char],
          withParentheses: Boolean): Array[String] = {
    val exprs = gen1(operands, binOps, unaryOps)
    if (withParentheses) {
      val pss = parentheses(operands.length)
      exprs ++ exprs.flatMap(expr => pss.map(ps => applyParentheses(ps, expr)))
    } else {
      exprs
    }
  }

  def gen3(operands: String, binOps: Array[Char], unaryOps: Array[Char],
           withParentheses: Boolean): Array[String] = {
    def simplifyGen = (expr: String) => {
      val simplifiedExprs = mutable.ArrayBuilder.make[(String, Map[Char, String])]

      simplifiedExprs += extractSubExprs(expr)

      if (expr.length > 1) {
        val vars = Map('a' -> ("(" + expr + ")"))
        simplifiedExprs += (("a", vars))
      }

      simplifiedExprs.result().flatMap(em =>
        if (em._2.nonEmpty) {
          val exprs3 = addUnaryOps(em._1, unaryOps)
          exprs3.map(e => substituteVars(e, em._2))
        } else {
          Array[String]()
        })
    }

    val exprs = gen2(operands, binOps, unaryOps, withParentheses)
    val exprs2 = exprs.flatMap(expr => simplifyGen(expr))
    exprs ++ exprs2
  }

  def compile(expr: String): String = {
    if (expr.isEmpty) {
      expr
    } else if (isUnaryOp(expr(0))) {
      val funcs = Map(
        '~' -> "-",
        '√' -> "Math.sqrt",
        '!'-> "factorial",
        'L'-> "Math.log10"
      )

      val end = findExprEnd(expr.substring(1))
      funcs.get(expr(0)) + "(" + compile(expr.substring(1)) + ")" +
        compile(expr.substring(1 + end))
    } else {
      expr.substring(0, 1) + compile(expr.substring(1))
    }
  }

  def parseVars(inits: String): Map[Char, String] =
    inits.split(";").map(init => {
      val parts = init.split("=")
      (parts(0)(0) -> parts(1))
    }).toMap[Char, String]
}
