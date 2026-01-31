# Java Programs Output

## 1. java OddEven 5

### Source Code

```java
public class OddEven {
    public static void main(String[] args) {
        int number = Integer.parseInt(args[0]);
        if (number % 2 == 0) {
            System.out.println(number + " is Even");
        } else {
            System.out.println(number + " is Odd");
        }
    }
}

```

### Output

```
5 is Odd

```

## 2. java SumOfTwo 10 20

### Source Code

```java
public class SumOfTwo {
    public static void main(String[] args) {
        int num1 = Integer.parseInt(args[0]);
        int num2 = Integer.parseInt(args[1]);
        int sum = num1 + num2;
        System.out.println("Sum of " + num1 + " and " + num2 + " is " + sum);
    }
}

```

### Output

```
Sum of 10 and 20 is 30

```

## 3. java SimpleInterest 1000 5 2

### Source Code

```java
public class SimpleInterest {
    public static void main(String[] args) {
        double principal = Double.parseDouble(args[0]);
        double rate = Double.parseDouble(args[1]);
        double time = Double.parseDouble(args[2]);
        double interest = (principal * rate * time) / 100;
        System.out.println("Simple Interest: " + interest);
    }
}

```

### Output

```
Simple Interest: 100.0

```

## 4. java PositiveNegative 15

### Source Code

```java
public class PositiveNegative {
    public static void main(String[] args) {
        int number = Integer.parseInt(args[0]);
        if (number > 0) {
            System.out.println(number + " is Positive");
        } else if (number < 0) {
            System.out.println(number + " is Negative");
        } else {
            System.out.println(number + " is Zero");
        }
    }
}

```

### Output

```
15 is Positive

```

## 5. java LeapYear 2024

### Source Code

```java
public class LeapYear {
    public static void main(String[] args) {
        int year = Integer.parseInt(args[0]);
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            System.out.println(year + " is a Leap Year");
        } else {
            System.out.println(year + " is Not a Leap Year");
        }
    }
}

```

### Output

```
2024 is a Leap Year

```

## 6. java CharacterVowel a

### Source Code

```java
public class CharacterVowel {
    public static void main(String[] args) {
        char ch = args[0].charAt(0);
        ch = Character.toLowerCase(ch);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            System.out.println(ch + " is a Vowel");
        } else {
            System.out.println(ch + " is a Consonant");
        }
    }
}

```

### Output

```
a is a Vowel

```

## 7. java ReverseNumber 12345

### Source Code

```java
public class ReverseNumber {
    public static void main(String[] args) {
        long number = Long.parseLong(args[0]);
        long reversed = 0;
        while (number != 0) {
            reversed = reversed * 10 + number % 10;
            number /= 10;
        }
        System.out.println("Reversed Number: " + reversed);
    }
}

```

### Output

```
Reversed Number: 54321

```

## 8. java FibonacciSeries 50

### Source Code

```java
public class FibonacciSeries {
    public static void main(String[] args) {
        int limit = Integer.parseInt(args[0]);
        int a = 0, b = 1;
        System.out.print(a);
        while (b <= limit) {
            System.out.print(", " + b);
            int temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println();
    }
}

```

### Output

```
0, 1, 1, 2, 3, 5, 8, 13, 21, 34

```

## 9. java MultiplicationTable 5

### Source Code

```java
public class MultiplicationTable {
    public static void main(String[] args) {
        int number = Integer.parseInt(args[0]);
        for (int i = 1; i <= 10; i++) {
            System.out.println(number + " x " + i + " = " + (number * i));
        }
    }
}

```

### Output

```
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 x 6 = 30
5 x 7 = 35
5 x 8 = 40
5 x 9 = 45
5 x 10 = 50

```

## 10. java DaysInMonth 2

### Source Code

```java
public class DaysInMonth {
    public static void main(String[] args) {
        int month = Integer.parseInt(args[0]);
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                System.out.println("31 days");
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                System.out.println("30 days");
                break;
            case 2:
                System.out.println("28 or 29 days");
                break;
            default:
                System.out.println("Invalid month");
        }
    }
}

```

### Output

```
28 or 29 days

```

## 11. java ArmstrongNumber 153

### Source Code

```java
public class ArmstrongNumber {
    public static void main(String[] args) {
        int number = Integer.parseInt(args[0]);
        int original = number;
        int sum = 0;
        while (number > 0) {
            int digit = number % 10;
            sum += digit * digit * digit;
            number /= 10;
        }
        if (sum == original) {
            System.out.println(original + " is an Armstrong Number");
        } else {
            System.out.println(original + " is Not an Armstrong Number");
        }
    }
}

```

### Output

```
153 is an Armstrong Number

```

## 12. java PrimeNumber 17

### Source Code

```java
public class PrimeNumber {
    public static void main(String[] args) {
        int number = Integer.parseInt(args[0]);
        boolean isPrime = true;
        if (number <= 1) {
            isPrime = false;
        } else {
            for (int i = 2; i <= number / 2; i++) {
                if (number % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }
        if (isPrime) {
            System.out.println(number + " is a Prime Number");
        } else {
            System.out.println(number + " is Not a Prime Number");
        }
    }
}

```

### Output

```
17 is a Prime Number

```

## 13. java PalindromeString racecar

### Source Code

```java
public class PalindromeString {
    public static void main(String[] args) {
        String str = args[0];
        String reversed = new StringBuilder(str).reverse().toString();
        if (str.equals(reversed)) {
            System.out.println(str + " is a Palindrome");
        } else {
            System.out.println(str + " is Not a Palindrome");
        }
    }
}

```

### Output

```
racecar is a Palindrome

```

## 14. java RightTrianglePattern 5

### Source Code

```java
public class RightTrianglePattern {
    public static void main(String[] args) {
        int rows = Integer.parseInt(args[0]);
        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}

```

### Output

```
*
**
***
****
*****

```

## 15. java PyramidPattern 4

### Source Code

```java
public class PyramidPattern {
    public static void main(String[] args) {
        int rows = Integer.parseInt(args[0]);
        int number = 1;
        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(number + " ");
                number++;
            }
            System.out.println();
        }
    }
}

```

### Output

```
1
2 3
4 5 6
7 8 9 10

```

[π](https://github.com/mohit-rajput-py)