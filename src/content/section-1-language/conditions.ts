import type { Chapter } from '../types'

export default {
  id: 'conditions',
  title: 'Условия: if, else, switch',
  description: 'Условные конструкции и ветвление',
  blocks: [
    {
      type: 'prose',
      markdown: `# Условия: if, else, switch

Программы редко выполняются строго последовательно — почти всегда нужно принимать решения в зависимости от данных. В языке C для этого существуют **условные конструкции**: \`if\`, \`else\`, \`switch\` и тернарный оператор.

В этой главе мы разберём каждую из них, научимся комбинировать условия и избегать типичных ошибок.`,
    },
    {
      type: 'prose',
      markdown: `## Оператор if

Простейшая условная конструкция — \`if\`. Она выполняет блок кода, только если условие истинно (не равно нулю).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int temperature = 35;

    if (temperature > 30) {
        printf("На улице жарко!\\n");
    }

    return 0;
}`,
      filename: 'if_basic.c',
    },
    {
      type: 'output',
      content: 'На улице жарко!',
      prompt: '$ gcc if_basic.c -o if_basic && ./if_basic',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Частая ошибка: = вместо ==',
      markdown: `Одна из самых распространённых ошибок в C — использование оператора присваивания \`=\` вместо оператора сравнения \`==\` внутри условия:

\`\`\`c
if (x = 5) { ... }  // ОШИБКА: присваивает 5 переменной x, условие всегда истинно
if (x == 5) { ... } // ПРАВИЛЬНО: сравнивает x с 5
\`\`\`

Компилятор может выдать предупреждение, но код скомпилируется. Включайте флаг \`-Wall\` при компиляции!`,
    },
    {
      type: 'prose',
      markdown: `## if-else

Конструкция \`if-else\` позволяет выполнить один блок кода, если условие истинно, и другой — если ложно.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int age = 16;

    if (age >= 18) {
        printf("Вы совершеннолетний.\\n");
    } else {
        printf("Вы несовершеннолетний.\\n");
    }

    return 0;
}`,
      filename: 'if_else.c',
    },
    {
      type: 'prose',
      markdown: `## Цепочка else if

Когда нужно проверить несколько взаимоисключающих условий, используется цепочка \`else if\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int score = 75;

    if (score >= 90) {
        printf("Отлично (A)\\n");
    } else if (score >= 80) {
        printf("Хорошо (B)\\n");
    } else if (score >= 70) {
        printf("Удовлетворительно (C)\\n");
    } else if (score >= 60) {
        printf("Посредственно (D)\\n");
    } else {
        printf("Неудовлетворительно (F)\\n");
    }

    return 0;
}`,
      filename: 'else_if_chain.c',
    },
    {
      type: 'output',
      content: 'Удовлетворительно (C)',
      prompt: '$ gcc else_if_chain.c -o else_if_chain && ./else_if_chain',
    },
    {
      type: 'prose',
      markdown: `## Оператор switch

Когда нужно сравнить одно значение с несколькими константами, удобнее использовать \`switch\`. Он работает с целочисленными типами (\`int\`, \`char\`, \`enum\`).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int day = 3;

    switch (day) {
        case 1:
            printf("Понедельник\\n");
            break;
        case 2:
            printf("Вторник\\n");
            break;
        case 3:
            printf("Среда\\n");
            break;
        case 4:
            printf("Четверг\\n");
            break;
        case 5:
            printf("Пятница\\n");
            break;
        case 6:
            printf("Суббота\\n");
            break;
        case 7:
            printf("Воскресенье\\n");
            break;
        default:
            printf("Неверный номер дня\\n");
            break;
    }

    return 0;
}`,
      filename: 'switch_days.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Не забывайте break!',
      markdown: `Без оператора \`break\` выполнение «проваливается» (fall-through) в следующий \`case\`. Иногда это делается намеренно, но чаще это ошибка:

\`\`\`c
switch (x) {
    case 1:
        printf("один\\n");
        // нет break — выполнится и case 2!
    case 2:
        printf("два\\n");
        break;
}
\`\`\`

Если \`x == 1\`, будет напечатано и «один», и «два».`,
    },
    {
      type: 'prose',
      markdown: `## Тернарный оператор

Тернарный оператор \`? :\` — это краткая форма \`if-else\`, которая возвращает значение. Синтаксис: \`условие ? значение_если_истина : значение_если_ложь\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int a = 10, b = 20;

    int max = (a > b) ? a : b;
    printf("Максимум: %d\\n", max);

    // Тернарный оператор удобен для простых условий
    printf("Число %d %s\\n", a, (a % 2 == 0) ? "чётное" : "нечётное");

    return 0;
}`,
      filename: 'ternary.c',
    },
    {
      type: 'output',
      content: 'Максимум: 20\nЧисло 10 чётное',
      prompt: '$ gcc ternary.c -o ternary && ./ternary',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Когда использовать тернарный оператор',
      markdown: `Тернарный оператор хорош для простых выборов из двух значений. Если логика сложная или требуется выполнить несколько действий, используйте обычный \`if-else\` — код будет читабельнее.`,
    },
    {
      type: 'codeDiff',
      before: `// Сложное условие — трудно читать
int result = (a > 0 && b > 0) ? (a * b > 100 ? a : b) : (a < b ? a : b);`,
      after: `// Лучше использовать if-else
int result;
if (a > 0 && b > 0) {
    result = (a * b > 100) ? a : b;
} else {
    result = (a < b) ? a : b;
}`,
      language: 'c',
      description: 'Вложенные тернарные операторы лучше заменить на if-else',
    },
    {
      type: 'prose',
      markdown: `## Истинность в C

В языке C нет встроенного типа \`bool\` (до C99). Любое ненулевое значение считается **истинным**, а ноль — **ложным**:

- \`0\` — ложь
- Любое другое число (\`1\`, \`-5\`, \`42\`) — истина
- Нулевой указатель \`NULL\` — ложь
- Ненулевой указатель — истина

Начиная с C99 можно подключить \`<stdbool.h>\` и использовать тип \`bool\` со значениями \`true\` и \`false\`.`,
    },
    {
      type: 'quiz',
      question: 'Что выведет следующий код?\n\n```c\nint x = 0;\nif (x) {\n    printf("A");\n} else if (x == 0) {\n    printf("B");\n} else {\n    printf("C");\n}\n```',
      options: ['A', 'B', 'C', 'Ничего не выведет', 'Ошибка компиляции'],
      correctIndex: 1,
      explanation: 'Переменная x равна 0, что считается ложным значением, поэтому первое условие if (x) не выполняется. Затем проверяется else if (x == 0) — это истина, поэтому выводится «B».',
    },
    {
      type: 'quiz',
      question: 'Какой вариант switch корректно обрабатывает несколько значений одним блоком кода?',
      options: [
        'case 1 || 2 || 3: printf("low"); break;',
        'case 1, 2, 3: printf("low"); break;',
        'case 1: case 2: case 3: printf("low"); break;',
        'case (1-3): printf("low"); break;',
      ],
      correctIndex: 2,
      explanation: 'В C для обработки нескольких значений одним блоком используется «проваливание» (fall-through): несколько меток case подряд без break. Запись case 1: case 2: case 3: — единственно корректный способ.',
    },
  ],
} satisfies Chapter
