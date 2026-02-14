import type { Chapter } from '../types'

export default {
  id: 'debugging',
  title: 'Отладка',
  description: 'GDB, Valgrind, AddressSanitizer и другие инструменты отладки',
  blocks: [
    {
      type: 'prose',
      markdown: `# Отладка

Отладка — одна из самых важных частей разработки на C. Ошибки работы с памятью, неинициализированные переменные и неопределённое поведение могут проявляться непредсказуемо, и без правильных инструментов найти их крайне сложно.

В этой главе мы рассмотрим три основных инструмента: **GDB** (отладчик), **Valgrind** (анализатор памяти) и **AddressSanitizer** (компиляторный санитайзер).`,
    },
    {
      type: 'prose',
      markdown: `## Подготовка к отладке

Для отладки необходимо компилировать с отладочной информацией (флаг \`-g\`) и без оптимизаций (\`-O0\`):

\`\`\`bash
gcc -g -O0 -Wall -Wextra -std=c17 -o myapp src/main.c
\`\`\`

Флаг \`-g\` сохраняет в бинарном файле информацию о номерах строк, именах переменных и функций.`,
    },
    {
      type: 'prose',
      markdown: `## GDB — GNU Debugger

GDB позволяет остановить программу в любой точке, осмотреть переменные, пройти код по шагам и проанализировать стек вызовов.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int factorial(int n)
{
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void)
{
    int result = factorial(5);
    printf("5! = %d\\n", result);
    return 0;
}`,
      filename: 'factorial.c',
    },
    {
      type: 'output',
      content: `(gdb) break factorial
Breakpoint 1 at 0x1149: file factorial.c, line 5.
(gdb) run
Starting program: /home/user/factorial

Breakpoint 1, factorial (n=5) at factorial.c:5
5	    if (n <= 1) return 1;
(gdb) print n
$1 = 5
(gdb) backtrace
#0  factorial (n=5) at factorial.c:5
#1  0x0000555555555171 in main () at factorial.c:11
(gdb) continue
Continuing.

Breakpoint 1, factorial (n=4) at factorial.c:5
(gdb) print n
$2 = 4`,
      prompt: '$ gdb ./factorial',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Основные команды GDB',
      markdown: `- \`break <функция/строка>\` — установить точку останова
- \`run\` — запустить программу
- \`next\` (n) — шаг через (step over)
- \`step\` (s) — шаг в (step into)
- \`print <выражение>\` — вывести значение
- \`backtrace\` (bt) — стек вызовов
- \`watch <переменная>\` — остановить при изменении
- \`continue\` (c) — продолжить выполнение
- \`quit\` (q) — выйти`,
    },
    {
      type: 'prose',
      markdown: `## Valgrind — обнаружение утечек памяти

Valgrind — мощный инструмент для поиска утечек памяти, обращений к неинициализированной памяти и чтения за границами выделенных блоков.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdlib.h>
#include <string.h>

int main(void)
{
    /* Утечка: память выделена, но не освобождена */
    char *buf = malloc(100);
    strcpy(buf, "hello");

    /* Чтение за границей массива */
    int *arr = malloc(3 * sizeof(int));
    arr[0] = 1;
    arr[1] = 2;
    arr[2] = 3;
    int x = arr[3]; /* ошибка! */
    (void)x;

    free(arr);
    /* buf не освобождён — утечка */
    return 0;
}`,
      filename: 'leaky.c',
    },
    {
      type: 'output',
      content: `==12345== Invalid read of size 4
==12345==    at 0x10918F: main (leaky.c:15)
==12345==  Address 0x4a4a04c is 0 bytes after a block of size 12 alloc'd
==12345==    at 0x483B7F3: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==12345==    at 0x109171: main (leaky.c:11)
==12345==
==12345== HEAP SUMMARY:
==12345==     in use at exit: 100 bytes in 1 blocks
==12345==   total heap usage: 2 allocs, 1 frees, 112 bytes allocated
==12345==
==12345== LEAK SUMMARY:
==12345==    definitely lost: 100 bytes in 1 blocks`,
      prompt: '$ valgrind --leak-check=full ./leaky',
    },
    {
      type: 'prose',
      markdown: `## AddressSanitizer (ASan)

**AddressSanitizer** — компиляторный санитайзер, встроенный в GCC и Clang. В отличие от Valgrind, ASan инструментирует код на этапе компиляции и работает значительно быстрее (замедление ~2x против ~20x у Valgrind).`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Компиляция с AddressSanitizer
gcc -fsanitize=address -g -O1 -fno-omit-frame-pointer -o leaky leaky.c

# Запуск — ASan выведет подробный отчёт при ошибке
./leaky

# Другие полезные санитайзеры:
# -fsanitize=undefined   — UndefinedBehaviorSanitizer (UBSan)
# -fsanitize=thread      — ThreadSanitizer (TSan)
# -fsanitize=memory      — MemorySanitizer (MSan, только Clang)`,
      filename: 'sanitizers.sh',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Когда что использовать?',
      markdown: `- **GDB** — для пошаговой отладки логических ошибок, анализа стека вызовов при segfault
- **Valgrind** — для поиска утечек памяти и использования неинициализированных данных. Не требует перекомпиляции.
- **ASan** — для быстрого обнаружения обращений за границы массивов, use-after-free, double-free. Требует перекомпиляции, но работает гораздо быстрее Valgrind.
- **UBSan** — для обнаружения неопределённого поведения (целочисленное переполнение, сдвиг за пределы типа и т.д.)`,
    },
    {
      type: 'quiz',
      question: 'Какое преимущество AddressSanitizer имеет перед Valgrind?',
      options: [
        'Не требует перекомпиляции кода',
        'Работает на любой платформе',
        'Работает значительно быстрее (замедление ~2x против ~20x)',
        'Может находить логические ошибки',
      ],
      correctIndex: 2,
      explanation:
        'ASan инструментирует код на этапе компиляции, что позволяет ему работать значительно быстрее — с замедлением около 2x по сравнению с ~20x у Valgrind. Однако ASan требует перекомпиляции, а Valgrind — нет.',
    },
    {
      type: 'exercise',
      title: 'Найдите ошибки с помощью отладки',
      description:
        'В приведённом коде содержатся как минимум три ошибки работы с памятью. Определите их и исправьте код.',
      hints: [
        'Проверьте, освобождается ли вся выделенная память',
        'Проверьте границы массива при записи',
        'Обратите внимание на использование указателя после free()',
      ],
      solution: `#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void)
{
    /* Ошибка 1: запись за границу массива (off-by-one) */
    /* Было: int *arr = malloc(5 * sizeof(int)); arr[5] = 99; */
    int *arr = malloc(6 * sizeof(int));
    for (int i = 0; i <= 5; i++) arr[i] = i;

    /* Ошибка 2: use-after-free */
    /* Было: free(arr); printf("%d", arr[0]); */
    printf("%d\\n", arr[0]);
    free(arr);

    /* Ошибка 3: утечка памяти */
    /* Было: char *s = malloc(50); return 0; */
    char *s = malloc(50);
    strcpy(s, "test");
    printf("%s\\n", s);
    free(s);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
