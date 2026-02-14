import type { Chapter } from '../types'

export default {
  id: 'pointers-intro',
  title: 'Введение в указатели',
  description: 'Адреса, разыменование, NULL',
  blocks: [
    {
      type: 'prose',
      markdown: `# Введение в указатели

Указатели — одна из самых мощных и одновременно сложных возможностей языка C. Указатель — это переменная, которая хранит **адрес** другой переменной в памяти. Понимание указателей необходимо для работы с динамической памятью, массивами, строками и структурами данных.`,
    },
    {
      type: 'prose',
      markdown: `## Адреса в памяти

Каждая переменная в программе занимает место в оперативной памяти и имеет уникальный **адрес**. Оператор \`&\` (адрес-оф) позволяет узнать этот адрес:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int x = 42;
    double y = 3.14;
    char c = 'A';

    printf("Значение x: %d,  адрес x: %p\\n", x, (void *)&x);
    printf("Значение y: %.2f, адрес y: %p\\n", y, (void *)&y);
    printf("Значение c: %c,    адрес c: %p\\n", c, (void *)&c);

    return 0;
}`,
      filename: 'addresses.c',
    },
    {
      type: 'output',
      content: 'Значение x: 42,  адрес x: 0x7ffd5a3b4c2c\nЗначение y: 3.14, адрес y: 0x7ffd5a3b4c30\nЗначение c: A,    адрес c: 0x7ffd5a3b4c2b',
      prompt: '$ gcc addresses.c -o addresses && ./addresses',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Формат адресов',
      markdown: `Адреса выводятся в шестнадцатеричном формате (префикс \`0x\`). Конкретные значения зависят от системы и запуска программы — они будут разными каждый раз. Спецификатор \`%p\` используется для вывода адресов, а приведение к \`(void *)\` обеспечивает корректный формат.`,
    },
    {
      type: 'prose',
      markdown: `## Объявление указателя

Указатель объявляется с помощью символа \`*\` перед именем переменной. Тип указателя определяет, на какой тип данных он указывает:

\`\`\`
тип *имя_указателя;
\`\`\``,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int x = 42;

    int *ptr = &x;  // ptr хранит адрес переменной x

    printf("Значение x: %d\\n", x);
    printf("Адрес x (&x): %p\\n", (void *)&x);
    printf("Значение ptr: %p\\n", (void *)ptr);
    printf("Значение по адресу ptr (*ptr): %d\\n", *ptr);

    return 0;
}`,
      filename: 'pointer_basic.c',
    },
    {
      type: 'diagram',
      component: 'PointerDiagram',
      props: {
        variables: [
          { name: 'x', type: 'int', value: '42', address: '0x1004' },
          { name: 'ptr', type: 'int *', value: '0x1004', address: '0x1008', pointsTo: 'x' },
        ],
      },
      caption: 'Указатель ptr хранит адрес переменной x. Стрелка показывает связь «указывает на».',
    },
    {
      type: 'prose',
      markdown: `## Операторы & и *

Два ключевых оператора для работы с указателями:

- **\`&\`** (адрес-оф) — возвращает адрес переменной.
- **\`*\`** (разыменование, dereference) — обращается к значению по адресу, хранящемуся в указателе.

Эти операторы — обратные друг другу: \`*(&x)\` эквивалентно \`x\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int a = 10;
    int *p = &a;

    printf("a = %d\\n", a);
    printf("*p = %d\\n", *p);  // Чтение через указатель

    // Изменение значения через указатель
    *p = 99;
    printf("\\nПосле *p = 99:\\n");
    printf("a = %d\\n", a);    // a тоже изменилась!
    printf("*p = %d\\n", *p);

    return 0;
}`,
      filename: 'deref.c',
    },
    {
      type: 'output',
      content: 'a = 10\n*p = 10\n\nПосле *p = 99:\na = 99\n*p = 99',
      prompt: '$ gcc deref.c -o deref && ./deref',
    },
    {
      type: 'prose',
      markdown: `## Указатели и функции

Указатели позволяют функциям изменять переменные вызывающего кода. Вместо передачи значения мы передаём **адрес** переменной:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

// Функция обмена значений двух переменных
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10, y = 20;

    printf("До swap: x = %d, y = %d\\n", x, y);
    swap(&x, &y);  // Передаём адреса
    printf("После swap: x = %d, y = %d\\n", x, y);

    return 0;
}`,
      filename: 'swap.c',
    },
    {
      type: 'output',
      content: 'До swap: x = 10, y = 20\nПосле swap: x = 20, y = 10',
      prompt: '$ gcc swap.c -o swap && ./swap',
    },
    {
      type: 'prose',
      markdown: `## NULL — нулевой указатель

Указатель, который никуда не указывает, должен быть установлен в \`NULL\`. Разыменование \`NULL\` вызывает **сбой программы** (segmentation fault). Всегда проверяйте указатель перед использованием.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

void print_value(int *ptr) {
    if (ptr == NULL) {
        printf("Ошибка: указатель равен NULL\\n");
        return;
    }
    printf("Значение: %d\\n", *ptr);
}

int main(void) {
    int x = 42;
    int *valid_ptr = &x;
    int *null_ptr = NULL;

    print_value(valid_ptr);  // Значение: 42
    print_value(null_ptr);   // Ошибка: указатель равен NULL

    return 0;
}`,
      filename: 'null_check.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Неинициализированные указатели',
      markdown: `Неинициализированный указатель содержит **мусорный адрес** и может указывать куда угодно. Его разыменование ещё опаснее, чем \`NULL\`, потому что может не вызвать немедленный сбой, а тихо испортить данные. Всегда инициализируйте указатели:

\`\`\`c
int *p;       // ОПАСНО: мусорный адрес
int *p = NULL; // БЕЗОПАСНО: можно проверить перед использованием
\`\`\``,
    },
    {
      type: 'diagram',
      component: 'MemoryVisualizer',
      props: {
        regions: [
          {
            name: 'Стек (Stack)',
            cells: [
              { address: '0x1000', name: 'x', value: '42', type: 'int' },
              { address: '0x1008', name: 'ptr', value: '0x1000', type: 'int *', pointsTo: '0x1000' },
              { address: '0x1010', name: 'null_ptr', value: 'NULL', type: 'int *' },
            ],
          },
        ],
      },
      caption: 'Переменные в стеке: ptr указывает на x (хранит его адрес), null_ptr не указывает никуда (NULL).',
    },
    {
      type: 'quiz',
      question: 'Что выведет следующий код?\n\n```c\nint a = 5;\nint *p = &a;\n*p = *p + 10;\nprintf("%d", a);\n```',
      options: ['5', '10', '15', 'Адрес переменной a'],
      correctIndex: 2,
      explanation: 'Указатель p указывает на переменную a. Выражение *p + 10 читает значение a (5) и прибавляет 10. Запись *p = 15 изменяет значение по адресу, то есть переменную a. Поэтому a становится равной 15.',
    },
    {
      type: 'quiz',
      question: 'Какое из следующих утверждений об указателях НЕВЕРНО?',
      options: [
        'Указатель хранит адрес переменной в памяти',
        'Разыменование NULL вызывает неопределённое поведение',
        'Размер указателя зависит от типа данных, на который он указывает',
        'Оператор & возвращает адрес переменной',
      ],
      correctIndex: 2,
      explanation: 'Размер указателя зависит от архитектуры системы (32 или 64 бита), а не от типа данных. На 64-битной системе sizeof(char *) == sizeof(double *) == 8 байт.',
    },
    {
      type: 'exercise',
      title: 'Функция нахождения минимума и максимума',
      description: `Напишите функцию \`void min_max(const int *arr, int size, int *out_min, int *out_max)\`, которая находит минимальное и максимальное значение в массиве и записывает их по переданным указателям \`out_min\` и \`out_max\`.

Пример использования:
\`\`\`c
int nums[] = {3, 7, 1, 9, 4, 6};
int min, max;
min_max(nums, 6, &min, &max);
printf("Мин: %d, Макс: %d\\n", min, max);
// Вывод: Мин: 1, Макс: 9
\`\`\`

Обратите внимание: функция возвращает два значения через указатели, потому что в C функция может вернуть только одно значение через \`return\`.`,
      hints: [
        'Инициализируйте min и max первым элементом массива.',
        'Пройдите по массиву и обновляйте min/max при нахождении меньшего/большего элемента.',
        'Запишите результаты через указатели: *out_min = ... и *out_max = ...',
      ],
      solution: `#include <stdio.h>

void min_max(const int *arr, int size, int *out_min, int *out_max) {
    *out_min = arr[0];
    *out_max = arr[0];

    for (int i = 1; i < size; i++) {
        if (arr[i] < *out_min) {
            *out_min = arr[i];
        }
        if (arr[i] > *out_max) {
            *out_max = arr[i];
        }
    }
}

int main(void) {
    int nums[] = {3, 7, 1, 9, 4, 6};
    int min, max;

    min_max(nums, 6, &min, &max);
    printf("Мин: %d, Макс: %d\\n", min, max);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
