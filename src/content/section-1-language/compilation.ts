import type { Chapter } from '../types'

export default {
  id: 'compilation',
  title: 'Компиляция',
  description: 'Этапы компиляции: препроцессор, компилятор, линковщик',
  blocks: [
    {
      type: 'prose',
      markdown: `# Компиляция

Одно из ключевых отличий C от интерпретируемых языков (Python, JavaScript) состоит в том, что программу на C нужно **скомпилировать** перед запуском. Компиляция — это процесс преобразования человекочитаемого исходного кода в машинный код, который процессор может выполнить напрямую.

Этот процесс состоит из нескольких этапов, и понимание каждого из них поможет вам эффективнее отлаживать программы и разбираться в сообщениях об ошибках.`,
    },
    {
      type: 'diagram',
      component: 'CompilationPipeline',
      props: {
        stages: [
          {
            name: 'Исходный код (.c)',
            description: 'hello.c, main.c',
          },
          {
            name: 'Препроцессор (cpp)',
            description: '#include, #define, #ifdef',
          },
          {
            name: 'Компилятор (cc1)',
            description: 'Трансляция в ассемблер (.s)',
          },
          {
            name: 'Ассемблер (as)',
            description: 'Ассемблер -> объектный код (.o)',
          },
          {
            name: 'Линковщик (ld)',
            description: 'Объединение .o + библиотеки',
          },
          {
            name: 'Исполняемый файл',
            description: 'a.out / hello',
          },
        ],
      },
      caption:
        'Четыре этапа компиляции: препроцессирование, компиляция, ассемблирование, линковка.',
    },
    {
      type: 'prose',
      markdown: `## Этап 1: Препроцессор

Препроцессор — это текстовый процессор, который работает **до** собственно компиляции. Он обрабатывает все строки, начинающиеся с \`#\`:

- \`#include\` — вставляет содержимое указанного файла
- \`#define\` — определяет макросы (текстовые подстановки)
- \`#ifdef\` / \`#ifndef\` / \`#endif\` — условная компиляция

Вы можете увидеть результат работы препроцессора с флагом \`-E\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#define MESSAGE "Hello, World!"
#define MAX_SIZE 100

int main(void)
{
    printf("%s\\n", MESSAGE);
    printf("Max size: %d\\n", MAX_SIZE);
    return 0;
}`,
      filename: 'preprocess_demo.c',
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Посмотреть результат работы препроцессора
gcc -E preprocess_demo.c -o preprocess_demo.i

# Результат будет содержать тысячи строк (из stdio.h)
# Посмотрим последние строки:
tail -10 preprocess_demo.i`,
      filename: 'terminal',
    },
    {
      type: 'output',
      content: `# 5 "preprocess_demo.c"
int main(void)
{
    printf("%s\\n", "Hello, World!");
    printf("Max size: %d\\n", 100);
    return 0;
}`,
      prompt: '$ tail -10 preprocess_demo.i',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Обратите внимание',
      markdown:
        'В результате работы препроцессора `MESSAGE` было заменено на `"Hello, World!"`, а `MAX_SIZE` на `100`. Все директивы `#include` заменены на содержимое соответствующих файлов. Файл `stdio.h` на Linux может добавить более 800 строк!',
    },
    {
      type: 'prose',
      markdown: `## Этап 2: Компиляция (трансляция)

На этом этапе препроцессированный исходный код транслируется в **ассемблерный код** — низкоуровневые инструкции, специфичные для конкретной процессорной архитектуры (x86, ARM и т.д.).

Чтобы увидеть ассемблерный код, используйте флаг \`-S\`:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Генерация ассемблерного кода
gcc -S hello.c -o hello.s`,
      filename: 'terminal',
    },
    {
      type: 'code',
      language: 'asm',
      code: `        .file   "hello.c"
        .section    .rodata
.LC0:
        .string "Hello, World!"
        .text
        .globl  main
        .type   main, @function
main:
        pushq   %rbp
        movq    %rsp, %rbp
        leaq    .LC0(%rip), %rdi
        call    puts@PLT
        movl    $0, %eax
        popq    %rbp
        ret`,
      filename: 'hello.s',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Оптимизация компилятора',
      markdown:
        'Обратите внимание: компилятор заменил `printf("Hello, World!\\n")` на `puts("Hello, World!")`. Это оптимизация — `puts` проще и быстрее, когда строка не содержит форматных спецификаторов. Чтобы увидеть более агрессивные оптимизации, используйте `-O2` или `-O3`.',
    },
    {
      type: 'prose',
      markdown: `## Этап 3: Ассемблирование

Ассемблер преобразует ассемблерный код в **объектный файл** — бинарный файл с машинным кодом, но ещё не готовый к запуску (в нём не разрешены внешние ссылки).

Объектный файл имеет расширение \`.o\` (на Linux) или \`.obj\` (на Windows):`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Создание объектного файла
gcc -c hello.c -o hello.o

# Посмотреть содержимое объектного файла
file hello.o
objdump -d hello.o`,
      filename: 'terminal',
    },
    {
      type: 'output',
      content: `hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped

hello.o:     file format elf64-x86-64

Disassembly of section .text:

0000000000000000 <main>:
   0:   55                      push   %rbp
   1:   48 89 e5                mov    %rsp,%rbp
   4:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rdi
   b:   e8 00 00 00 00          call   10 <main+0x10>
  10:   b8 00 00 00 00          mov    $0x0,%eax
  15:   5d                      pop    %rbp
  16:   c3                      ret`,
      prompt: '$ file hello.o && objdump -d hello.o',
    },
    {
      type: 'prose',
      markdown: `## Этап 4: Линковка

Линковщик (linker) — заключительный этап. Он берёт один или несколько объектных файлов и **связывает** их:
- Друг с другом (если программа состоит из нескольких файлов)
- Со стандартной библиотекой C (libc)
- С другими библиотеками

Именно линковщик разрешает внешние ссылки. Например, когда ваш код вызывает \`printf\`, объектный файл содержит лишь «заглушку». Линковщик заменяет её на реальный адрес функции из библиотеки.`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Линковка: объектный файл -> исполняемый
gcc hello.o -o hello

# Или всё за один шаг:
gcc hello.c -o hello

# Посмотреть тип итогового файла
file hello`,
      filename: 'terminal',
    },
    {
      type: 'output',
      content:
        'hello: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, not stripped',
      prompt: '$ file hello',
    },
    {
      type: 'prose',
      markdown: `## Сводка флагов GCC

Вот основные флаги, которые соответствуют каждому этапу:

| Флаг | Этап | Результат | Пример |
|------|------|-----------|--------|
| \`-E\` | Только препроцессор | \`.i\` файл | \`gcc -E hello.c -o hello.i\` |
| \`-S\` | До ассемблирования | \`.s\` файл | \`gcc -S hello.c -o hello.s\` |
| \`-c\` | До линковки | \`.o\` файл | \`gcc -c hello.c -o hello.o\` |
| (без) | Все этапы | исполняемый | \`gcc hello.c -o hello\` |`,
    },
    {
      type: 'prose',
      markdown: `## Полезные флаги компилятора

Помимо флагов этапов, GCC имеет множество других полезных опций:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Включить все предупреждения
gcc -Wall hello.c -o hello

# Ещё больше предупреждений
gcc -Wall -Wextra hello.c -o hello

# Рассматривать предупреждения как ошибки
gcc -Wall -Wextra -Werror hello.c -o hello

# Выбрать стандарт языка
gcc -std=c17 hello.c -o hello

# Оптимизация для производительности
gcc -O2 hello.c -o hello

# Включить отладочную информацию (для GDB)
gcc -g hello.c -o hello

# Рекомендуемый набор для обучения:
gcc -std=c17 -Wall -Wextra -pedantic -g hello.c -o hello`,
      filename: 'terminal',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Всегда используйте -Wall -Wextra',
      markdown:
        'Компиляция без предупреждений скрывает потенциальные ошибки. Всегда компилируйте с `-Wall -Wextra`. Для учебных целей добавьте `-pedantic` — это заставит компилятор строго следовать стандарту и указывать на нестандартные расширения.',
    },
    {
      type: 'prose',
      markdown: `## Многофайловая компиляция

Реальные программы состоят из многих файлов. Рассмотрим пример:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `// math_utils.h — заголовочный файл (объявления)
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int square(int x);
int cube(int x);

#endif`,
      filename: 'math_utils.h',
    },
    {
      type: 'code',
      language: 'c',
      code: `// math_utils.c — реализация
#include "math_utils.h"

int square(int x)
{
    return x * x;
}

int cube(int x)
{
    return x * x * x;
}`,
      filename: 'math_utils.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `// main.c — главный файл
#include <stdio.h>
#include "math_utils.h"

int main(void)
{
    int n = 5;
    printf("%d^2 = %d\\n", n, square(n));
    printf("%d^3 = %d\\n", n, cube(n));
    return 0;
}`,
      filename: 'main.c',
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Способ 1: скомпилировать всё сразу
gcc main.c math_utils.c -o program

# Способ 2: раздельная компиляция (предпочтительно для больших проектов)
gcc -c main.c -o main.o
gcc -c math_utils.c -o math_utils.o
gcc main.o math_utils.o -o program`,
      filename: 'terminal',
    },
    {
      type: 'output',
      content: `5^2 = 25
5^3 = 125`,
      prompt: '$ ./program',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Раздельная компиляция',
      markdown:
        'При раздельной компиляции изменение одного файла требует перекомпиляции только этого файла и повторной линковки. Для проекта из сотен файлов это экономит огромное количество времени. Системы сборки (Make, CMake) автоматизируют этот процесс.',
    },
    {
      type: 'quiz',
      question:
        'Какой флаг GCC останавливает компиляцию после этапа препроцессирования?',
      options: ['-S', '-c', '-E', '-o'],
      correctIndex: 2,
      explanation:
        'Флаг `-E` запускает только препроцессор и выводит результат. `-S` останавливается после генерации ассемблерного кода. `-c` останавливается после создания объектного файла. `-o` задаёт имя выходного файла.',
    },
    {
      type: 'quiz',
      question:
        'На каком этапе разрешаются вызовы внешних функций (например, printf)?',
      options: [
        'Препроцессирование',
        'Компиляция',
        'Ассемблирование',
        'Линковка',
      ],
      correctIndex: 3,
      explanation:
        'Линковщик (linker) отвечает за разрешение внешних ссылок. Он связывает объектные файлы друг с другом и с библиотеками, подставляя реальные адреса функций вместо заглушек.',
    },
  ],
} satisfies Chapter
