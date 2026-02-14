import type { Chapter } from '../types'

export default {
  id: 'multifile',
  title: 'Многофайловые программы',
  description: 'Заголовочные файлы, include guards, линковка',
  blocks: [
    {
      type: 'prose',
      markdown: `# Многофайловые программы

Реальные программы на C всегда состоят из нескольких файлов. Разделение кода на модули улучшает организацию, ускоряет компиляцию (перекомпилируется только изменённый файл) и упрощает командную работу. В этой главе мы разберём, как правильно организовать многофайловый проект.`,
    },
    {
      type: 'prose',
      markdown: `## Файлы .c и .h

В C принято разделение на:
- **Заголовочные файлы** (\`.h\`) — содержат **объявления**: прототипы функций, определения типов, макросы, внешние переменные (\`extern\`)
- **Файлы реализации** (\`.c\`) — содержат **определения**: тела функций, глобальные переменные

Каждый модуль обычно состоит из пары файлов: \`module.h\` и \`module.c\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* vec2.h — заголовочный файл модуля двумерных векторов */
#ifndef VEC2_H
#define VEC2_H

typedef struct {
    double x;
    double y;
} Vec2;

/* Объявления (прототипы) функций */
Vec2 vec2_create(double x, double y);
Vec2 vec2_add(Vec2 a, Vec2 b);
Vec2 vec2_scale(Vec2 v, double factor);
double vec2_length(Vec2 v);
void vec2_print(Vec2 v);

#endif /* VEC2_H */`,
      filename: 'vec2.h',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* vec2.c — реализация модуля двумерных векторов */
#include "vec2.h"
#include <stdio.h>
#include <math.h>

Vec2 vec2_create(double x, double y) {
    return (Vec2){.x = x, .y = y};
}

Vec2 vec2_add(Vec2 a, Vec2 b) {
    return (Vec2){.x = a.x + b.x, .y = a.y + b.y};
}

Vec2 vec2_scale(Vec2 v, double factor) {
    return (Vec2){.x = v.x * factor, .y = v.y * factor};
}

double vec2_length(Vec2 v) {
    return sqrt(v.x * v.x + v.y * v.y);
}

void vec2_print(Vec2 v) {
    printf("(%.2f, %.2f)", v.x, v.y);
}`,
      filename: 'vec2.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* main.c — использует модуль vec2 */
#include <stdio.h>
#include "vec2.h"

int main(void) {
    Vec2 a = vec2_create(3.0, 4.0);
    Vec2 b = vec2_create(1.0, 2.0);

    Vec2 sum = vec2_add(a, b);
    printf("a + b = ");
    vec2_print(sum);
    printf("\\n");

    printf("Длина a: %.2f\\n", vec2_length(a));

    Vec2 scaled = vec2_scale(a, 2.0);
    printf("a * 2 = ");
    vec2_print(scaled);
    printf("\\n");

    return 0;
}`,
      filename: 'main.c',
    },
    {
      type: 'output',
      content: `a + b = (4.00, 6.00)
Длина a: 5.00
a * 2 = (6.00, 8.00)`,
      prompt: '$ gcc -c vec2.c -o vec2.o && gcc -c main.c -o main.o && gcc vec2.o main.o -lm -o program && ./program',
    },
    {
      type: 'prose',
      markdown: `## Include guards

Заголовочный файл может быть включён несколько раз (напрямую и через другие заголовки). Без защиты это приведёт к ошибке повторного определения. Решение — **include guards** (стражи включения).`,
    },
    {
      type: 'codeDiff',
      before: `/* utils.h — без защиты */
typedef struct { int x; int y; } Point;
void print_point(Point p);`,
      after: `/* utils.h — с include guard */
#ifndef UTILS_H
#define UTILS_H

typedef struct { int x; int y; } Point;
void print_point(Point p);

#endif /* UTILS_H */`,
      language: 'c',
      description: 'Include guard предотвращает повторное включение заголовочного файла. При первом #include определяется UTILS_H и содержимое включается. При повторном — #ifndef видит, что UTILS_H уже определён, и пропускает содержимое.',
    },
    {
      type: 'note',
      variant: 'tip',
      title: '#pragma once',
      markdown: `Многие компиляторы поддерживают \`#pragma once\` как альтернативу include guards:

\`\`\`c
#pragma once
/* содержимое заголовка */
\`\`\`

Преимущества: короче, не нужно придумывать имя макроса, невозможен конфликт имён. Недостаток: формально не стандартизирован (хотя поддерживается GCC, Clang, MSVC и практически всеми компиляторами).`,
    },
    {
      type: 'prose',
      markdown: `## Процесс компиляции и линковки

Многофайловая программа проходит несколько этапов:

1. **Препроцессинг** — раскрытие \`#include\`, \`#define\`, условной компиляции
2. **Компиляция** — каждый \`.c\` файл компилируется в объектный файл (\`.o\`)
3. **Линковка** — объектные файлы объединяются в исполняемый файл`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Поэтапная компиляция
gcc -c vec2.c -o vec2.o      # компиляция vec2.c → vec2.o
gcc -c main.c -o main.o      # компиляция main.c → main.o
gcc vec2.o main.o -lm -o app # линковка → исполняемый файл

# Или одной командой (gcc сделает всё автоматически)
gcc vec2.c main.c -lm -o app

# Посмотреть символы в объектном файле
nm vec2.o`,
      filename: 'compile_steps.sh',
    },
    {
      type: 'prose',
      markdown: `## extern и глобальные переменные

Если глобальная переменная определена в одном файле, а используется в другом, нужно ключевое слово \`extern\`. Оно объявляет переменную без её создания — говорит компилятору «эта переменная существует где-то в другом файле».`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* config.h */
#ifndef CONFIG_H
#define CONFIG_H

/* Объявление (declaration) — переменная определена в config.c */
extern int screen_width;
extern int screen_height;
extern const char *app_name;

void config_init(void);
void config_print(void);

#endif /* CONFIG_H */`,
      filename: 'config.h',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* config.c */
#include "config.h"
#include <stdio.h>

/* Определение (definition) — здесь выделяется память */
int screen_width = 800;
int screen_height = 600;
const char *app_name = "MyApp";

void config_init(void) {
    screen_width = 1920;
    screen_height = 1080;
}

void config_print(void) {
    printf("%s: %dx%d\\n", app_name, screen_width, screen_height);
}`,
      filename: 'config.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Избегайте глобальных переменных',
      markdown: `Глобальные переменные создают неявные зависимости между модулями, затрудняют тестирование и делают код непредсказуемым. Предпочитайте:
- Передачу данных через параметры функций
- Структуры-контексты (\`struct Config *ctx\`)
- Функции-геттеры и сеттеры для доступа к модульным данным

Если глобальная переменная нужна только внутри одного файла, объявите её как \`static\`.`,
    },
    {
      type: 'prose',
      markdown: `## static на уровне файла

Ключевое слово \`static\` для функций и переменных на уровне файла ограничивает их видимость **текущей единицей трансляции** (файлом .c). Это основной инструмент инкапсуляции в C.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* logger.c — модуль логирования */
#include "logger.h"
#include <stdio.h>
#include <time.h>

/* Приватная переменная — видна только внутри logger.c */
static FILE *log_file = NULL;
static int log_count = 0;

/* Приватная функция — вспомогательная, не для внешнего использования */
static const char *get_timestamp(void) {
    static char buf[32];
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    strftime(buf, sizeof buf, "%Y-%m-%d %H:%M:%S", t);
    return buf;
}

/* Публичные функции — объявлены в logger.h */
int logger_init(const char *filename) {
    log_file = fopen(filename, "a");
    if (!log_file) return -1;
    log_count = 0;
    return 0;
}

void logger_write(const char *message) {
    if (!log_file) return;
    fprintf(log_file, "[%s] %s\\n", get_timestamp(), message);
    log_count++;
}

void logger_close(void) {
    if (log_file) {
        fprintf(log_file, "--- %d записей ---\\n", log_count);
        fclose(log_file);
        log_file = NULL;
    }
}`,
      filename: 'logger.c',
    },
    {
      type: 'quiz',
      question: 'Что произойдёт, если заголовочный файл без include guard будет включён дважды и содержит typedef?',
      options: [
        'Компилятор автоматически проигнорирует повторное включение',
        'Ошибка линковки (duplicate symbol)',
        'Ошибка компиляции (повторное определение типа)',
        'Ничего — typedef можно определять сколько угодно раз',
      ],
      correctIndex: 2,
      explanation: 'Повторное определение типа через typedef с разными телами — ошибка компиляции. Даже с одинаковыми телами в стандартах до C11 это было ошибкой. Include guard (#ifndef/#define/#endif) решает эту проблему, предотвращая повторное включение.',
    },
    {
      type: 'exercise',
      title: 'Модуль динамического массива',
      description: 'Создайте модуль `dynarray` из двух файлов. В `dynarray.h` объявите тип `DynArray` (структура с полями `int *data`, `int size`, `int capacity`) и функции: `dynarray_create`, `dynarray_push`, `dynarray_get`, `dynarray_size`, `dynarray_destroy`. В `dynarray.c` реализуйте все функции. Массив должен автоматически расти при добавлении элементов.',
      hints: [
        'Не забудьте include guard в .h файле',
        'dynarray_create может возвращать DynArray или принимать DynArray *',
        'При росте удваивайте capacity и используйте realloc',
        'dynarray_destroy должна освобождать data и обнулять поля',
      ],
      solution: `/* dynarray.h */
#ifndef DYNARRAY_H
#define DYNARRAY_H

typedef struct {
    int *data;
    int size;
    int capacity;
} DynArray;

DynArray dynarray_create(int initial_capacity);
int  dynarray_push(DynArray *arr, int value);
int  dynarray_get(const DynArray *arr, int index);
int  dynarray_size(const DynArray *arr);
void dynarray_destroy(DynArray *arr);

#endif /* DYNARRAY_H */

/* dynarray.c */
#include "dynarray.h"
#include <stdlib.h>

DynArray dynarray_create(int initial_capacity) {
    DynArray arr;
    arr.data = malloc(initial_capacity * sizeof *arr.data);
    arr.size = 0;
    arr.capacity = arr.data ? initial_capacity : 0;
    return arr;
}

int dynarray_push(DynArray *arr, int value) {
    if (arr->size == arr->capacity) {
        int new_cap = arr->capacity ? arr->capacity * 2 : 4;
        int *tmp = realloc(arr->data, new_cap * sizeof *tmp);
        if (!tmp) return -1;
        arr->data = tmp;
        arr->capacity = new_cap;
    }
    arr->data[arr->size++] = value;
    return 0;
}

int dynarray_get(const DynArray *arr, int index) {
    return arr->data[index];
}

int dynarray_size(const DynArray *arr) {
    return arr->size;
}

void dynarray_destroy(DynArray *arr) {
    free(arr->data);
    arr->data = NULL;
    arr->size = 0;
    arr->capacity = 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
