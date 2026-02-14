import type { Chapter } from '../types'

export default {
  id: 'dynamic-memory',
  title: 'Динамическая память',
  description: 'malloc, calloc, realloc, free и утечки памяти',
  blocks: [
    {
      type: 'prose',
      markdown: `# Динамическая память

До сих пор мы работали с переменными, размещёнными на **стеке** — их время жизни ограничено блоком, в котором они объявлены. Но часто размер данных неизвестен заранее, или данные должны пережить функцию, которая их создала. Для этого C предоставляет механизм **динамического выделения памяти** — работу с **кучей** (heap).

Все функции для работы с динамической памятью объявлены в заголовочном файле \`<stdlib.h>\`.`,
    },
    {
      type: 'prose',
      markdown: `## malloc — выделение памяти

Функция \`malloc(size)\` выделяет блок из \`size\` байт и возвращает указатель \`void *\` на начало блока. Если выделить память не удалось, возвращается \`NULL\`. Содержимое выделенной памяти **не инициализировано** — там может быть мусор.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    printf("Введите количество элементов: ");
    scanf("%d", &n);

    /* Выделяем массив из n элементов типа int */
    int *arr = malloc(n * sizeof(int));
    if (arr == NULL) {
        fprintf(stderr, "Ошибка выделения памяти\\n");
        return 1;
    }

    /* Заполняем массив */
    for (int i = 0; i < n; i++)
        arr[i] = i * 10;

    /* Выводим */
    for (int i = 0; i < n; i++)
        printf("arr[%d] = %d\\n", i, arr[i]);

    free(arr);  /* Освобождаем память */
    return 0;
}`,
      filename: 'malloc_demo.c',
    },
    {
      type: 'output',
      content: `Введите количество элементов: 4
arr[0] = 0
arr[1] = 10
arr[2] = 20
arr[3] = 30`,
      prompt: '$ gcc malloc_demo.c -o malloc_demo && echo 4 | ./malloc_demo',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Приведение типа malloc',
      markdown: `В C возвращаемый \`void *\` автоматически приводится к нужному типу указателя, поэтому приведение \`(int *)malloc(...)\` **не требуется**. В C++ оно обязательно, но мы пишем на C.

Рекомендуемая идиома: \`int *p = malloc(n * sizeof *p)\` — так тип не дублируется и меньше шанс ошибки.`,
    },
    {
      type: 'prose',
      markdown: `## calloc — выделение с обнулением

Функция \`calloc(count, size)\` выделяет память для \`count\` элементов размером \`size\` каждый и **инициализирует все байты нулями**. Это безопаснее malloc, когда нужна нулевая инициализация.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;

    /* calloc обнуляет память */
    int *arr = calloc(n, sizeof(int));
    if (!arr) {
        perror("calloc");
        return 1;
    }

    /* Все элементы гарантированно равны 0 */
    for (int i = 0; i < n; i++)
        printf("arr[%d] = %d\\n", i, arr[i]);

    free(arr);
    return 0;
}`,
      filename: 'calloc_demo.c',
    },
    {
      type: 'prose',
      markdown: `## realloc — изменение размера блока

Функция \`realloc(ptr, new_size)\` изменяет размер ранее выделенного блока. Она может:
- Расширить блок на месте (если после него есть свободная память)
- Выделить новый блок, скопировать данные и освободить старый
- Вернуть \`NULL\` при неудаче (при этом старый блок **не освобождается**)`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int capacity = 2;
    int size = 0;
    int *arr = malloc(capacity * sizeof *arr);
    if (!arr) return 1;

    /* Динамический массив: растёт по мере необходимости */
    int values[] = {10, 20, 30, 40, 50, 60, 70};
    int n = sizeof values / sizeof values[0];

    for (int i = 0; i < n; i++) {
        if (size == capacity) {
            capacity *= 2;
            int *tmp = realloc(arr, capacity * sizeof *tmp);
            if (!tmp) {
                free(arr);
                return 1;
            }
            arr = tmp;
            printf("  [расширение до %d элементов]\\n", capacity);
        }
        arr[size++] = values[i];
    }

    printf("Результат: ");
    for (int i = 0; i < size; i++)
        printf("%d ", arr[i]);
    printf("\\n");

    free(arr);
    return 0;
}`,
      filename: 'realloc_demo.c',
    },
    {
      type: 'output',
      content: `  [расширение до 4 элементов]
  [расширение до 8 элементов]
Результат: 10 20 30 40 50 60 70`,
      prompt: '$ gcc realloc_demo.c -o realloc_demo && ./realloc_demo',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Антипаттерн realloc',
      markdown: `Никогда не пишите \`arr = realloc(arr, new_size)\`. Если realloc вернёт \`NULL\`, вы потеряете указатель на старый блок и получите утечку памяти. Всегда используйте временную переменную:

\`\`\`c
int *tmp = realloc(arr, new_size);
if (!tmp) { /* обработка ошибки, arr всё ещё валиден */ }
arr = tmp;
\`\`\``,
    },
    {
      type: 'diagram',
      component: 'MemoryVisualizer',
      props: {
        title: 'Стек vs Куча',
        regions: [
          {
            name: 'Стек (Stack)',
            description: 'Локальные переменные, автоматическое управление',
            direction: 'down',
          },
          {
            name: 'Куча (Heap)',
            description: 'malloc/calloc/realloc, ручное управление',
            direction: 'up',
          },
        ],
      },
      caption: 'Стек растёт вниз, куча — вверх. Программист отвечает за освобождение памяти в куче',
    },
    {
      type: 'prose',
      markdown: `## Утечки памяти и типичные ошибки

Утечка памяти — ситуация, когда выделенная память не освобождается с помощью \`free\`. В долгоживущих программах (серверы, демоны) это приводит к постепенному росту потребления памяти.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdlib.h>

/* ОШИБКА 1: утечка памяти */
void leak_example(void) {
    int *p = malloc(100 * sizeof(int));
    /* ... используем p ... */
    /* забыли free(p); — утечка! */
}

/* ОШИБКА 2: использование после освобождения (use-after-free) */
void uaf_example(void) {
    int *p = malloc(sizeof(int));
    *p = 42;
    free(p);
    /* *p = 10;  — UB! p указывает на освобождённую память */
}

/* ОШИБКА 3: двойное освобождение (double free) */
void double_free_example(void) {
    int *p = malloc(sizeof(int));
    free(p);
    /* free(p);  — UB! повторное освобождение */
}

/* ПРАВИЛЬНО: обнуляем указатель после free */
void correct_example(void) {
    int *p = malloc(sizeof(int));
    if (!p) return;
    *p = 42;
    free(p);
    p = NULL;  /* защита от повторного free и use-after-free */
}`,
      filename: 'memory_errors.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Valgrind — ваш лучший друг',
      markdown: `Используйте Valgrind для обнаружения утечек памяти и ошибок работы с памятью:

\`\`\`bash
$ valgrind --leak-check=full ./my_program
\`\`\`

Также полезен AddressSanitizer (ASan), встроенный в GCC и Clang:
\`\`\`bash
$ gcc -fsanitize=address -g program.c -o program
\`\`\``,
    },
    {
      type: 'quiz',
      question: 'Что произойдёт, если вызвать free(p) для указателя, не полученного от malloc/calloc/realloc?',
      options: [
        'Ничего — free просто проигнорирует вызов',
        'Неопределённое поведение (UB)',
        'Программа выведет предупреждение',
        'Ошибка компиляции',
      ],
      correctIndex: 1,
      explanation: 'Передача в free указателя, не полученного от malloc/calloc/realloc, является неопределённым поведением. Исключение — передача NULL, что допустимо и безопасно (free ничего не делает).',
    },
    {
      type: 'exercise',
      title: 'Динамический массив строк',
      description: 'Напишите программу, которая читает строки со стандартного ввода (до EOF или пустой строки) и сохраняет их в динамически растущий массив `char **lines`. Каждая строка должна быть отдельно выделена через `malloc`. В конце выведите все строки в обратном порядке и освободите всю память.',
      hints: [
        'Используйте fgets для чтения строк в буфер фиксированного размера',
        'Для каждой строки выделяйте память через malloc(strlen(buf) + 1) и копируйте через strcpy',
        'Массив lines расширяйте через realloc при необходимости',
        'При освобождении сначала free каждую строку, потом free сам массив lines',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    int capacity = 4;
    int count = 0;
    char **lines = malloc(capacity * sizeof *lines);
    if (!lines) return 1;

    char buf[256];
    while (fgets(buf, sizeof buf, stdin)) {
        /* Удаляем перевод строки */
        buf[strcspn(buf, "\\n")] = '\\0';
        if (buf[0] == '\\0') break;

        if (count == capacity) {
            capacity *= 2;
            char **tmp = realloc(lines, capacity * sizeof *tmp);
            if (!tmp) { /* освободить всё и выйти */ break; }
            lines = tmp;
        }

        lines[count] = malloc(strlen(buf) + 1);
        if (!lines[count]) break;
        strcpy(lines[count], buf);
        count++;
    }

    for (int i = count - 1; i >= 0; i--)
        printf("%s\\n", lines[i]);

    for (int i = 0; i < count; i++)
        free(lines[i]);
    free(lines);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
