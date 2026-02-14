import type { Chapter } from '../types'

export default {
  id: 'loops',
  title: 'Циклы',
  description: 'for, while, do-while, break, continue',
  blocks: [
    {
      type: 'prose',
      markdown: `# Циклы

Циклы позволяют выполнять один и тот же блок кода многократно. В языке C есть три вида циклов: \`for\`, \`while\` и \`do-while\`. Каждый из них подходит для определённых задач.`,
    },
    {
      type: 'prose',
      markdown: `## Цикл for

Цикл \`for\` — самый распространённый. Он состоит из трёх частей: **инициализация**, **условие** и **обновление**:

\`\`\`
for (инициализация; условие; обновление) {
    тело цикла
}
\`\`\`

Цикл работает так:
1. Выполняется **инициализация** (один раз).
2. Проверяется **условие** — если ложно, цикл завершается.
3. Выполняется **тело цикла**.
4. Выполняется **обновление**.
5. Переход к шагу 2.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Вывод чисел от 1 до 10
    for (int i = 1; i <= 10; i++) {
        printf("%d ", i);
    }
    printf("\\n");

    // Вывод чётных чисел от 0 до 20
    for (int i = 0; i <= 20; i += 2) {
        printf("%d ", i);
    }
    printf("\\n");

    return 0;
}`,
      filename: 'for_basic.c',
    },
    {
      type: 'output',
      content: '1 2 3 4 5 6 7 8 9 10\n0 2 4 6 8 10 12 14 16 18 20',
      prompt: '$ gcc for_basic.c -o for_basic && ./for_basic',
    },
    {
      type: 'prose',
      markdown: `## Цикл while

Цикл \`while\` выполняет тело, пока условие истинно. Он удобен, когда количество итераций заранее неизвестно.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Подсчёт количества цифр в числе
    int number = 123456;
    int digits = 0;
    int temp = number;

    while (temp > 0) {
        temp /= 10;
        digits++;
    }

    printf("В числе %d содержится %d цифр\\n", number, digits);

    return 0;
}`,
      filename: 'while_digits.c',
    },
    {
      type: 'output',
      content: 'В числе 123456 содержится 6 цифр',
      prompt: '$ gcc while_digits.c -o while_digits && ./while_digits',
    },
    {
      type: 'prose',
      markdown: `## Цикл do-while

Цикл \`do-while\` похож на \`while\`, но **сначала выполняет тело**, а потом проверяет условие. Это гарантирует, что тело выполнится хотя бы один раз.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int number;

    // Запрашиваем положительное число у пользователя
    do {
        printf("Введите положительное число: ");
        scanf("%d", &number);
    } while (number <= 0);

    printf("Вы ввели: %d\\n", number);

    return 0;
}`,
      filename: 'do_while_input.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Когда использовать do-while',
      markdown: `Цикл \`do-while\` особенно полезен для валидации пользовательского ввода, меню и ситуаций, когда действие нужно выполнить как минимум один раз перед проверкой условия.`,
    },
    {
      type: 'prose',
      markdown: `## break и continue

Два ключевых слова управляют ходом цикла:

- **\`break\`** — немедленно прерывает цикл и выходит из него.
- **\`continue\`** — пропускает оставшуюся часть текущей итерации и переходит к следующей.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // break: найти первое число, делящееся на 7 и на 3
    for (int i = 1; i <= 100; i++) {
        if (i % 7 == 0 && i % 3 == 0) {
            printf("Первое число, делящееся на 7 и 3: %d\\n", i);
            break;
        }
    }

    // continue: вывести все числа от 1 до 20, кроме кратных 5
    printf("Числа от 1 до 20 (без кратных 5): ");
    for (int i = 1; i <= 20; i++) {
        if (i % 5 == 0) {
            continue;
        }
        printf("%d ", i);
    }
    printf("\\n");

    return 0;
}`,
      filename: 'break_continue.c',
    },
    {
      type: 'output',
      content: 'Первое число, делящееся на 7 и 3: 21\nЧисла от 1 до 20 (без кратных 5): 1 2 3 4 6 7 8 9 11 12 13 14 16 17 18 19',
      prompt: '$ gcc break_continue.c -o break_continue && ./break_continue',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Бесконечные циклы',
      markdown: `Если условие цикла никогда не становится ложным, цикл выполняется бесконечно. Иногда это делается намеренно:

\`\`\`c
while (1) {
    // бесконечный цикл — выход через break
}

for (;;) {
    // эквивалентный бесконечный цикл
}
\`\`\`

Убедитесь, что внутри такого цикла есть условие с \`break\`, иначе программа зависнет.`,
    },
    {
      type: 'prose',
      markdown: `## Вложенные циклы

Циклы можно вкладывать друг в друга. Это часто используется для работы с двумерными структурами (таблицами, матрицами).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Таблица умножения 5x5
    for (int i = 1; i <= 5; i++) {
        for (int j = 1; j <= 5; j++) {
            printf("%4d", i * j);
        }
        printf("\\n");
    }

    return 0;
}`,
      filename: 'nested_loops.c',
    },
    {
      type: 'output',
      content: '   1   2   3   4   5\n   2   4   6   8  10\n   3   6   9  12  15\n   4   8  12  16  20\n   5  10  15  20  25',
      prompt: '$ gcc nested_loops.c -o nested_loops && ./nested_loops',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'break во вложенных циклах',
      markdown: `Оператор \`break\` прерывает только **ближайший** цикл. Чтобы выйти из нескольких вложенных циклов, можно использовать флаговую переменную или \`goto\` (в редких случаях это оправдано).`,
    },
    {
      type: 'codeDiff',
      before: `// Выход только из внутреннего цикла
for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        if (matrix[i][j] == target) {
            break; // выйдет только из цикла по j
        }
    }
}`,
      after: `// Выход из обоих циклов с помощью флага
int found = 0;
for (int i = 0; i < 10 && !found; i++) {
    for (int j = 0; j < 10 && !found; j++) {
        if (matrix[i][j] == target) {
            found = 1;
        }
    }
}`,
      language: 'c',
      description: 'Использование флаговой переменной для выхода из вложенных циклов',
    },
    {
      type: 'quiz',
      question: 'Сколько раз выполнится тело следующего цикла?\n\n```c\nint i = 10;\nwhile (i > 0) {\n    i -= 3;\n}\n```',
      options: ['3 раза', '4 раза', '10 раз', 'Бесконечно'],
      correctIndex: 1,
      explanation: 'Значения i по итерациям: 10 -> 7 -> 4 -> 1 -> -2. После четвёртой итерации i = -2, условие i > 0 ложно, цикл завершается. Итого 4 итерации.',
    },
    {
      type: 'exercise',
      title: 'Вывод треугольника из звёздочек',
      description: `Напишите программу, которая выводит прямоугольный треугольник из символов \`*\`. Количество строк задаётся переменной \`n\`. Например, для \`n = 5\`:

\`\`\`
*
**
***
****
*****
\`\`\`

Используйте вложенные циклы \`for\`.`,
      hints: [
        'Внешний цикл перебирает строки от 1 до n.',
        'Внутренний цикл в каждой строке выводит столько звёздочек, сколько равен номер строки.',
        'После внутреннего цикла не забудьте вывести символ новой строки.',
      ],
      solution: `#include <stdio.h>

int main(void) {
    int n = 5;

    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            printf("*");
        }
        printf("\\n");
    }

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
