package net.toolmx.arith

/**
  * 实现数学函数，遇到应该得到 NaN 的地方就抛出异常。
  * TODO use type parameter
  * Created by pzy on 7/4/16.
  */
object MyMath {
  def factorial(n: Int): Int = {
    val tbl = Array(1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800)
    return tbl(n)
  }

  def factorial(n: Double): Int = {
    val tbl = Array(1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800)
    return if ((n * 10).toInt % 10 == 0) tbl(n.toInt) else tbl(-1)
  }

  def sqrt(n: Int): Double =
    if (n >= 0) Math.sqrt(n)
    else throw new Exception("n should be >= 0 in sqrt(n)")

  def sqrt(n: Double): Double =
    if (n >= 0) Math.sqrt(n)
    else throw new Exception("n should be >= 0 in sqrt(n)")

  def log10(n: Int): Double = Math.log10(n)

  def log10(n: Double): Double = Math.log10(n)
}
