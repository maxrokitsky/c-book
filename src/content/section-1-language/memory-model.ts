import type { Chapter } from '../types'

export default {
  id: 'memory-model',
  title: 'Модель памяти C',
  description: 'Стек, куча, сегменты, выравнивание, порядок байтов',
  blocks: [
    {
      type: 'prose',
      markdown:
        'Понимание модели памяти — ключ к эффективной и безопасной разработке на C. Программа на C работает с виртуальной памятью, которая разделена на несколько сегментов: **текстовый сегмент** (код), **сегмент данных** (глобальные и статические переменные), **стек** (локальные переменные и фреймы вызовов) и **куча** (динамически выделенная память).',
    },
    {
      type: 'diagram',
      component: 'MemoryVisualizer',
      props: {
        cells: [
          { address: 'Высокие адреса', label: '', value: 'Стек (Stack)', type: 'stack' },
          { address: '0x7fff...', label: 'local_var', value: '42', type: 'stack' },
          { address: '0x7fff...', label: 'argc', value: '1', type: 'stack' },
          { address: '...', label: '', value: '', type: 'empty' },
          { address: '0x55a0...', label: '*ptr', value: 'данные', type: 'heap' },
          { address: 'Низкие адреса', label: '', value: 'Куча (Heap)', type: 'heap' },
        ],
      },
      caption: 'Схема расположения сегментов памяти процесса',
    },
    {
      type: 'prose',
      markdown:
        '## Сегменты памяти\n\n| Сегмент | Содержимое | Время жизни |\n|---------|------------|-------------|\n| `.text` | Машинный код программы | Всё время работы |\n| `.rodata` | Строковые литералы, `const`-данные | Всё время работы |\n| `.data` | Инициализированные глобальные/статические переменные | Всё время работы |\n| `.bss` | Неинициализированные глобальные/статические (обнуляются) | Всё время работы |\n| **Стек** | Локальные переменные, адреса возврата | До выхода из функции |\n| **Куча** | Динамически выделенная память (`malloc`) | До вызова `free` |',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

/* .data — инициализированная глобальная переменная */
int global_init = 100;

/* .bss — неинициализированная глобальная переменная */
int global_uninit;

/* .rodata — строковый литерал */
const char *greeting = "Hello";

int main(void) {
    /* Стек — локальная переменная */
    int local = 42;

    /* Стек — указатель, куча — данные */
    int *heap_data = malloc(sizeof(int));
    *heap_data = 99;

    /* Статическая локальная переменная (.data или .bss) */
    static int call_count = 0;
    call_count++;

    printf("global_init:  %p\\n", (void *)&global_init);
    printf("global_uninit:%p\\n", (void *)&global_uninit);
    printf("greeting:     %p\\n", (void *)greeting);
    printf("local:        %p\\n", (void *)&local);
    printf("heap_data:    %p\\n", (void *)heap_data);
    printf("call_count:   %p\\n", (void *)&call_count);

    free(heap_data);
    return 0;
}`,
      filename: 'memory_segments.c',
    },
    {
      type: 'output',
      content:
        'global_init:  0x55d3a4001010\nglobal_uninit:0x55d3a4001014\ngreeting:     0x55d3a2000004\nlocal:        0x7ffd8b3e1a4c\nheap_data:    0x55d3a50012a0\ncall_count:   0x55d3a4001018',
      prompt: '$ gcc memory_segments.c -o mem && ./mem',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Адреса различаются при каждом запуске',
      markdown:
        'Из-за ASLR (Address Space Layout Randomization) виртуальные адреса меняются при каждом запуске программы. Однако **относительное расположение** сегментов остаётся неизменным: стек в верхних адресах, куча — в нижних, код и данные — между ними.',
    },
    {
      type: 'prose',
      markdown:
        '## Выравнивание (alignment)\n\nПроцессор обращается к памяти блоками, кратными размеру типа. Например, 4-байтовый `int` обычно должен располагаться по адресу, кратному 4. Компилятор автоматически вставляет **padding** (заполнение) в структуры для соблюдения выравнивания.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stddef.h>

struct Bad {
    char a;    /* 1 байт + 3 padding */
    int  b;    /* 4 байта */
    char c;    /* 1 байт + 3 padding */
};             /* итого: 12 байт */

struct Good {
    int  b;    /* 4 байта */
    char a;    /* 1 байт */
    char c;    /* 1 байт + 2 padding */
};             /* итого: 8 байт */

int main(void) {
    printf("sizeof(Bad):  %zu\\n", sizeof(struct Bad));
    printf("sizeof(Good): %zu\\n", sizeof(struct Good));

    printf("\\nBad layout:\\n");
    printf("  offsetof(a): %zu\\n", offsetof(struct Bad, a));
    printf("  offsetof(b): %zu\\n", offsetof(struct Bad, b));
    printf("  offsetof(c): %zu\\n", offsetof(struct Bad, c));

    printf("\\nGood layout:\\n");
    printf("  offsetof(b): %zu\\n", offsetof(struct Good, b));
    printf("  offsetof(a): %zu\\n", offsetof(struct Good, a));
    printf("  offsetof(c): %zu\\n", offsetof(struct Good, c));
    return 0;
}`,
      filename: 'alignment.c',
    },
    {
      type: 'diagram',
      component: 'StructLayoutDiagram',
      props: {
        name: 'struct Bad',
        fields: [
          { name: 'a', type: 'char', size: 1, offset: 0 },
          { name: 'pad', type: 'padding', size: 3, offset: 1 },
          { name: 'b', type: 'int', size: 4, offset: 4 },
          { name: 'c', type: 'char', size: 1, offset: 8 },
          { name: 'pad', type: 'padding', size: 3, offset: 9 },
        ],
        totalSize: 12,
      },
      caption: 'Расположение полей struct Bad — 4 байта padding впустую',
    },
    {
      type: 'diagram',
      component: 'StructLayoutDiagram',
      props: {
        name: 'struct Good',
        fields: [
          { name: 'b', type: 'int', size: 4, offset: 0 },
          { name: 'a', type: 'char', size: 1, offset: 4 },
          { name: 'c', type: 'char', size: 1, offset: 5 },
          { name: 'pad', type: 'padding', size: 2, offset: 6 },
        ],
        totalSize: 8,
      },
      caption: 'Расположение полей struct Good — всего 2 байта padding',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Правило большого пальца',
      markdown:
        'Располагайте поля структуры **от большего к меньшему** по размеру. Это минимизирует padding и уменьшает общий размер структуры.',
    },
    {
      type: 'prose',
      markdown:
        '## Порядок байтов (endianness)\n\nМногобайтовые значения могут храниться в памяти двумя способами:\n- **Little-endian** (LE): младший байт по младшему адресу (x86, ARM по умолчанию)\n- **Big-endian** (BE): старший байт по младшему адресу (сетевой порядок, SPARC)\n\nЭто важно при работе с бинарными файлами и сетевыми протоколами.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdint.h>

void print_bytes(const void *ptr, size_t size) {
    const uint8_t *bytes = (const uint8_t *)ptr;
    for (size_t i = 0; i < size; i++) {
        printf("%02x ", bytes[i]);
    }
    printf("\\n");
}

int main(void) {
    uint32_t value = 0xDEADBEEF;
    printf("value = 0x%X\\n", value);
    printf("Байты в памяти: ");
    print_bytes(&value, sizeof(value));

    /* Проверка порядка байтов */
    uint8_t first_byte = *(uint8_t *)&value;
    if (first_byte == 0xEF) {
        printf("Архитектура: little-endian\\n");
    } else {
        printf("Архитектура: big-endian\\n");
    }
    return 0;
}`,
      filename: 'endianness.c',
    },
    {
      type: 'output',
      content:
        'value = 0xDEADBEEF\nБайты в памяти: ef be ad de \nАрхитектура: little-endian',
      prompt: '$ gcc endianness.c -o endian && ./endian',
    },
    {
      type: 'quiz',
      question:
        'Структура содержит поля: `char a; int b; char c;` на платформе с 4-байтовым int. Каков её размер с учётом выравнивания?',
      options: ['6 байт', '8 байт', '10 байт', '12 байт'],
      correctIndex: 3,
      explanation:
        'После `char a` (1 байт) компилятор вставляет 3 байта padding для выравнивания `int b` (4 байта). После `char c` (1 байт) добавляется ещё 3 байта padding, чтобы размер структуры был кратен выравниванию наибольшего поля. Итого: 1 + 3 + 4 + 1 + 3 = 12 байт.',
    },
    {
      type: 'exercise',
      title: 'Исследование стека вызовов',
      description:
        'Напишите программу с тремя вложенными функциями: `main` -> `foo` -> `bar`. В каждой функции объявите локальную переменную и выведите её адрес. Убедитесь, что адреса убывают (стек растёт вниз). Вычислите размер каждого стекового фрейма.',
      hints: [
        'Используйте `printf("%p", (void *)&var)` для вывода адресов',
        'Разница адресов между переменными в соседних функциях приблизительно равна размеру фрейма',
        'Компилируйте без оптимизаций: `gcc -O0`',
      ],
      solution: `#include <stdio.h>
#include <stdint.h>

void bar(void) {
    int z = 3;
    printf("bar:  &z = %p\\n", (void *)&z);
}

void foo(void) {
    int y = 2;
    printf("foo:  &y = %p\\n", (void *)&y);
    bar();
}

int main(void) {
    int x = 1;
    printf("main: &x = %p\\n", (void *)&x);
    foo();
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
