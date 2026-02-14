import type { Chapter } from '../types'

export default {
  id: 'error-handling',
  title: 'Обработка ошибок',
  description: 'errno, perror, коды возврата, стратегии обработки',
  blocks: [
    {
      type: 'prose',
      markdown: `# Обработка ошибок в C

В отличие от языков с исключениями (C++, Java, Python), C использует **коды возврата** и глобальную переменную **errno** для сигнализации об ошибках. Это требует от программиста дисциплины: каждый вызов функции, который может завершиться неудачей, нужно проверять вручную.

Основные механизмы обработки ошибок:

- **Коды возврата** — функция возвращает специальное значение при ошибке
- **errno** — глобальная переменная с кодом последней ошибки
- **perror / strerror** — преобразование кода ошибки в текст`,
    },
    {
      type: 'prose',
      markdown: `## Коды возврата — основной паттерн

Большинство функций стандартной библиотеки сигнализируют об ошибке через возвращаемое значение. Типичные соглашения:

| Тип возврата | Успех | Ошибка |
|-------------|-------|--------|
| Указатель | Валидный адрес | \`NULL\` |
| \`int\` (POSIX) | \`0\` | \`-1\` |
| \`size_t\` | Количество элементов | Меньше ожидаемого |
| \`int\` (из \`main\`) | \`EXIT_SUCCESS\` (0) | \`EXIT_FAILURE\` (1) |`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int safe_divide(int a, int b, int *result) {
    if (b == 0) {
        return -1;  /* Код ошибки: деление на ноль */
    }
    *result = a / b;
    return 0;  /* Успех */
}

int main(void) {
    int result;

    if (safe_divide(10, 3, &result) == 0) {
        printf("10 / 3 = %d\\n", result);
    }

    if (safe_divide(10, 0, &result) != 0) {
        fprintf(stderr, "Ошибка: деление на ноль\\n");
    }

    return EXIT_SUCCESS;
}`,
      filename: 'return_codes.c',
    },
    {
      type: 'output',
      content: `10 / 3 = 3
Ошибка: деление на ноль`,
      prompt: '$ ./return_codes',
    },
    {
      type: 'prose',
      markdown: `## errno — глобальный код ошибки

Переменная \`errno\` (из \`<errno.h>\`) устанавливается функциями стандартной библиотеки и POSIX при возникновении ошибки. Важные правила:

1. \`errno\` **не обнуляется** при успешном вызове — проверяйте его только после обнаружения ошибки
2. Перед вызовом функции, которая может установить \`errno\`, его нужно **явно обнулить**
3. \`errno\` — потокобезопасная макропеременная (каждый поток имеет свою копию)`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <math.h>

int main(void) {
    /* Пример 1: ошибка открытия файла */
    FILE *fp = fopen("/несуществующий/путь/файл.txt", "r");
    if (fp == NULL) {
        printf("errno = %d\\n", errno);
        printf("Ошибка: %s\\n", strerror(errno));
        perror("fopen");  /* Выводит: fopen: No such file or directory */
    }

    /* Пример 2: проверка errno после math-функции */
    errno = 0;  /* Обнуляем перед вызовом */
    double val = log(-1.0);
    if (errno != 0) {
        perror("log(-1)");
    }

    /* Пример 3: strtol с проверкой ошибок */
    const char *str = "99999999999999999999";
    errno = 0;
    long num = strtol(str, NULL, 10);
    if (errno == ERANGE) {
        fprintf(stderr, "Число вне диапазона: %s\\n", str);
    }

    return 0;
}`,
      filename: 'errno_example.c',
    },
    {
      type: 'output',
      content: `errno = 2
Ошибка: No such file or directory
fopen: No such file or directory
log(-1): Numerical argument out of domain
Число вне диапазона: 99999999999999999999`,
      prompt: '$ ./errno_example',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Распространённые коды errno',
      markdown: `- \`ENOENT\` (2) — файл или каталог не существует
- \`EACCES\` (13) — нет прав доступа
- \`ENOMEM\` (12) — недостаточно памяти
- \`EINVAL\` (22) — недопустимый аргумент
- \`ERANGE\` (34) — результат вне диапазона
- \`EIO\` (5) — ошибка ввода/вывода

Полный список доступен в \`man 3 errno\` или \`<errno.h>\`.`,
    },
    {
      type: 'prose',
      markdown: `## Паттерн «goto cleanup»

В функциях, которые выделяют несколько ресурсов, удобно использовать \`goto\` для централизованной очистки. Этот паттерн широко применяется в ядре Linux и других C-проектах.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int process_file(const char *input, const char *output) {
    int status = -1;
    FILE *in = NULL;
    FILE *out = NULL;
    char *buffer = NULL;

    in = fopen(input, "r");
    if (!in) {
        perror(input);
        goto cleanup;
    }

    out = fopen(output, "w");
    if (!out) {
        perror(output);
        goto cleanup;
    }

    buffer = malloc(4096);
    if (!buffer) {
        perror("malloc");
        goto cleanup;
    }

    /* Обработка файла... */
    while (fgets(buffer, 4096, in)) {
        fputs(buffer, out);
    }

    status = 0;  /* Успех */

cleanup:
    free(buffer);       /* free(NULL) безопасен */
    if (out) fclose(out);
    if (in) fclose(in);
    return status;
}

int main(void) {
    if (process_file("input.txt", "output.txt") != 0) {
        fprintf(stderr, "Обработка завершилась с ошибкой\\n");
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}`,
      filename: 'goto_cleanup.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'goto — не всегда зло',
      markdown:
        'Хотя `goto` часто критикуют, паттерн `goto cleanup` — '
        + 'общепринятая практика в C. Он избавляет от вложенных `if` '
        + 'и гарантирует, что все ресурсы будут освобождены в одном месте. '
        + 'Ядро Linux содержит тысячи таких конструкций.',
    },
    {
      type: 'prose',
      markdown: `## Пользовательская система ошибок

Для собственных библиотек полезно определять свои коды ошибок с помощью \`enum\` и функцию для их текстового представления.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

typedef enum {
    DB_OK = 0,
    DB_ERR_NOT_FOUND,
    DB_ERR_DUPLICATE,
    DB_ERR_FULL,
    DB_ERR_IO,
} DbError;

const char *db_strerror(DbError err) {
    switch (err) {
        case DB_OK:            return "Успех";
        case DB_ERR_NOT_FOUND: return "Запись не найдена";
        case DB_ERR_DUPLICATE: return "Дублирующий ключ";
        case DB_ERR_FULL:      return "База данных переполнена";
        case DB_ERR_IO:        return "Ошибка ввода/вывода";
        default:               return "Неизвестная ошибка";
    }
}

DbError db_insert(int key, const char *value) {
    if (key < 0) return DB_ERR_NOT_FOUND;
    /* ... */
    return DB_OK;
}

int main(void) {
    DbError err = db_insert(-1, "test");
    if (err != DB_OK) {
        fprintf(stderr, "Ошибка БД: %s\\n", db_strerror(err));
    }
    return 0;
}`,
      filename: 'custom_errors.c',
    },
    {
      type: 'quiz',
      question: 'Почему нужно обнулять errno перед вызовом функции?',
      options: [
        'Потому что errno автоматически обнуляется перед каждым вызовом',
        'Потому что errno не меняется при успешном вызове и может содержать старое значение',
        'Потому что компилятор выдаёт предупреждение, если errno ненулевой',
        'Потому что ненулевой errno вызывает неопределённое поведение',
      ],
      correctIndex: 1,
      explanation:
        'Стандарт C не требует от функций обнулять errno при успехе. Если вы не '
        + 'обнулите errno перед вызовом, после него может остаться значение от '
        + 'предыдущей ошибки, что приведёт к ложному срабатыванию проверки.',
    },
    {
      type: 'exercise',
      title: 'Безопасное чтение числа из строки',
      description:
        'Напишите функцию `int safe_strtol(const char *str, long *out)`, '
        + 'которая преобразует строку в `long` с полной проверкой ошибок. '
        + 'Функция должна обнаруживать: пустую строку, невалидные символы, '
        + 'переполнение. Верните 0 при успехе и -1 при ошибке.',
      hints: [
        'Используйте strtol с параметром endptr для обнаружения невалидных символов',
        'Обнулите errno перед вызовом strtol, затем проверьте на ERANGE',
        'Проверьте, что *endptr указывает на конец строки (нет мусора после числа)',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <limits.h>

int safe_strtol(const char *str, long *out) {
    if (str == NULL || *str == '\\0') {
        return -1;  /* Пустая строка */
    }

    char *endptr;
    errno = 0;
    long val = strtol(str, &endptr, 10);

    if (errno == ERANGE) {
        return -1;  /* Переполнение */
    }
    if (*endptr != '\\0') {
        return -1;  /* Невалидные символы */
    }

    *out = val;
    return 0;
}

int main(void) {
    long val;
    const char *tests[] = {"42", "-7", "abc", "12x", "", "99999999999999999999"};

    for (int i = 0; i < 6; i++) {
        if (safe_strtol(tests[i], &val) == 0) {
            printf("\\"%s\\" -> %ld\\n", tests[i], val);
        } else {
            printf("\\"%s\\" -> ОШИБКА\\n", tests[i]);
        }
    }
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
