import type { Chapter } from '../types'

export default {
  id: 'variadic-functions',
  title: 'Функции с переменным числом аргументов',
  description: 'stdarg.h, va_list, реализация printf',
  blocks: [
    {
      type: 'prose',
      markdown: `# Функции с переменным числом аргументов

В C функции могут принимать **переменное число аргументов** (variadic functions). Самый известный пример — \`printf\`:

\`\`\`c
printf("Имя: %s, возраст: %d\\n", name, age);
\`\`\`

Количество и типы аргументов после форматной строки определяются в рантайме. Механизм реализуется через макросы из заголовочного файла \`<stdarg.h>\`.`,
    },
    {
      type: 'prose',
      markdown: `## Макросы stdarg.h

| Макрос | Описание |
|--------|----------|
| \`va_list\` | Тип для хранения информации о переменных аргументах |
| \`va_start(ap, last)\` | Инициализирует \`ap\`; \`last\` — последний именованный параметр |
| \`va_arg(ap, type)\` | Извлекает следующий аргумент типа \`type\` |
| \`va_end(ap)\` | Завершает работу с аргументами (обязательный вызов) |
| \`va_copy(dest, src)\` | Копирует состояние \`va_list\` (C99) |

Функция должна иметь **хотя бы один именованный параметр** перед \`...\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdarg.h>

/* Суммирование произвольного количества целых чисел.
   Первый аргумент count — количество чисел. */
int sum(int count, ...) {
    va_list args;
    va_start(args, count);

    int total = 0;
    for (int i = 0; i < count; i++) {
        total += va_arg(args, int);
    }

    va_end(args);
    return total;
}

int main(void) {
    printf("sum(3, 10, 20, 30) = %d\\n", sum(3, 10, 20, 30));
    printf("sum(5, 1, 2, 3, 4, 5) = %d\\n", sum(5, 1, 2, 3, 4, 5));
    printf("sum(0) = %d\\n", sum(0));
    return 0;
}`,
      filename: 'variadic_sum.c',
    },
    {
      type: 'output',
      content: `sum(3, 10, 20, 30) = 60
sum(5, 1, 2, 3, 4, 5) = 15
sum(0) = 0`,
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Типобезопасность отсутствует',
      markdown:
        'Компилятор **не проверяет типы** variadic-аргументов! Если вы вызовете '
        + '`va_arg(args, int)`, а передан `double`, результат — неопределённое '
        + 'поведение. Единственная защита — атрибуты вроде '
        + '`__attribute__((format(printf, 1, 2)))` для printf-подобных функций.',
    },
    {
      type: 'prose',
      markdown: `## Способы определения конца аргументов

Функция не знает, сколько аргументов передано, пока вы ей об этом не скажете. Есть три основных подхода:

1. **Счётчик** — первый аргумент указывает количество остальных
2. **Сигнальное значение** (sentinel) — специальное значение означает конец
3. **Форматная строка** — как в printf, строка определяет типы и количество`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdarg.h>

/* Подход 2: сигнальное значение (sentinel) */
double average(double first, ...) {
    va_list args;
    va_start(args, first);

    double sum = first;
    int count = 1;
    double val;

    /* Читаем до отрицательного значения (sentinel) */
    while ((val = va_arg(args, double)) >= 0) {
        sum += val;
        count++;
    }

    va_end(args);
    return sum / count;
}

/* Подход 3: форматная строка */
void my_print(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);

    while (*fmt) {
        if (*fmt == '%') {
            fmt++;
            switch (*fmt) {
                case 'd': printf("%d", va_arg(args, int)); break;
                case 'f': printf("%.2f", va_arg(args, double)); break;
                case 's': printf("%s", va_arg(args, char *)); break;
                case '%': putchar('%'); break;
            }
        } else {
            putchar(*fmt);
        }
        fmt++;
    }

    va_end(args);
}

int main(void) {
    printf("Среднее: %.2f\\n", average(10.0, 20.0, 30.0, -1.0));

    my_print("Имя: %s, возраст: %d, рост: %f м\\n",
             "Алиса", 25, 1.68);
    return 0;
}`,
      filename: 'sentinel_format.c',
    },
    {
      type: 'output',
      content: `Среднее: 20.00
Имя: Алиса, возраст: 25, рост: 1.68 м`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Продвижение типов (default argument promotion)',
      markdown:
        'При передаче в variadic-функцию аргументы подвергаются **продвижению типов**:\n'
        + '- `char` и `short` преобразуются в `int`\n'
        + '- `float` преобразуется в `double`\n\n'
        + 'Поэтому `va_arg(args, float)` — ошибка! Используйте `va_arg(args, double)`. '
        + 'Аналогично, `va_arg(args, char)` следует заменить на `va_arg(args, int)`.',
    },
    {
      type: 'prose',
      markdown: `## va_copy: передача va_list в другую функцию

Иногда нужно пройти по аргументам дважды — например, сначала подсчитать длину строки, а потом записать данные. Для этого используют \`va_copy\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>

/* Безопасное форматирование строки с автовыделением памяти */
char *my_asprintf(const char *fmt, ...) {
    va_list args, args_copy;
    va_start(args, fmt);

    /* Первый проход: вычисляем нужный размер */
    va_copy(args_copy, args);
    int len = vsnprintf(NULL, 0, fmt, args_copy);
    va_end(args_copy);

    if (len < 0) {
        va_end(args);
        return NULL;
    }

    /* Второй проход: записываем в буфер */
    char *buf = malloc(len + 1);
    if (buf) {
        vsnprintf(buf, len + 1, fmt, args);
    }

    va_end(args);
    return buf;
}

int main(void) {
    char *msg = my_asprintf("Результат: %d + %d = %d", 10, 20, 30);
    if (msg) {
        printf("%s\\n", msg);
        free(msg);
    }
    return 0;
}`,
      filename: 'va_copy_example.c',
    },
    {
      type: 'output',
      content: 'Результат: 10 + 20 = 30',
    },
    {
      type: 'prose',
      markdown: `## Реальный пример: функция логирования

Variadic-функции часто используются для создания обёрток над \`printf\` — логгеры, диагностические функции, форматированный вывод ошибок.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdarg.h>
#include <time.h>

typedef enum { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR } LogLevel;

static LogLevel min_level = LOG_INFO;

void set_log_level(LogLevel level) { min_level = level; }

void log_message(LogLevel level, const char *file, int line,
                 const char *fmt, ...) {
    if (level < min_level) return;

    const char *level_names[] = {"DEBUG", "INFO ", "WARN ", "ERROR"};

    /* Метка времени */
    time_t now = time(NULL);
    struct tm *tm = localtime(&now);
    char timestamp[20];
    strftime(timestamp, sizeof(timestamp), "%H:%M:%S", tm);

    /* Печатаем заголовок */
    fprintf(stderr, "[%s] %s %s:%d: ",
            timestamp, level_names[level], file, line);

    /* Печатаем сообщение пользователя */
    va_list args;
    va_start(args, fmt);
    vfprintf(stderr, fmt, args);
    va_end(args);

    fputc('\\n', stderr);
}

/* Макрос для автоподстановки файла и строки */
#define LOG(level, ...) \\
    log_message(level, __FILE__, __LINE__, __VA_ARGS__)

int main(void) {
    LOG(LOG_DEBUG, "Это не напечатается (уровень ниже INFO)");
    LOG(LOG_INFO,  "Сервер запущен на порту %d", 8080);
    LOG(LOG_WARN,  "Диск заполнен на %d%%", 95);
    LOG(LOG_ERROR, "Не удалось открыть файл: %s", "/tmp/data.db");

    return 0;
}`,
      filename: 'logger.c',
    },
    {
      type: 'output',
      content: `[14:32:05] INFO  logger.c:38: Сервер запущен на порту 8080
[14:32:05] WARN  logger.c:39: Диск заполнен на 95%
[14:32:05] ERROR logger.c:40: Не удалось открыть файл: /tmp/data.db`,
    },
    {
      type: 'quiz',
      question: 'Что произойдёт при вызове `va_arg(args, float)` в variadic-функции?',
      options: [
        'Корректно прочитает значение float',
        'Неопределённое поведение из-за продвижения типов',
        'Автоматически преобразует double обратно в float',
        'Ошибка компиляции',
      ],
      correctIndex: 1,
      explanation:
        'При передаче в variadic-функцию `float` автоматически продвигается до `double`. '
        + 'Вызов `va_arg(args, float)` попытается прочитать 4 байта вместо 8, '
        + 'что приведёт к неопределённому поведению. Правильно: `va_arg(args, double)`.',
    },
    {
      type: 'exercise',
      title: 'Функция конкатенации строк',
      description:
        'Напишите функцию `char *concat(int count, ...)`, которая принимает '
        + 'количество строк и сами строки (`const char *`), а возвращает '
        + 'новую строку — результат конкатенации всех аргументов. Память '
        + 'выделяется динамически; вызывающий код отвечает за `free`.',
      hints: [
        'Первый проход (va_copy): подсчитайте суммарную длину строк через strlen',
        'Выделите память под результат: malloc(total_len + 1)',
        'Второй проход: скопируйте строки одну за другой через strcat или memcpy',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

char *concat(int count, ...) {
    va_list args, args_copy;
    va_start(args, count);
    va_copy(args_copy, args);

    /* Первый проход: считаем суммарную длину */
    size_t total = 0;
    for (int i = 0; i < count; i++) {
        total += strlen(va_arg(args_copy, const char *));
    }
    va_end(args_copy);

    /* Выделяем память и конкатенируем */
    char *result = malloc(total + 1);
    if (!result) { va_end(args); return NULL; }

    result[0] = '\\0';
    for (int i = 0; i < count; i++) {
        strcat(result, va_arg(args, const char *));
    }

    va_end(args);
    return result;
}

int main(void) {
    char *s = concat(4, "Привет", ", ", "мир", "!");
    if (s) {
        printf("%s\\n", s);  /* Привет, мир! */
        free(s);
    }
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
