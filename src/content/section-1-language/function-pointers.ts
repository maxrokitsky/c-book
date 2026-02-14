import type { Chapter } from '../types'

export default {
  id: 'function-pointers',
  title: 'Указатели на функции',
  description: 'Синтаксис, callback-функции, массивы указателей',
  blocks: [
    {
      type: 'prose',
      markdown: `# Указатели на функции

В C функции имеют адреса в памяти, и эти адреса можно сохранять в переменных-указателях. **Указатель на функцию** позволяет:

- Передавать функции как аргументы (callback-паттерн)
- Выбирать функцию во время выполнения
- Строить таблицы диспетчеризации
- Реализовывать полиморфизм без классов

Это один из мощнейших инструментов C, широко используемый в ядрах ОС, драйверах и библиотеках.`,
    },
    {
      type: 'prose',
      markdown: `## Синтаксис объявления

Синтаксис указателей на функции — одна из самых сложных частей C. Ключ к пониманию — читать объявление «изнутри наружу»:

\`\`\`
тип_возврата (*имя_указателя)(типы_параметров);
\`\`\`

Скобки вокруг \`*имя_указателя\` обязательны! Без них \`int *func(int)\` — это функция, возвращающая \`int *\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int main(void) {
    /* Объявление указателя на функцию (int, int) -> int */
    int (*operation)(int, int);

    operation = add;         /* Имя функции = её адрес */
    printf("add: %d\\n", operation(10, 3));

    operation = &sub;        /* & необязателен, но допустим */
    printf("sub: %d\\n", operation(10, 3));

    operation = mul;
    printf("mul: %d\\n", (*operation)(10, 3));  /* Явное разыменование тоже работает */

    return 0;
}`,
      filename: 'func_ptr_basics.c',
    },
    {
      type: 'output',
      content: `add: 13
sub: 7
mul: 30`,
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'typedef для упрощения синтаксиса',
      markdown:
        'Указатели на функции резко упрощаются с `typedef`:\n'
        + '```c\n'
        + 'typedef int (*BinaryOp)(int, int);\n'
        + 'BinaryOp op = add; /* Чисто и понятно */\n'
        + '```\n'
        + 'Всегда используйте `typedef` для указателей на функции — '
        + 'это значительно улучшает читаемость кода.',
    },
    {
      type: 'prose',
      markdown: `## Callback-функции

Callback (обратный вызов) — это функция, которая передаётся как аргумент другой функции и вызывается в нужный момент. Это основной паттерн использования указателей на функции.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

/* typedef для удобства */
typedef int (*Comparator)(const void *, const void *);

/* Сравнение по возрастанию */
int compare_asc(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

/* Сравнение по убыванию */
int compare_desc(const void *a, const void *b) {
    return *(const int *)b - *(const int *)a;
}

/* Сравнение по чётности: чётные перед нечётными */
int compare_even_first(const void *a, const void *b) {
    int va = *(const int *)a;
    int vb = *(const int *)b;
    int ea = va % 2 == 0;
    int eb = vb % 2 == 0;
    if (ea != eb) return eb - ea;  /* Чётные первыми */
    return va - vb;
}

void print_array(const int *arr, int n) {
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main(void) {
    int data[] = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    int n = sizeof(data) / sizeof(data[0]);

    /* qsort принимает callback для сравнения */
    int copy[9];

    memcpy(copy, data, sizeof(data));
    qsort(copy, n, sizeof(int), compare_asc);
    printf("По возрастанию:  "); print_array(copy, n);

    memcpy(copy, data, sizeof(data));
    qsort(copy, n, sizeof(int), compare_desc);
    printf("По убыванию:     "); print_array(copy, n);

    memcpy(copy, data, sizeof(data));
    qsort(copy, n, sizeof(int), compare_even_first);
    printf("Чётные первыми:  "); print_array(copy, n);

    return 0;
}`,
      filename: 'callbacks.c',
    },
    {
      type: 'output',
      content: `По возрастанию:  1 2 3 4 5 6 7 8 9
По убыванию:     9 8 7 6 5 4 3 2 1
Чётные первыми:  2 4 6 8 1 3 5 7 9`,
    },
    {
      type: 'prose',
      markdown: `## Массивы указателей на функции

Массив указателей на функции — мощный механизм для создания таблиц диспетчеризации. Вместо длинной цепочки \`if-else\` или \`switch\` вы индексируете массив и вызываете нужную функцию.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

typedef double (*MathFunc)(double, double);

double op_add(double a, double b) { return a + b; }
double op_sub(double a, double b) { return a - b; }
double op_mul(double a, double b) { return a * b; }
double op_div(double a, double b) { return b != 0 ? a / b : 0; }

int main(void) {
    /* Таблица диспетчеризации */
    MathFunc operations[] = { op_add, op_sub, op_mul, op_div };
    const char *symbols[] = { "+", "-", "*", "/" };

    double a = 10.0, b = 3.0;

    for (int i = 0; i < 4; i++) {
        printf("%.1f %s %.1f = %.2f\\n", a, symbols[i], b, operations[i](a, b));
    }

    /* Выбор операции по индексу */
    printf("\\nВведите номер операции (0-3): ");
    int choice = 2;  /* Для примера: умножение */
    printf("Результат: %.2f\\n", operations[choice](a, b));

    return 0;
}`,
      filename: 'dispatch_table.c',
    },
    {
      type: 'output',
      content: `10.0 + 3.0 = 13.00
10.0 - 3.0 = 7.00
10.0 * 3.0 = 30.00
10.0 / 3.0 = 3.33

Введите номер операции (0-3): Результат: 30.00`,
    },
    {
      type: 'prose',
      markdown: `## Полиморфизм через указатели на функции

Указатели на функции позволяют реализовать аналог виртуальных методов из ООП-языков. Структура содержит указатели на функции, которые «переопределяются» при создании конкретного экземпляра.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <math.h>

/* «Интерфейс» фигуры */
typedef struct Shape {
    const char *name;
    double (*area)(const struct Shape *self);
    void (*describe)(const struct Shape *self);
    double params[2];  /* Параметры фигуры */
} Shape;

double circle_area(const Shape *s) {
    return M_PI * s->params[0] * s->params[0];
}

double rect_area(const Shape *s) {
    return s->params[0] * s->params[1];
}

void circle_describe(const Shape *s) {
    printf("Круг (r=%.1f): площадь = %.2f\\n", s->params[0], s->area(s));
}

void rect_describe(const Shape *s) {
    printf("Прямоугольник (%.1fx%.1f): площадь = %.2f\\n",
           s->params[0], s->params[1], s->area(s));
}

Shape make_circle(double radius) {
    return (Shape){
        .name = "Круг",
        .area = circle_area,
        .describe = circle_describe,
        .params = {radius, 0}
    };
}

Shape make_rect(double w, double h) {
    return (Shape){
        .name = "Прямоугольник",
        .area = rect_area,
        .describe = rect_describe,
        .params = {w, h}
    };
}

int main(void) {
    Shape shapes[] = {
        make_circle(5.0),
        make_rect(4.0, 6.0),
        make_circle(3.0),
        make_rect(10.0, 2.5),
    };
    int n = sizeof(shapes) / sizeof(shapes[0]);

    /* Единообразный вызов — полиморфизм! */
    double total = 0;
    for (int i = 0; i < n; i++) {
        shapes[i].describe(&shapes[i]);
        total += shapes[i].area(&shapes[i]);
    }
    printf("Общая площадь: %.2f\\n", total);

    return 0;
}`,
      filename: 'polymorphism.c',
    },
    {
      type: 'output',
      content: `Круг (r=5.0): площадь = 78.54
Прямоугольник (4.0x6.0): площадь = 24.00
Круг (r=3.0): площадь = 28.27
Прямоугольник (10.0x2.5): площадь = 25.00
Общая площадь: 155.81`,
    },
    {
      type: 'quiz',
      question: 'Что объявляет `int (*fp)(double, double);`?',
      options: [
        'Функцию fp, принимающую два double и возвращающую указатель на int',
        'Указатель fp на функцию, принимающую два double и возвращающую int',
        'Указатель на массив из двух double',
        'Функцию, возвращающую указатель на функцию',
      ],
      correctIndex: 1,
      explanation:
        'Скобки вокруг `(*fp)` определяют, что `fp` — указатель. '
        + 'Он указывает на функцию с двумя параметрами `double` '
        + 'и типом возврата `int`. Без скобок `int *fp(double, double)` '
        + 'было бы объявлением функции, возвращающей `int *`.',
    },
    {
      type: 'exercise',
      title: 'Универсальная функция map',
      description:
        'Реализуйте функцию `void array_map(int *arr, int n, int (*transform)(int))`, '
        + 'которая применяет функцию `transform` к каждому элементу массива. '
        + 'Напишите несколько функций-трансформеров (удвоение, квадрат, абсолютное значение) '
        + 'и продемонстрируйте работу.',
      hints: [
        'Функция map проходит по массиву и заменяет каждый элемент результатом вызова transform',
        'Трансформеры — обычные функции с сигнатурой int(int)',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

void array_map(int *arr, int n, int (*transform)(int)) {
    for (int i = 0; i < n; i++) {
        arr[i] = transform(arr[i]);
    }
}

int double_val(int x)  { return x * 2; }
int square(int x)      { return x * x; }
int absolute(int x)    { return abs(x); }

void print_array(const int *arr, int n) {
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
}

int main(void) {
    int data[] = {-3, 1, -4, 1, 5, -9, 2, 6};
    int n = sizeof(data) / sizeof(data[0]);

    printf("Исходный:    "); print_array(data, n);

    array_map(data, n, absolute);
    printf("abs:         "); print_array(data, n);

    array_map(data, n, double_val);
    printf("Удвоение:    "); print_array(data, n);

    array_map(data, n, square);
    printf("Квадрат:     "); print_array(data, n);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
