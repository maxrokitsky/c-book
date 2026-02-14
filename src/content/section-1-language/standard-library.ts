import type { Chapter } from '../types'

export default {
  id: 'standard-library',
  title: 'Стандартная библиотека',
  description: 'Обзор stdlib, string, math, time, assert',
  blocks: [
    {
      type: 'prose',
      markdown:
        'Стандартная библиотека C — это набор заголовочных файлов, которые предоставляют функции для работы с памятью, строками, математикой, вводом-выводом, датой и временем, и многим другим. В отличие от языков с богатыми runtime-библиотеками, стандартная библиотека C компактна и низкоуровневая.\n\nВ стандарте C17 определено 29 заголовочных файлов. Рассмотрим наиболее важные из них.',
    },
    {
      type: 'prose',
      markdown:
        '## `<stdlib.h>` — общие утилиты\n\nЭтот заголовок содержит функции преобразования строк в числа, управления памятью, генерации случайных чисел, сортировки и поиска.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int compare_ints(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);
}

int main(void) {
    /* Преобразование строк в числа */
    int n = atoi("42");
    double d = strtod("3.14", NULL);
    long l = strtol("FF", NULL, 16); /* основание 16 */
    printf("atoi: %d, strtod: %f, strtol(hex): %ld\\n", n, d, l);

    /* Сортировка массива */
    int arr[] = {5, 2, 8, 1, 9, 3};
    size_t len = sizeof(arr) / sizeof(arr[0]);
    qsort(arr, len, sizeof(int), compare_ints);

    printf("Отсортировано: ");
    for (size_t i = 0; i < len; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");

    /* Бинарный поиск */
    int key = 8;
    int *found = bsearch(&key, arr, len, sizeof(int), compare_ints);
    if (found) printf("Найдено: %d\\n", *found);

    /* Случайные числа */
    srand(42);
    printf("Случайное: %d\\n", rand() % 100);

    return 0;
}`,
      filename: 'stdlib_demo.c',
    },
    {
      type: 'output',
      content:
        'atoi: 42, strtod: 3.140000, strtol(hex): 255\nОтсортировано: 1 2 3 5 8 9 \nНайдено: 8\nСлучайное: 67',
      prompt: '$ gcc stdlib_demo.c -o stdlib_demo && ./stdlib_demo',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'atoi() vs strtol()',
      markdown:
        'Функция `atoi()` не сообщает об ошибках: при невалидном вводе она возвращает 0, что неотличимо от корректного преобразования строки `"0"`. Используйте `strtol()` / `strtod()` — они позволяют обнаружить ошибку через `errno` и указатель `endptr`.',
    },
    {
      type: 'prose',
      markdown:
        '## `<string.h>` — работа со строками и памятью\n\nФункции для копирования, сравнения, поиска в строках и блоках памяти.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    /* Длина строки */
    const char *s = "Hello, world!";
    printf("strlen: %zu\\n", strlen(s));

    /* Копирование строк */
    char buf[64];
    strncpy(buf, s, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\\0';
    printf("strncpy: %s\\n", buf);

    /* Конкатенация */
    char greeting[64] = "Привет, ";
    strncat(greeting, "мир!", sizeof(greeting) - strlen(greeting) - 1);
    printf("strncat: %s\\n", greeting);

    /* Сравнение */
    printf("strcmp: %d\\n", strcmp("abc", "abd")); /* < 0 */

    /* Поиск подстроки */
    const char *pos = strstr(s, "world");
    if (pos) printf("strstr: найдено на позиции %td\\n", pos - s);

    /* Работа с памятью */
    int a[] = {1, 2, 3};
    int b[3];
    memcpy(b, a, sizeof(a));
    printf("memcpy: %d %d %d\\n", b[0], b[1], b[2]);

    /* Заполнение нулями */
    memset(b, 0, sizeof(b));
    printf("memset: %d %d %d\\n", b[0], b[1], b[2]);

    return 0;
}`,
      filename: 'string_demo.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Осторожно с strcpy и strcat',
      markdown:
        'Функции `strcpy()` и `strcat()` не проверяют размер буфера и могут привести к **переполнению буфера** — серьёзной уязвимости безопасности. Всегда используйте `strncpy()` / `strncat()` с явным ограничением длины, или POSIX-функцию `strlcpy()` / `strlcat()` (где доступна).',
    },
    {
      type: 'prose',
      markdown:
        '## `<math.h>` — математические функции\n\nТригонометрия, степени, логарифмы, округление. Не забудьте подключить библиотеку при линковке: `-lm`.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <math.h>

int main(void) {
    printf("sqrt(2):    %f\\n", sqrt(2.0));
    printf("pow(2, 10): %f\\n", pow(2.0, 10.0));
    printf("sin(pi/2):  %f\\n", sin(M_PI / 2));
    printf("log(e):     %f\\n", log(M_E));
    printf("log10(100): %f\\n", log10(100.0));
    printf("ceil(2.3):  %f\\n", ceil(2.3));
    printf("floor(2.7): %f\\n", floor(2.7));
    printf("fabs(-5.5): %f\\n", fabs(-5.5));
    printf("fmod(10,3): %f\\n", fmod(10.0, 3.0));

    /* Проверка на специальные значения */
    printf("isnan(NAN):    %d\\n", isnan(NAN));
    printf("isinf(INFINITY): %d\\n", isinf(INFINITY));

    return 0;
}`,
      filename: 'math_demo.c',
    },
    {
      type: 'output',
      content:
        'sqrt(2):    1.414214\npow(2, 10): 1024.000000\nsin(pi/2):  1.000000\nlog(e):     1.000000\nlog10(100): 2.000000\nceil(2.3):  3.000000\nfloor(2.7): 2.000000\nfabs(-5.5): 5.500000\nfmod(10,3): 1.000000\nisnan(NAN):    1\nisinf(INFINITY): 1',
      prompt: '$ gcc math_demo.c -o math_demo -lm && ./math_demo',
    },
    {
      type: 'prose',
      markdown:
        '## `<time.h>` — дата и время',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <time.h>

int main(void) {
    /* Текущее время */
    time_t now = time(NULL);
    printf("Секунды с epoch: %ld\\n", (long)now);

    /* Преобразование в локальное время */
    struct tm *local = localtime(&now);
    char buf[64];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", local);
    printf("Локальное время: %s\\n", buf);

    /* Измерение времени выполнения */
    clock_t start = clock();

    volatile long sum = 0;
    for (long i = 0; i < 100000000L; i++) {
        sum += i;
    }

    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    printf("Время: %.3f сек\\n", elapsed);

    /* Разница между датами */
    struct tm date1 = { .tm_year = 124, .tm_mon = 0, .tm_mday = 1 };
    struct tm date2 = { .tm_year = 124, .tm_mon = 11, .tm_mday = 31 };
    time_t t1 = mktime(&date1);
    time_t t2 = mktime(&date2);
    double days = difftime(t2, t1) / 86400.0;
    printf("Дней в 2024: %.0f\\n", days);

    return 0;
}`,
      filename: 'time_demo.c',
    },
    {
      type: 'prose',
      markdown:
        '## `<assert.h>` — макрос assert\n\nМакрос `assert()` проверяет условие во время выполнения. Если условие ложно, программа завершается с сообщением об ошибке. В release-сборке `assert` можно отключить, определив макрос `NDEBUG` перед подключением заголовка.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <assert.h>

double safe_divide(double a, double b) {
    assert(b != 0.0 && "Деление на ноль!");
    return a / b;
}

int main(void) {
    printf("10 / 3 = %f\\n", safe_divide(10.0, 3.0));

    /* Это вызовет assert failure */
    /* printf("10 / 0 = %f\\n", safe_divide(10.0, 0.0)); */

    /* C11: _Static_assert — проверка на этапе компиляции */
    _Static_assert(sizeof(int) >= 4, "int должен быть >= 4 байт");

    return 0;
}`,
      filename: 'assert_demo.c',
    },
    {
      type: 'quiz',
      question:
        'Какая функция из стандартной библиотеки безопаснее для преобразования строки в число?',
      options: [
        'atoi()',
        'atof()',
        'strtol()',
        'sscanf()',
      ],
      correctIndex: 2,
      explanation:
        'strtol() позволяет обнаружить ошибки через errno и указатель endptr, а также задать основание системы счисления. atoi() и atof() не сигнализируют об ошибках. sscanf() полезен, но не возвращает информацию о точке останова парсинга.',
    },
    {
      type: 'exercise',
      title: 'Безопасный парсер чисел',
      description:
        'Напишите функцию `int safe_parse_int(const char *str, int *out)`, которая:\n1. Преобразует строку в `int` с помощью `strtol()`\n2. Возвращает 0 при успехе, -1 при ошибке\n3. Обрабатывает случаи: пустая строка, строка с нечисловыми символами, переполнение\n\nПротестируйте на строках: `"42"`, `"abc"`, `""`, `"99999999999999"`, `"123abc"`.',
      hints: [
        'Перед вызовом strtol() установите errno = 0',
        'После вызова проверьте: endptr == str (ничего не прочитано), *endptr != \'\\0\' (лишние символы), errno == ERANGE (переполнение)',
        'Не забудьте проверить, что результат помещается в int (strtol возвращает long)',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <limits.h>

int safe_parse_int(const char *str, int *out) {
    if (!str || *str == '\\0') return -1;

    char *endptr;
    errno = 0;
    long val = strtol(str, &endptr, 10);

    if (endptr == str) return -1;       /* ничего не прочитано */
    if (*endptr != '\\0') return -1;     /* лишние символы */
    if (errno == ERANGE) return -1;     /* переполнение long */
    if (val < INT_MIN || val > INT_MAX) return -1; /* не в int */

    *out = (int)val;
    return 0;
}

int main(void) {
    const char *tests[] = {"42", "abc", "", "99999999999999", "123abc"};
    for (int i = 0; i < 5; i++) {
        int result;
        int ok = safe_parse_int(tests[i], &result);
        if (ok == 0)
            printf("\\"%s\\" -> %d\\n", tests[i], result);
        else
            printf("\\"%s\\" -> ОШИБКА\\n", tests[i]);
    }
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
