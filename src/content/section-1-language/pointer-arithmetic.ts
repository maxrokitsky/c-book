import type { Chapter } from '../types'

export default {
  id: 'pointer-arithmetic',
  title: 'Арифметика указателей',
  description: 'Сложение, вычитание, сравнение указателей',
  blocks: [
    {
      type: 'prose',
      markdown: `# Арифметика указателей

Арифметика указателей — одна из мощнейших и в то же время опаснейших возможностей C. Она позволяет перемещаться по памяти, учитывая размер типа данных, на который указывает указатель. Компилятор автоматически масштабирует сдвиг в зависимости от типа.`,
    },
    {
      type: 'prose',
      markdown: `## Сложение указателя и целого числа

Когда вы прибавляете целое число \`n\` к указателю \`p\`, результат указывает на элемент, расположенный через \`n\` позиций вперёд. Фактическое смещение в байтах равно \`n * sizeof(*p)\`.

\`\`\`
p + n  →  адрес: (char *)p + n * sizeof(*p)
\`\`\``,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;

    printf("p     = %p, *p     = %d\\n", (void *)p, *p);
    printf("p + 1 = %p, *(p+1) = %d\\n", (void *)(p + 1), *(p + 1));
    printf("p + 3 = %p, *(p+3) = %d\\n", (void *)(p + 3), *(p + 3));

    /* Разница адресов в байтах */
    printf("\\nРазница (p+1) - p в байтах: %td\\n",
           (char *)(p + 1) - (char *)p);

    /* То же с double */
    double darr[] = {1.1, 2.2, 3.3};
    double *dp = darr;
    printf("\\nШаг для double: %td байт\\n",
           (char *)(dp + 1) - (char *)dp);

    return 0;
}`,
      filename: 'ptr_addition.c',
    },
    {
      type: 'output',
      content: `p     = 0x7ffd12340000, *p     = 10
p + 1 = 0x7ffd12340004, *(p+1) = 20
p + 3 = 0x7ffd1234000c, *(p+3) = 40

Разница (p+1) - p в байтах: 4

Шаг для double: 8 байт`,
      prompt: '$ gcc ptr_addition.c -o ptr_addition && ./ptr_addition',
    },
    {
      type: 'diagram',
      component: 'MemoryVisualizer',
      props: {
        title: 'Арифметика указателей для int *p',
        baseAddress: '0x1000',
        cellSize: 4,
        cells: [
          { label: 'p', value: '10', offset: 0 },
          { label: 'p+1', value: '20', offset: 1 },
          { label: 'p+2', value: '30', offset: 2 },
          { label: 'p+3', value: '40', offset: 3 },
          { label: 'p+4', value: '50', offset: 4 },
        ],
      },
      caption: 'Каждый шаг p+1 сдвигает адрес на sizeof(int) = 4 байта',
    },
    {
      type: 'prose',
      markdown: `## Вычитание указателей

Вычитание двух указателей одного типа даёт количество элементов между ними. Результат имеет тип \`ptrdiff_t\` (определён в \`<stddef.h>\`). Вычитать можно только указатели, которые указывают на элементы одного и того же массива (или на позицию сразу за последним элементом).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stddef.h>

int main(void) {
    int arr[] = {10, 20, 30, 40, 50};
    int *begin = &arr[0];
    int *end = &arr[4];

    ptrdiff_t diff = end - begin;
    printf("end - begin = %td элементов\\n", diff);  /* 4 */

    /* Вычисление длины строки через вычитание указателей */
    char str[] = "Hello, C!";
    char *s = str;
    while (*s != '\\0')
        s++;
    printf("Длина строки: %td\\n", s - str);  /* 9 */

    return 0;
}`,
      filename: 'ptr_subtraction.c',
    },
    {
      type: 'output',
      content: `end - begin = 4 элементов
Длина строки: 9`,
      prompt: '$ gcc ptr_subtraction.c -o ptr_subtraction && ./ptr_subtraction',
    },
    {
      type: 'prose',
      markdown: `## Сравнение указателей

Указатели на элементы одного массива можно сравнивать операторами \`<\`, \`>\`, \`<=\`, \`>=\`, \`==\`, \`!=\`. Это особенно полезно в циклах обхода массива.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

void reverse_array(int *arr, int n) {
    int *left = arr;
    int *right = arr + n - 1;

    while (left < right) {
        int tmp = *left;
        *left = *right;
        *right = tmp;
        left++;
        right--;
    }
}

int main(void) {
    int arr[] = {1, 2, 3, 4, 5};
    int n = sizeof arr / sizeof arr[0];

    reverse_array(arr, n);

    for (int *p = arr; p < arr + n; p++)
        printf("%d ", *p);
    printf("\\n");

    return 0;
}`,
      filename: 'ptr_comparison.c',
    },
    {
      type: 'output',
      content: '5 4 3 2 1',
      prompt: '$ gcc ptr_comparison.c -o ptr_comparison && ./ptr_comparison',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Неопределённое поведение',
      markdown: `Арифметика указателей **определена** только в пределах одного массива (включая позицию «один за последним элементом»). Выход за эти границы — **неопределённое поведение** (UB):

- \`p + n\`, где результат выходит за пределы массива
- Вычитание указателей на разные массивы
- Сравнение \`<\`/\`>\` указателей на разные объекты

Даже если код «работает», он может сломаться при смене компилятора или уровня оптимизации.`,
    },
    {
      type: 'prose',
      markdown: `## Инкремент и декремент указателей

Операторы \`++\` и \`--\` перемещают указатель на один элемент вперёд или назад. Часто используются при обходе строк и массивов.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <ctype.h>

/* Подсчёт количества заглавных букв в строке */
int count_upper(const char *s) {
    int count = 0;
    while (*s) {
        if (isupper((unsigned char)*s))
            count++;
        s++;  /* указатель сдвигается на sizeof(char) = 1 байт */
    }
    return count;
}

int main(void) {
    const char *text = "Hello, World! C Programming";
    printf("Заглавных букв: %d\\n", count_upper(text));
    return 0;
}`,
      filename: 'ptr_increment.c',
    },
    {
      type: 'quiz',
      question: 'Если int *p указывает на адрес 0x1000, чему равен адрес (p + 3) при sizeof(int) == 4?',
      options: [
        '0x1003',
        '0x1004',
        '0x100C',
        '0x1012',
      ],
      correctIndex: 2,
      explanation: 'p + 3 сдвигает указатель на 3 * sizeof(int) = 3 * 4 = 12 байт. 0x1000 + 12 = 0x1000 + 0xC = 0x100C.',
    },
    {
      type: 'exercise',
      title: 'Реализация strchr через указатели',
      description: 'Напишите функцию `char *my_strchr(const char *s, int c)`, которая возвращает указатель на первое вхождение символа `c` в строке `s`, или `NULL`, если символ не найден. Используйте арифметику указателей.',
      hints: [
        'Пройдитесь по строке, инкрементируя указатель s',
        'Сравнивайте *s с (char)c на каждом шаге',
        'Не забудьте проверить терминирующий нулевой символ — strchr может найти и его',
      ],
      solution: `char *my_strchr(const char *s, int c) {
    while (*s != '\\0') {
        if (*s == (char)c)
            return (char *)s;
        s++;
    }
    /* Проверяем терминирующий '\\0' */
    if ((char)c == '\\0')
        return (char *)s;
    return NULL;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
