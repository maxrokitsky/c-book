import type { Chapter } from '../types'

export default {
  id: 'pointers-and-arrays',
  title: 'Указатели и массивы',
  description: 'Связь указателей и массивов, передача в функции',
  blocks: [
    {
      type: 'prose',
      markdown: `# Указатели и массивы

В языке C указатели и массивы тесно связаны. Имя массива в большинстве контекстов **автоматически преобразуется** в указатель на его первый элемент. Это одна из ключевых особенностей языка, которую необходимо хорошо понимать для написания эффективного кода.`,
    },
    {
      type: 'prose',
      markdown: `## Имя массива как указатель

Когда вы объявляете массив \`int arr[5]\`, выражение \`arr\` в большинстве случаев эквивалентно \`&arr[0]\` — адресу первого элемента. Это называется **затухание массива** (array decay).

Есть три исключения, когда имя массива **не** преобразуется в указатель:
- Оператор \`sizeof(arr)\` — возвращает размер всего массива
- Оператор \`&arr\` — возвращает указатель на весь массив (тип \`int (*)[5]\`)
- Инициализация строкового массива литералом: \`char s[] = "hello"\``,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int arr[5] = {10, 20, 30, 40, 50};

    printf("arr        = %p\\n", (void *)arr);
    printf("&arr[0]    = %p\\n", (void *)&arr[0]);
    printf("sizeof arr = %zu\\n", sizeof arr);  /* размер всего массива */

    int *p = arr;  /* p указывает на arr[0] */
    printf("*p = %d\\n", *p);       /* 10 */
    printf("*(p+2) = %d\\n", *(p + 2)); /* 30 */

    return 0;
}`,
      filename: 'array_decay.c',
    },
    {
      type: 'output',
      content: `arr        = 0x7ffd3a4b5c00
&arr[0]    = 0x7ffd3a4b5c00
sizeof arr = 20
*p = 10
*(p+2) = 30`,
      prompt: '$ gcc array_decay.c -o array_decay && ./array_decay',
    },
    {
      type: 'diagram',
      component: 'PointerDiagram',
      props: {
        title: 'Связь указателя и массива',
        pointer: { name: 'p', address: '0x100' },
        target: {
          name: 'arr',
          elements: [
            { index: 0, value: '10', address: '0x100' },
            { index: 1, value: '20', address: '0x104' },
            { index: 2, value: '30', address: '0x108' },
            { index: 3, value: '40', address: '0x10C' },
            { index: 4, value: '50', address: '0x110' },
          ],
        },
      },
      caption: 'Указатель p хранит адрес первого элемента массива arr',
    },
    {
      type: 'prose',
      markdown: `## Индексирование через указатели

Выражение \`arr[i]\` эквивалентно \`*(arr + i)\`. Компилятор преобразует индексирование массива в арифметику указателей. Более того, поскольку сложение коммутативно, \`arr[i]\` также эквивалентно \`i[arr]\` (хотя так писать не стоит).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int arr[4] = {100, 200, 300, 400};
    int *p = arr;

    /* Все четыре способа дают одинаковый результат */
    printf("arr[2]     = %d\\n", arr[2]);
    printf("*(arr + 2) = %d\\n", *(arr + 2));
    printf("p[2]       = %d\\n", p[2]);
    printf("*(p + 2)   = %d\\n", *(p + 2));

    /* Обход массива указателем */
    for (int *ptr = arr; ptr < arr + 4; ptr++) {
        printf("%d ", *ptr);
    }
    printf("\\n");

    return 0;
}`,
      filename: 'index_via_pointer.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Массив — это не указатель',
      markdown: `Несмотря на то, что имя массива часто ведёт себя как указатель, это **разные** сущности:
- \`sizeof(arr)\` для массива возвращает размер всего массива, а \`sizeof(p)\` — размер указателя (обычно 8 байт на 64-битной системе)
- Массиву нельзя присвоить новое значение: \`arr = p\` — ошибка компиляции
- \`&arr\` имеет тип \`int (*)[N]\`, а \`&p\` — тип \`int **\``,
    },
    {
      type: 'prose',
      markdown: `## Передача массивов в функции

При передаче массива в функцию происходит затухание: функция получает **указатель**, а не копию массива. Поэтому внутри функции \`sizeof\` вернёт размер указателя, а не массива. Размер необходимо передавать отдельным параметром.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Три эквивалентных способа объявления параметра-массива */
void print_array_v1(int arr[], int n) {
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    printf("\\n");
}

void print_array_v2(int *arr, int n) {
    for (int i = 0; i < n; i++)
        printf("%d ", *(arr + i));
    printf("\\n");
}

/* Функция, изменяющая массив через указатель */
void double_elements(int *arr, int n) {
    for (int i = 0; i < n; i++)
        arr[i] *= 2;  /* модификация оригинала! */
}

int main(void) {
    int data[] = {1, 2, 3, 4, 5};
    int n = sizeof data / sizeof data[0];

    printf("До:    ");
    print_array_v1(data, n);

    double_elements(data, n);

    printf("После: ");
    print_array_v2(data, n);

    return 0;
}`,
      filename: 'array_to_function.c',
    },
    {
      type: 'output',
      content: `До:    1 2 3 4 5
После: 2 4 6 8 10`,
      prompt: '$ gcc array_to_function.c -o array_to_function && ./array_to_function',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Защита от изменения',
      markdown: `Если функция не должна изменять массив, объявите параметр как \`const int *arr\`. Компилятор выдаст ошибку при попытке модификации элементов через такой указатель.`,
    },
    {
      type: 'prose',
      markdown: `## Многомерные массивы и указатели

Двумерный массив \`int matrix[3][4]\` хранится в памяти как непрерывный блок из 12 элементов. При передаче в функцию он затухает в указатель на первый ряд — тип \`int (*)[4]\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Параметр — указатель на массив из 4 элементов */
void print_matrix(int (*mat)[4], int rows) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < 4; j++)
            printf("%3d ", mat[i][j]);
        printf("\\n");
    }
}

int main(void) {
    int matrix[3][4] = {
        { 1,  2,  3,  4},
        { 5,  6,  7,  8},
        { 9, 10, 11, 12}
    };

    print_matrix(matrix, 3);

    /* Доступ через арифметику указателей */
    int *flat = &matrix[0][0];
    printf("Элемент [1][2] = %d\\n", *(flat + 1 * 4 + 2)); /* 7 */

    return 0;
}`,
      filename: 'matrix_pointer.c',
    },
    {
      type: 'quiz',
      question: 'Что выведет printf("%zu", sizeof arr) для объявления int arr[10] внутри main?',
      options: [
        '10',
        '40 (при sizeof(int) == 4)',
        '8 (размер указателя)',
        'Ошибка компиляции',
      ],
      correctIndex: 1,
      explanation: 'sizeof применённый к имени массива возвращает размер всего массива в байтах: 10 элементов * 4 байта = 40. Затухание в указатель здесь не происходит — это одно из трёх исключений.',
    },
    {
      type: 'exercise',
      title: 'Поиск максимума через указатели',
      description: 'Напишите функцию `int *find_max(int *arr, int n)`, которая возвращает **указатель** на максимальный элемент массива. Используйте только арифметику указателей (без оператора `[]`).',
      hints: [
        'Заведите указатель max_ptr, инициализированный адресом первого элемента',
        'В цикле сравнивайте *ptr с *max_ptr',
        'Для перемещения по массиву используйте ptr++',
      ],
      solution: `int *find_max(int *arr, int n) {
    int *max_ptr = arr;
    for (int *ptr = arr + 1; ptr < arr + n; ptr++) {
        if (*ptr > *max_ptr)
            max_ptr = ptr;
    }
    return max_ptr;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
