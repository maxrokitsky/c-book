import type { Chapter } from '../types'

export default {
  id: 'api-design',
  title: 'Дизайн API',
  description: 'Принципы проектирования удобных, безопасных и стабильных API на C',
  blocks: [
    {
      type: 'prose',
      markdown: `# Дизайн API

API (Application Programming Interface) библиотеки на C — это её заголовочные файлы. Хорошо спроектированный API интуитивно понятен, сложен для неправильного использования и стабилен между версиями.

В этой главе мы рассмотрим принципы и паттерны проектирования API, которые зарекомендовали себя в крупных C-проектах.`,
    },
    {
      type: 'prose',
      markdown: `## Принципы хорошего API

1. **Минимализм** — экспортируйте только то, что нужно пользователю. Всё остальное — \`static\` или в внутренних заголовках.
2. **Консистентность** — единый стиль именования, единый порядок параметров, единые конвенции ошибок.
3. **Сложно использовать неправильно** — дизайн должен подталкивать к правильному использованию.
4. **Стабильность ABI** — изменения не должны ломать код, скомпилированный с предыдущей версией.`,
    },
    {
      type: 'prose',
      markdown: `## Именование

Имена в C глобальны — нет пространств имён. Используйте **префикс библиотеки** для всех публичных символов:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Плохо: засоряет глобальное пространство имён */
Buffer *create(int size);
void destroy(Buffer *b);
int read(Buffer *b, char *out, int n);

/* Хорошо: префикс библиотеки */
MyLib_Buffer *mylib_buffer_create(size_t capacity);
void mylib_buffer_destroy(MyLib_Buffer *buf);
int mylib_buffer_read(MyLib_Buffer *buf, char *out, size_t n);

/* Конвенции именования:
 * - Функции: prefix_module_action()
 * - Типы:    Prefix_TypeName
 * - Макросы: PREFIX_MACRO_NAME
 * - Enum:    PREFIX_ENUM_VALUE
 */`,
      filename: 'naming.c',
    },
    {
      type: 'prose',
      markdown: `## Конвенции параметров

Соблюдайте единый порядок параметров во всём API:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/*
 * Конвенция: объект первый, выходные параметры последние.
 * Подобно this/self в ООП-языках.
 */

/* Правильный порядок: объект, входные, выходные */
int mylib_buffer_read(MyLib_Buffer *buf, size_t offset,
                      char *out, size_t out_size);

int mylib_buffer_write(MyLib_Buffer *buf, size_t offset,
                       const char *data, size_t data_len);

/*
 * const-корректность: если функция не изменяет объект,
 * параметр должен быть const
 */
size_t mylib_buffer_size(const MyLib_Buffer *buf);
const char *mylib_buffer_data(const MyLib_Buffer *buf);`,
      filename: 'parameter_conventions.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Правило const',
      markdown: 'Используйте `const` везде, где это возможно. Если функция не модифицирует параметр — пометьте его `const`. Это документация, проверяемая компилятором. Вызывающий сразу видит, какие данные могут быть изменены, а какие — нет.',
    },
    {
      type: 'prose',
      markdown: `## Управление ресурсами

Ясно определите, кто владеет ресурсами. Паттерн create/destroy — стандарт:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Паттерн create/destroy — вызывающий владеет объектом */
MyLib_Conn *mylib_conn_create(const char *host, int port);
void mylib_conn_destroy(MyLib_Conn *conn);

/* Паттерн init/cleanup — вызывающий владеет памятью */
typedef struct {
    /* ... поля ... */
} MyLib_Config;

int mylib_config_init(MyLib_Config *cfg, const char *path);
void mylib_config_cleanup(MyLib_Config *cfg);

/* Использование init/cleanup */
void example(void)
{
    MyLib_Config cfg;
    if (mylib_config_init(&cfg, "app.conf") != 0) {
        /* обработка ошибки */
        return;
    }
    /* ... использование ... */
    mylib_config_cleanup(&cfg);
}

/* destroy безопасен с NULL (как free) */
void mylib_conn_destroy(MyLib_Conn *conn)
{
    if (!conn) return;
    close(conn->fd);
    free(conn->buffer);
    free(conn);
}`,
      filename: 'resource_management.c',
    },
    {
      type: 'prose',
      markdown: `## Обработка ошибок в API

Выберите **одну** конвенцию для всего API и придерживайтесь её:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Вариант 1: функции возвращают код ошибки из enum */
typedef enum {
    MYLIB_OK = 0,
    MYLIB_ERR_NULL_ARG,
    MYLIB_ERR_NO_MEMORY,
    MYLIB_ERR_IO,
    MYLIB_ERR_INVALID_FORMAT,
} MyLib_Error;

const char *mylib_error_string(MyLib_Error err);

MyLib_Error mylib_buffer_append(MyLib_Buffer *buf,
                                 const char *data, size_t len);

/* Вариант 2: возврат указателя (NULL = ошибка) */
MyLib_Buffer *mylib_buffer_create(size_t capacity);

/* Использование */
MyLib_Buffer *buf = mylib_buffer_create(1024);
if (!buf) {
    fprintf(stderr, "Failed to create buffer\\n");
    return;
}

MyLib_Error err = mylib_buffer_append(buf, "hello", 5);
if (err != MYLIB_OK) {
    fprintf(stderr, "Error: %s\\n", mylib_error_string(err));
    mylib_buffer_destroy(buf);
    return;
}`,
      filename: 'error_conventions.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Стабильность ABI',
      markdown: `Для библиотек, распространяемых в бинарном виде, стабильность ABI критична:

- Используйте **непрозрачные типы** — изменение полей структуры не ломает ABI
- Не меняйте **порядок** и **значения** существующих элементов enum
- Добавляйте новые функции, но не удаляйте старые (используйте \`__attribute__((deprecated))\`)
- Следуйте **семантическому версионированию** (SemVer)`,
    },
    {
      type: 'quiz',
      question: 'Почему все публичные функции C-библиотеки должны иметь общий префикс?',
      options: [
        'Для красоты кода',
        'Это требование стандарта C',
        'Для предотвращения конфликтов имён в глобальном пространстве',
        'Для ускорения линковки',
      ],
      correctIndex: 2,
      explanation:
        'В C нет пространств имён. Все функции без static находятся в глобальном пространстве имён. Если две библиотеки экспортируют функцию с одинаковым именем (например, create()), произойдёт конфликт при линковке. Префикс (mylib_) гарантирует уникальность.',
    },
    {
      type: 'exercise',
      title: 'Спроектируйте API для логгера',
      description:
        'Спроектируйте публичный API для библиотеки логирования. API должен поддерживать: уровни логирования (debug, info, warn, error), вывод в файл и/или stderr, форматирование сообщений. Напишите заголовочный файл с Doxygen-комментариями.',
      hints: [
        'Используйте непрозрачный тип для экземпляра логгера',
        'Определите enum для уровней логирования',
        'Подумайте о create/destroy, init/cleanup для объекта логгера',
      ],
      solution: `#ifndef MYLOG_H
#define MYLOG_H

#include <stdio.h>

typedef struct MyLog_Logger MyLog_Logger;

typedef enum {
    MYLOG_DEBUG = 0,
    MYLOG_INFO,
    MYLOG_WARN,
    MYLOG_ERROR,
} MyLog_Level;

/** Создаёт логгер с выводом в указанный файл. */
MyLog_Logger *mylog_create(FILE *output);

/** Уничтожает логгер (не закрывает FILE). */
void mylog_destroy(MyLog_Logger *log);

/** Устанавливает минимальный уровень логирования. */
void mylog_set_level(MyLog_Logger *log, MyLog_Level level);

/** Записывает сообщение с указанным уровнем. */
void mylog_write(MyLog_Logger *log, MyLog_Level level,
                 const char *fmt, ...)
    __attribute__((format(printf, 3, 4)));

/* Удобные макросы */
#define MYLOG_DEBUG(log, ...) \\
    mylog_write((log), MYLOG_DEBUG, __VA_ARGS__)
#define MYLOG_INFO(log, ...) \\
    mylog_write((log), MYLOG_INFO, __VA_ARGS__)
#define MYLOG_WARN(log, ...) \\
    mylog_write((log), MYLOG_WARN, __VA_ARGS__)
#define MYLOG_ERROR(log, ...) \\
    mylog_write((log), MYLOG_ERROR, __VA_ARGS__)

#endif /* MYLOG_H */`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
