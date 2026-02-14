import type { Chapter } from '../types'

export default {
  id: 'arrays',
  title: 'Массивы',
  description: 'Одномерные и многомерные массивы, инициализация',
  blocks: [
    {
      type: 'prose',
      markdown: `# Массивы

Массив — это набор элементов одного типа, расположенных в памяти последовательно. Массивы позволяют хранить и обрабатывать коллекции данных: список оценок, координаты точек, пиксели изображения и многое другое.`,
    },
    {
      type: 'prose',
      markdown: `## Объявление и инициализация

Массив объявляется с указанием типа элементов, имени и размера в квадратных скобках:

\`\`\`
тип имя[размер];
\`\`\`

Размер массива должен быть известен на этапе компиляции (за исключением VLA в C99).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Объявление без инициализации (значения не определены!)
    int numbers[5];

    // Инициализация при объявлении
    int primes[5] = {2, 3, 5, 7, 11};

    // Частичная инициализация: остальные элементы = 0
    int partial[5] = {10, 20};  // {10, 20, 0, 0, 0}

    // Размер определяется автоматически из инициализатора
    int auto_size[] = {1, 2, 3, 4};  // размер = 4

    // Заполнение нулями
    int zeros[100] = {0};

    // Вывод массива primes
    for (int i = 0; i < 5; i++) {
        printf("primes[%d] = %d\\n", i, primes[i]);
    }

    return 0;
}`,
      filename: 'array_init.c',
    },
    {
      type: 'output',
      content: 'primes[0] = 2\nprimes[1] = 3\nprimes[2] = 5\nprimes[3] = 7\nprimes[4] = 11',
      prompt: '$ gcc array_init.c -o array_init && ./array_init',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Индексация начинается с нуля!',
      markdown: `В C индексы массива начинаются с **0**. Массив из 5 элементов имеет индексы от 0 до 4. Обращение к элементу за пределами массива — это **неопределённое поведение** (undefined behavior), которое может привести к сбою программы или повреждению данных.`,
    },
    {
      type: 'diagram',
      component: 'ArrayVisualizer',
      props: {
        title: 'Массив int primes[5]',
        items: [
          { index: 0, value: '2' },
          { index: 1, value: '3' },
          { index: 2, value: '5' },
          { index: 3, value: '7' },
          { index: 4, value: '11' },
        ],
        highlightIndex: 2,
        elementSize: 4,
        startAddress: '0x1000',
      },
      caption: 'Элементы массива расположены в памяти последовательно. Каждый int занимает 4 байта.',
    },
    {
      type: 'prose',
      markdown: `## Доступ к элементам

Для чтения и записи элементов используется оператор индексирования \`[]\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int scores[5] = {85, 92, 78, 95, 88};

    // Чтение элемента
    printf("Первый элемент: %d\\n", scores[0]);
    printf("Последний элемент: %d\\n", scores[4]);

    // Запись элемента
    scores[2] = 100;
    printf("Изменённый третий элемент: %d\\n", scores[2]);

    // Вычисление среднего значения
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += scores[i];
    }
    printf("Среднее: %.1f\\n", (double)sum / 5);

    return 0;
}`,
      filename: 'array_access.c',
    },
    {
      type: 'output',
      content: 'Первый элемент: 85\nПоследний элемент: 88\nИзменённый третий элемент: 100\nСреднее: 92.0',
      prompt: '$ gcc array_access.c -o array_access && ./array_access',
    },
    {
      type: 'prose',
      markdown: `## Размер массива

Оператор \`sizeof\` возвращает размер массива в байтах. Чтобы узнать количество элементов, нужно разделить размер массива на размер одного элемента:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int arr[] = {10, 20, 30, 40, 50};

    size_t total_bytes = sizeof(arr);          // Размер массива в байтах
    size_t element_bytes = sizeof(arr[0]);     // Размер одного элемента
    size_t count = sizeof(arr) / sizeof(arr[0]); // Количество элементов

    printf("Размер массива: %zu байт\\n", total_bytes);
    printf("Размер элемента: %zu байт\\n", element_bytes);
    printf("Количество элементов: %zu\\n", count);

    return 0;
}`,
      filename: 'array_sizeof.c',
    },
    {
      type: 'output',
      content: 'Размер массива: 20 байт\nРазмер элемента: 4 байт\nКоличество элементов: 5',
      prompt: '$ gcc array_sizeof.c -o array_sizeof && ./array_sizeof',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'sizeof не работает для массивов-параметров',
      markdown: `Когда массив передаётся в функцию, он «деградирует» до указателя, и \`sizeof\` возвращает размер указателя (обычно 8 байт), а не массива. Поэтому размер массива нужно передавать отдельным параметром:

\`\`\`c
void print_array(int arr[], int size) {
    // sizeof(arr) здесь вернёт 8, а не размер массива!
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
}
\`\`\``,
    },
    {
      type: 'prose',
      markdown: `## Многомерные массивы

Массив может содержать другие массивы — так получается многомерный массив. Чаще всего используются двумерные массивы (матрицы).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Двумерный массив 3x4 (3 строки, 4 столбца)
    int matrix[3][4] = {
        {1,  2,  3,  4},
        {5,  6,  7,  8},
        {9, 10, 11, 12}
    };

    // Вывод матрицы
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 4; j++) {
            printf("%3d ", matrix[i][j]);
        }
        printf("\\n");
    }

    // Доступ к конкретному элементу: строка 1, столбец 2
    printf("\\nЭлемент [1][2] = %d\\n", matrix[1][2]);

    return 0;
}`,
      filename: 'matrix.c',
    },
    {
      type: 'output',
      content: '  1   2   3   4 \n  5   6   7   8 \n  9  10  11  12 \n\nЭлемент [1][2] = 7',
      prompt: '$ gcc matrix.c -o matrix && ./matrix',
    },
    {
      type: 'diagram',
      component: 'ArrayVisualizer',
      props: {
        title: 'Двумерный массив int matrix[3][4] в памяти',
        items: [
          { index: '[0][0]', value: '1' },
          { index: '[0][1]', value: '2' },
          { index: '[0][2]', value: '3' },
          { index: '[0][3]', value: '4' },
          { index: '[1][0]', value: '5' },
          { index: '[1][1]', value: '6' },
          { index: '[1][2]', value: '7' },
          { index: '[1][3]', value: '8' },
          { index: '[2][0]', value: '9' },
          { index: '[2][1]', value: '10' },
          { index: '[2][2]', value: '11' },
          { index: '[2][3]', value: '12' },
        ],
        highlightIndex: 6,
        elementSize: 4,
        startAddress: '0x2000',
      },
      caption: 'Двумерный массив хранится в памяти «строка за строкой» (row-major order). Элемент matrix[1][2] имеет смещение (1*4 + 2) * 4 = 24 байта.',
    },
    {
      type: 'quiz',
      question: 'Что произойдёт при выполнении следующего кода?\n\n```c\nint arr[3] = {10, 20, 30};\nprintf("%d", arr[3]);\n```',
      options: [
        'Выведет 0',
        'Выведет 30',
        'Неопределённое поведение (выход за границу массива)',
        'Ошибка компиляции',
      ],
      correctIndex: 2,
      explanation: 'Массив arr имеет индексы 0, 1, 2. Обращение к arr[3] — это выход за границу массива, что является неопределённым поведением. Программа может вывести мусорное значение, упасть или работать «нормально» — результат непредсказуем.',
    },
    {
      type: 'quiz',
      question: 'Какой результат выполнения кода?\n\n```c\nint a[5] = {1, 2};\nprintf("%d %d %d", a[0], a[1], a[2]);\n```',
      options: [
        '1 2 0',
        '1 2 мусор',
        'Ошибка компиляции',
        '1 2 2',
      ],
      correctIndex: 0,
      explanation: 'При частичной инициализации массива неуказанные элементы автоматически заполняются нулями. Поэтому a[0] = 1, a[1] = 2, a[2] = 0.',
    },
  ],
} satisfies Chapter
