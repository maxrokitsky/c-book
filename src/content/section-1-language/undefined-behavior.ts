import type { Chapter } from '../types'

export default {
  id: 'undefined-behavior',
  title: 'Неопределённое поведение',
  description: 'UB, implementation-defined, unspecified поведение',
  blocks: [
    {
      type: 'prose',
      markdown:
        'Стандарт C определяет три категории поведения, которое **не фиксировано** полностью:\n\n- **Неопределённое поведение (Undefined Behavior, UB)** — стандарт не накладывает никаких ограничений. Программа может делать что угодно: аварийно завершиться, вывести мусор, отформатировать диск или работать «правильно» на одном компиляторе и падать на другом.\n- **Определяемое реализацией (Implementation-defined)** — поведение задаётся компилятором и документируется. Например, результат сдвига отрицательного числа вправо.\n- **Неспецифицированное (Unspecified)** — стандарт допускает несколько вариантов, компилятор выбирает один, но не обязан документировать. Например, порядок вычисления аргументов функции.',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'UB — не просто «что-то странное»',
      markdown:
        'Компилятор имеет право предполагать, что UB **никогда не происходит**. Это даёт ему свободу для агрессивных оптимизаций: он может удалить проверки, переупорядочить код или полностью убрать ветки, которые ведут к UB. Поэтому UB опасен даже если «на практике работает».',
    },
    {
      type: 'prose',
      markdown:
        '## Распространённые случаи UB\n\n### 1. Разыменование нулевого указателя',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int *ptr = NULL;
    /* UB: разыменование нулевого указателя */
    printf("%d\\n", *ptr);
    return 0;
}`,
      filename: 'ub_null_deref.c',
    },
    {
      type: 'prose',
      markdown:
        '### 2. Выход за границы массива',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    /* UB: индекс за пределами массива */
    printf("%d\\n", arr[10]);

    /* UB: запись за пределы массива */
    arr[-1] = 42;
    return 0;
}`,
      filename: 'ub_out_of_bounds.c',
    },
    {
      type: 'prose',
      markdown:
        '### 3. Знаковое целочисленное переполнение',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <limits.h>

int main(void) {
    int x = INT_MAX;
    /* UB: переполнение знакового целого */
    int y = x + 1;
    printf("INT_MAX + 1 = %d\\n", y);

    /*
     * Компилятор может предполагать, что x + 1 > x
     * всегда истинно, и оптимизировать проверки.
     */
    if (x + 1 > x) {
        printf("Это может быть удалено компилятором!\\n");
    }
    return 0;
}`,
      filename: 'ub_overflow.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Беззнаковые типы не вызывают UB',
      markdown:
        'Переполнение `unsigned` типов — **не UB**. Результат определён стандартом как редуцирование по модулю `2^N`, где `N` — количество бит. Это гарантированное «заворачивание» (wrapping).',
    },
    {
      type: 'prose',
      markdown:
        '### 4. Использование неинициализированных переменных',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int x; /* не инициализирована */
    /* UB: чтение неинициализированной переменной */
    if (x == 0) {
        printf("Ноль\\n");
    } else {
        printf("Не ноль: %d\\n", x);
    }
    return 0;
}`,
      filename: 'ub_uninitialized.c',
    },
    {
      type: 'prose',
      markdown:
        '### 5. Нарушение strict aliasing\n\nСтрогое правило алиасинга запрещает обращаться к объекту через указатель несовместимого типа (за исключением `char *`). Компилятор может предположить, что указатели разных типов не указывают на одну область.',
    },
    {
      type: 'codeDiff',
      before: `/* UB: нарушение strict aliasing */
float x = 3.14f;
int bits = *(int *)&x;  /* UB! */`,
      after: `/* Корректно: через memcpy */
#include <string.h>
float x = 3.14f;
int bits;
memcpy(&bits, &x, sizeof(bits));`,
      language: 'c',
      description: 'Правильный способ type-punning через memcpy вместо приведения указателей',
    },
    {
      type: 'prose',
      markdown:
        '## Implementation-defined поведение\n\nЭти случаи документируются в описании компилятора:',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    /* Implementation-defined: размер типов */
    printf("sizeof(long) = %zu\\n", sizeof(long));
    /* 4 на Windows (LLP64), 8 на Linux (LP64) */

    /* Implementation-defined: сдвиг отрицательного числа вправо */
    int neg = -8;
    int result = neg >> 1;
    /* Может быть арифметическим (-4) или логическим */
    printf("-8 >> 1 = %d\\n", result);

    /* Implementation-defined: знаковость char */
    char c = 200;
    printf("char 200 = %d\\n", (int)c);
    /* Может быть 200 (unsigned char) или -56 (signed char) */

    return 0;
}`,
      filename: 'impl_defined.c',
    },
    {
      type: 'quiz',
      question: 'Какое из следующих действий является неопределённым поведением?',
      options: [
        'Переполнение unsigned int',
        'Деление signed int на ноль',
        'Приведение int к short с потерей данных',
        'Чтение поля объединения, отличного от последнего записанного',
      ],
      correctIndex: 1,
      explanation:
        'Деление на ноль для знаковых и беззнаковых целых — UB. Переполнение unsigned — определено (wrapping). Сужающее приведение — implementation-defined. Чтение неактивного поля union в C (не C++) — допустимо стандартом как type-punning.',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Как защититься от UB',
      markdown:
        '- Компилируйте с флагами предупреждений: `-Wall -Wextra -Werror`\n- Используйте sanitizers: `-fsanitize=undefined,address`\n- Инициализируйте все переменные\n- Проверяйте указатели на `NULL` перед разыменованием\n- Проверяйте границы массивов\n- Не полагайтесь на конкретное поведение UB, даже если «работает»',
    },
    {
      type: 'exercise',
      title: 'Найдите все случаи UB',
      description:
        'В приведённой ниже программе содержится как минимум 4 случая неопределённого поведения. Найдите их все и исправьте программу так, чтобы она компилировалась и работала корректно.\n\n```c\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int arr[3] = {10, 20, 30};\n    int sum;\n    for (int i = 0; i <= 3; i++)\n        sum += arr[i];\n    \n    int *p = malloc(sizeof(int));\n    free(p);\n    *p = 42;\n    \n    int x = 2147483647;\n    x = x + 1;\n    \n    printf("sum=%d, *p=%d, x=%d\\n", sum, *p, x);\n    return 0;\n}\n```',
      hints: [
        '`sum` не инициализирована — чтение неинициализированной переменной',
        'Цикл `i <= 3` при массиве размером 3 — выход за границу',
        'Запись и чтение `*p` после `free(p)` — use-after-free',
        'Сложение `INT_MAX + 1` — знаковое переполнение',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

int main(void) {
    int arr[3] = {10, 20, 30};
    int sum = 0; /* инициализация */
    for (int i = 0; i < 3; i++) /* i < 3, не <= 3 */
        sum += arr[i];

    int *p = malloc(sizeof(int));
    if (!p) return 1;
    *p = 42; /* запись до free */
    int p_val = *p; /* чтение до free */
    free(p);
    p = NULL; /* обнуление после free */

    /* Безопасная проверка переполнения */
    int x = INT_MAX;
    if (x <= INT_MAX - 1) {
        x = x + 1;
    } else {
        x = INT_MAX; /* или обработка ошибки */
    }

    printf("sum=%d, p_val=%d, x=%d\\n", sum, p_val, x);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
