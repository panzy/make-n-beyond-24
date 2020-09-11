# Make a number

Given several numbers, allowed operators, and a target number, the program
searches the arithmetic expressions.

For example, given `2 3 4 5 => 24`, the output may be `2 * (3 + 4 + 5)`,
provided `*`, `+`, and `()` are allowed.

Available operators are:

- addition
- subtraction/negation
- multiplication
- division
- factorial
- sqrt
- ln10

It's also possible to disallow parentheses.

Limitation: the operands have to be between 0 and 9.

Sample outputs:

```
0 0 0 => 6
!(!0 + !0 + !0) = factorial((factorial(0) + factorial(0) + factorial(0))) = 6

1 1 1 => 6
!(1 + 1 + 1) = factorial((1 + 1 + 1)) = 6

2 2 2 => 6
2 + 2 + 2 = 2 + 2 + 2 = 6

3 3 3 => 6
3 * 3 - 3 = 3 * 3 - 3 = 6

4 4 4 => 6
4 - √4 + 4 = 4 - Math.sqrt(4) + 4 = 6

5 5 5 => 6
5 / 5 + 5 = 5 / 5 + 5 = 6

6 6 6 => 6
6 - 6 + 6 = 6 - 6 + 6 = 6

7 7 7 => 6
~7 / 7 + 7 = -(7) / 7 + 7 = 6

8 8 8 => 6
8 - √(√(8 + 8)) = 8 - Math.sqrt((Math.sqrt((8 + 8)))) = 6

9 9 9 => 6
~9 / √9 + 9 = -(9) / Math.sqrt(9) + 9 = 6

10 10 10 => 6
L(√10) * 10 + L10 = Math.log10((Math.sqrt(10))) * 10 + Math.log10(10) = 6

5 5 5 1 => 24
5 * (5 - 1 / 5) = 5 * (5 - 1 / 5) = 24

5 5 5 1 => 25
5 + 5 * (5 - 1) = 5 + 5 * (5 - 1) = 25

3 3 3 8 => 24
3 + 3 * 8 - 3 = 3 + 3 * 8 - 3 = 24

2 3 4 5 => 24
2 * (3 + 4 + 5) = 2 * (3 + 4 + 5) = 24
```
