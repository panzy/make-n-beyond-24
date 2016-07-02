import ArithSolver._
import org.scalatest.{FlatSpec, Matchers}

/**
  * Created by pzy on 7/2/16.
  */
class ArithSolverSpec extends FlatSpec with Matchers {
  "println" should "work" in {
    println("hello world!")
  }

  // test extractSubExprs()
  {
    val tests = Array(
      ("x", "x"),
      ("!x", "!x"),
      ("~x", "~x"),
      ("x + y / z", "x + y / z"),
      ("x - y / z", "x - y / z"),
      ("(x - y / z)", "(x - y / z)"),

      ("x + (y / z)", "x + a;a=(y / z)"),
      ("(x + y) / z", "a / z;a=(x + y)"),
      ("x + √(y / z)", "x + a;a=(√(y / z))"),
      ("x - √(y + z)", "x - a;a=(√(y + z))"),
      ("√(x + y) / z", "a / z;a=(√(x + y))"),
      ("√(a + b) / z", "c / z;c=(√(a + b))"), // test var name conflict
      ("x - y + (u - v)", "x - y + a;a=(u - v)"),
      ("!x + y", "a + y;a=(!x)"),
      ("x + !y", "x + a;a=(!y)")
    )

    tests.foreach { case (expr, target) =>
      s"extractSubExprs(${expr})" should
        s"be able generate (${target})" in {
        val obj = extractSubExprs(expr)
        val vars = obj._2.map { case (key, value) =>
          key.toString + "=" + value }.mkString(";")
        obj._1 + (if (vars.nonEmpty) ";" + vars else "") should be (target)
      }
    }
  }

  // test subsituteVars()
  {
    val tests = Array(
      ("x + y", "5 + 1"),
      ("x * (x - y / x)", "5 * (5 - 1 / 5)"),
      ("x * w", "5 * w")
    )
    val vars = parseVars("x=5;y=1")

    tests.foreach { case (expr, target) =>
      s"substituteVars(${expr}, ${vars})" should
        s"generate (${target})" in {
        substituteVars(expr, vars) should be (target)
      }
    }
  }

  // test gen1()
  {
    val tests = Array(
      // no binary ops
      ("x", "", "~!√", "x", 1),
      ("x", "", "~!√", "~x", 1),
      ("x", "", "~!√", "!x", 1),
      ("x", "", "~!√", "√x", 1),

      // no unary ops
      ("xy", "+-*/", "", "x + y", 1),
      ("xy", "+-*/", "", "x - y", 1),
      ("xy", "+-*/", "", "x * y", 1),
      ("xy", "+-*/", "", "x / y", 1),

      // all ops
      ("xy", "+-*/", "~!√", "x + y", 1),
      ("xy", "+-*/", "~!√", "x + !y", 1),
      ("xy", "+-*/", "~!√", "√x + !y", 1)
    )

    tests.foreach { case (operands, binOps, unaryOps, target, flag) =>
      s"gen1(${operands}, ${binOps}, ${unaryOps})" should
        s"be able generate (${target})" in {
        gen1(operands, binOps.toCharArray, unaryOps.toCharArray) should
          contain(target)
      }
    }
  }

  // test gen2()
  {
    val tests = Array(
      // no unary ops
      ("xyz", "+-*/", "", "x * (y - z)", 1),

      // all ops
      ("xyz", "+-*/", "~!√", "√(x + y) / !z", 1)
    )

    tests.foreach { case (operands, binOps, unaryOps, target, flag) =>
      s"gen2(${operands}, ${binOps}, ${unaryOps}, true)" should
        s"be able generate (${target})" in {
        gen2(operands, binOps.toCharArray, unaryOps.toCharArray, true) should
          contain(target)
      }
    }
  }

  // test gen3()
  {
    val tests = Array(
      ("xy", "+-*/", "~!", "x + y", 1),
      ("xy", "+-*/", "~!", "x - y", 1),
      ("xa", "+-*/", "~!√", "x - √a", 1),
      ("xy", "+-*/", "~!", "x * y", 1),
      ("xy", "+-*/", "~!", "x / y", 1),
      ("xy", "+-*/", "~!√", "~x / √y", 1),
      ("xy", "+-*/", "~!", "~x / y", 1),
      ("xy", "+", "~!", "!(!x) + ~(~y)", 1),
      ("xyz", "+-*/", "~!", "x + y + z", 1),
      ("xyz", "+-*/", "~!", "x + y - z", 1),
      ("xyz", "+-*/", "~!", "x - (y - z)", 1),
      ("xyz", "+-*/", "~!√", "√x + √(y + z)", 1),
      ("xyz", "+-*/", "~!√", "x - √(y + z)", 1),
      ("xyz", "+-*/", "~!√", "x - √(√(y + z))", 1),
      ("xyz", "+-*/", "~!", "!x + !y + !z", 1),
      ("xyz", "+-*/", "~!", "!(!x + !y + !z)", 1),
      ("xy", "+-*/", "~!", "!(!x + !y)", 1),
      ("x", "+-*/", "~!", "!x", 1),
      ("x", "+-*/", "~!", "!(!x)", 1),
      ("x", "+-*/", "~!", "~(!x)", 1),
      ("x", "+-*/", "~!", "!!x", 0),
      ("x", "+-*/", "~!", "~(~x)", 1),
      ("x", "", "~√!", "~~x", 0), // illegal
      ("x", "", "~√!", "√(!x)", 1),
      ("x", "", "~√!", "!(√x)", 1),
      ("x", "+-*/", "~!", "!(x)", 0)
    )

    tests.foreach { case (operands, binOps, unaryOps, target, flag) =>
      if (flag == 1) {
        s"gen3(${operands}, ${binOps}, ${unaryOps}, true)" should
          s"be able generate (${target})" in {
          gen3(operands, binOps.toCharArray, unaryOps.toCharArray, true) should
            contain(target)
        }
      } else {
        s"gen3(${operands}, ${binOps}, ${unaryOps}, true)" should
          s"not be able generate (${target})" in {
          gen3(operands, binOps.toCharArray, unaryOps.toCharArray, true) should
            not contain(target)
        }
      }
    }
  }
}
