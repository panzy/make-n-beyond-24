import org.scalatest.{FlatSpec, Matchers}
import ArithSolver._


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
          key.toString + "=" + value
        }.mkString(";")
        obj._1 + (if (vars.nonEmpty) ";" + vars else "") should be(target)
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
        substituteVars(expr, vars) should be(target)
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
            not contain (target)
        }
      }
    }
  }

  // test eval()
  {
    val tests = Array(
      ("1 + 2", 3),
      ("10 - 2 * 4", 2),
      ("(10 - 2) * 4", 32),
      ("1 + sqrt(4)", 3),
      ("1 + log10(10)", 2),
      ("1 + factorial(3)", 7),
      ("1 + log10(sqrt(4) + 8)", 2)
    )

    tests.foreach { case (expr, target) =>
      s"eval(${expr})" should s"be ${target}" in {
        val v = eval(expr)
        assert(v.nonEmpty)
        v.get should be(target)
      }
    }
  }

  // test compile()
  {
    "compile()" should "produce L1 / L2 => log10(1) / log10(2)" in {
      ArithSolver.compile("L1 / L2") should be ("log10(1) / log10(2)")
    }

    it should "produce (L0) / L(L(0 * L0)) => (log10(0)) / log10(log10(0 * log10(0)))" in {
      ArithSolver.compile("(L0) / L(L(0 * L0))") should be ("(log10(0)) / log10((log10((0 * log10(0)))))")
    }
  }

  // test solve()
  {
    for (x <- 0 to 10) {
      "ArithSolver" should s"be able to solve: ${x} ${x} ${x} = 6" in {
        val s = solve(s"x=${x}", "xxx", 6, "+-*/", "√!L", true, true)
        s.size should be > 0
        println(s.map(_ + " = 6").mkString("\n"))
      }
    }
  }
}
