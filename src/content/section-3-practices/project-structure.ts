import type { Chapter } from '../types'

export default {
  id: 'project-structure',
  title: 'Структура проекта',
  description: 'Организация файлов, каталогов и модулей в проектах на C',
  blocks: [
    {
      type: 'prose',
      markdown: `# Структура проекта на C

Хорошо организованная структура проекта — основа поддерживаемого и масштабируемого кода. В отличие от языков с встроенной модульной системой (Python, Go, Rust), в C организация кода целиком лежит на плечах программиста.

В этой главе мы рассмотрим типичные схемы организации проектов на C — от простых утилит до крупных библиотек.`,
    },
    {
      type: 'prose',
      markdown: `## Типичная структура каталогов

Большинство проектов на C придерживаются похожей конвенции:

\`\`\`
myproject/
├── src/           # Исходные файлы (.c)
├── include/       # Публичные заголовочные файлы (.h)
├── tests/         # Тесты
├── docs/          # Документация
├── build/         # Каталог сборки (не коммитится)
├── lib/           # Сторонние библиотеки (vendor)
├── Makefile       # или CMakeLists.txt
├── README.md
└── LICENSE
\`\`\`

Для небольших проектов допустимо хранить \`.c\` и \`.h\` файлы в одном каталоге, но по мере роста проекта разделение становится критичным.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* include/mylib.h — публичный API */
#ifndef MYLIB_H
#define MYLIB_H

#include <stddef.h>

typedef struct MyLib_Buffer MyLib_Buffer;

MyLib_Buffer *mylib_buffer_create(size_t capacity);
void mylib_buffer_destroy(MyLib_Buffer *buf);
int mylib_buffer_append(MyLib_Buffer *buf, const char *data, size_t len);
const char *mylib_buffer_data(const MyLib_Buffer *buf);
size_t mylib_buffer_size(const MyLib_Buffer *buf);

#endif /* MYLIB_H */`,
      filename: 'include/mylib.h',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* src/buffer.c — реализация */
#include "mylib.h"
#include <stdlib.h>
#include <string.h>

struct MyLib_Buffer {
    char *data;
    size_t size;
    size_t capacity;
};

MyLib_Buffer *mylib_buffer_create(size_t capacity)
{
    MyLib_Buffer *buf = malloc(sizeof(*buf));
    if (!buf) return NULL;

    buf->data = malloc(capacity);
    if (!buf->data) {
        free(buf);
        return NULL;
    }

    buf->size = 0;
    buf->capacity = capacity;
    return buf;
}

void mylib_buffer_destroy(MyLib_Buffer *buf)
{
    if (buf) {
        free(buf->data);
        free(buf);
    }
}`,
      filename: 'src/buffer.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Непрозрачные (opaque) типы',
      markdown: 'Обратите внимание: в заголовочном файле объявлен только `typedef struct MyLib_Buffer MyLib_Buffer` без определения полей. Это **непрозрачный тип** (opaque type) — пользователь библиотеки не может обращаться к полям структуры напрямую, а только через функции API. Это обеспечивает инкапсуляцию и позволяет менять внутреннее устройство без изменения API.',
    },
    {
      type: 'prose',
      markdown: `## Разделение заголовочных файлов

В крупных проектах принято разделять заголовочные файлы на **публичные** и **внутренние**:

- \`include/\` — публичные заголовки, которые устанавливаются вместе с библиотекой
- \`src/\` — внутренние заголовки, используемые только при сборке

Это позволяет чётко разграничить API и детали реализации.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* src/internal.h — внутренний заголовок */
#ifndef MYLIB_INTERNAL_H
#define MYLIB_INTERNAL_H

#include "mylib.h"

/* Внутренние функции, не входящие в публичный API */
int internal_validate_buffer(const MyLib_Buffer *buf);
void internal_compact_buffer(MyLib_Buffer *buf);

/* Внутренние макросы */
#define MYLIB_MIN_CAPACITY 64
#define MYLIB_GROWTH_FACTOR 2

#endif /* MYLIB_INTERNAL_H */`,
      filename: 'src/internal.h',
    },
    {
      type: 'prose',
      markdown: `## Модульная организация

В крупных проектах исходный код группируется по модулям. Каждый модуль — это логически связанная группа файлов:

\`\`\`
src/
├── buffer/
│   ├── buffer.c
│   ├── buffer_io.c
│   └── buffer_internal.h
├── parser/
│   ├── parser.c
│   ├── lexer.c
│   └── parser_internal.h
└── main.c
\`\`\`

Префиксы в именах функций заменяют пространства имён (которых в C нет): \`buffer_create()\`, \`parser_init()\` и т.д.`,
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Каталог build/',
      markdown: 'Никогда не коммитьте каталог `build/` в систему контроля версий. Добавьте его в `.gitignore`. Сборка должна быть воспроизводима из исходников, а артефакты — уникальны для каждой платформы и конфигурации.',
    },
    {
      type: 'quiz',
      question: 'Для чего используется непрозрачный (opaque) тип в заголовочном файле?',
      options: [
        'Для ускорения компиляции',
        'Для инкапсуляции — скрытия полей структуры от пользователя',
        'Для уменьшения размера бинарного файла',
        'Для совместимости с C++',
      ],
      correctIndex: 1,
      explanation:
        'Непрозрачный тип (forward declaration структуры без определения полей) скрывает детали реализации от пользователя библиотеки. Пользователь работает только с указателями и функциями API, что обеспечивает инкапсуляцию и стабильность ABI.',
    },
    {
      type: 'exercise',
      title: 'Спроектируйте структуру проекта',
      description:
        'Создайте структуру каталогов для библиотеки работы с JSON. Библиотека должна иметь публичный API для парсинга и сериализации, внутренние вспомогательные функции и набор тестов. Напишите публичный заголовочный файл с объявлениями основных функций.',
      hints: [
        'Используйте непрозрачный тип для JSON-значения',
        'Подумайте о префиксах функций, например json_',
        'Не забудьте include guard',
      ],
      solution: `/* include/json.h */
#ifndef JSON_H
#define JSON_H

#include <stddef.h>
#include <stdbool.h>

typedef struct Json_Value Json_Value;

typedef enum {
    JSON_NULL,
    JSON_BOOL,
    JSON_NUMBER,
    JSON_STRING,
    JSON_ARRAY,
    JSON_OBJECT
} Json_Type;

/* Парсинг */
Json_Value *json_parse(const char *input, size_t len);

/* Доступ к данным */
Json_Type json_type(const Json_Value *val);
bool json_get_bool(const Json_Value *val);
double json_get_number(const Json_Value *val);
const char *json_get_string(const Json_Value *val);

/* Сериализация */
char *json_stringify(const Json_Value *val);

/* Освобождение памяти */
void json_free(Json_Value *val);

#endif /* JSON_H */`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
