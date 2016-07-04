package net.toolmx.arith

import MyMath._

import org.scalatest.{FlatSpec, Matchers}

/**
  * Created by pzy on 7/4/16.
  */
class MyMathSpec extends FlatSpec with Matchers {

  "sqrt(4)" should "be 2" in {
    sqrt(4) should be (2)
  }

  "sqrt" should "throw a exception if n < 0" in {
    an [Exception] should be thrownBy sqrt(-1)
  }

  "factorial(0)" should "be 1" in {
    factorial(0) should be (1)
  }

  "factorial" should "throw a exception if n is not int" in {
    an [Exception] should be thrownBy factorial(1.5)
  }
}
