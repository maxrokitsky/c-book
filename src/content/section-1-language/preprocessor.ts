import type { Chapter } from '../types'

export default {
  id: 'preprocessor',
  title: 'Препроцессор',
  description: '#define, #include, условная компиляция, макросы',
  blocks: [
    {
      type: 'prose',
      markdown: `# Препроцессор

Препроцессор C — это этап обработки исходного кода, который выполняется **до** компиляции. Он работает с текстом программы, выполняя подстановки, включение файлов и условную компиляцию. Все директивы препроцессора начинаются с символа \`#\`.`,
    },
    {
      type: 'prose',
      markdown: `## #include — подключение файлов

Директива \`#include\` вставляет содержимое указанного файла в текущий файл. Есть два варианта:

- \`#include <header.h>\` — ищет в системных каталогах (стандартная библиотека)
- \`#include "header.h"\` — сначала ищет в каталоге текущего файла, затем в системных

Препроцессор буквально заменяет строку \`#include\` на содержимое файла.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Системные заголовки */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Пользовательский заголовок */
#include "my_math.h"

int main(void) {
    printf("PI = %.6f\\n", PI);          /* из my_math.h */
    printf("max(3,7) = %d\\n", max(3, 7)); /* из my_math.h */
    return 0;
}`,
      filename: 'include_demo.c',
    },
    {
      type: 'prose',
      markdown: `## #define — макроопределения

Директива \`#define\` задаёт макрос — правило текстовой подстановки. Макросы бывают двух видов: **объектоподобные** (константы) и **функциоподобные** (с параметрами).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Объектоподобные макросы (константы) */
#define PI 3.14159265358979
#define MAX_BUFFER_SIZE 1024
#define VERSION_STRING "1.2.3"

/* Функциоподобные макросы */
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define SQUARE(x) ((x) * (x))
#define SWAP(a, b, type) do { type _tmp = (a); (a) = (b); (b) = _tmp; } while(0)

/* Многострочный макрос */
#define PRINT_VAR(var) \\
    printf(#var " = %d\\n", (var))

int main(void) {
    printf("PI = %.4f\\n", PI);
    printf("MAX(3, 7) = %d\\n", MAX(3, 7));
    printf("SQUARE(5) = %d\\n", SQUARE(5));

    int x = 10, y = 20;
    PRINT_VAR(x);
    PRINT_VAR(y);

    SWAP(x, y, int);
    printf("После SWAP: x = %d, y = %d\\n", x, y);

    return 0;
}`,
      filename: 'define_demo.c',
    },
    {
      type: 'output',
      content: `PI = 3.1416
MAX(3, 7) = 7
SQUARE(5) = 25
x = 10
y = 20
После SWAP: x = 20, y = 10`,
      prompt: '$ gcc define_demo.c -o define_demo && ./define_demo',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Ловушки макросов',
      markdown: `Макросы выполняют **текстовую подстановку**, поэтому легко допустить ошибки:

\`\`\`c
#define SQUARE(x) x * x
SQUARE(2 + 3)  /* раскроется в: 2 + 3 * 2 + 3 = 11, а не 25! */
\`\`\`

**Правила безопасности:**
1. Всегда оборачивайте параметры в скобки: \`((x) * (x))\`
2. Всегда оборачивайте весь макрос в скобки: \`((a) > (b) ? (a) : (b))\`
3. Макрос-оператор оборачивайте в \`do { ... } while(0)\`
4. Аргументы с побочными эффектами опасны: \`MAX(i++, j++)\` — \`i\` или \`j\` может инкрементироваться дважды`,
    },
    {
      type: 'prose',
      markdown: `## Операторы # и ## в макросах

Препроцессор предоставляет два специальных оператора:
- \`#\` (стрингификация) — превращает параметр в строковый литерал
- \`##\` (конкатенация) — склеивает два токена в один`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* # — стрингификация (превращает аргумент в строку) */
#define STRINGIFY(x) #x
#define ASSERT(expr) \\
    if (!(expr)) { \\
        fprintf(stderr, "Assertion failed: %s, file %s, line %d\\n", \\
                #expr, __FILE__, __LINE__); \\
    }

/* ## — конкатенация токенов */
#define MAKE_FUNC(name) int get_##name(void) { return name; }
#define DECLARE_PAIR(type) \\
    typedef struct { type first; type second; } type##_pair

int width = 800;
int height = 600;

MAKE_FUNC(width)    /* создаст: int get_width(void) { return width; } */
MAKE_FUNC(height)   /* создаст: int get_height(void) { return height; } */

DECLARE_PAIR(int);   /* создаст: typedef struct { int first; int second; } int_pair */

int main(void) {
    printf("String: %s\\n", STRINGIFY(Hello World));
    printf("Width:  %d\\n", get_width());
    printf("Height: %d\\n", get_height());

    int_pair p = {10, 20};
    printf("Pair: (%d, %d)\\n", p.first, p.second);

    ASSERT(1 == 1);    /* OK */
    ASSERT(1 == 2);    /* выведет сообщение об ошибке */

    return 0;
}`,
      filename: 'stringify_concat.c',
    },
    {
      type: 'output',
      content: `String: Hello World
Width:  800
Height: 600
Pair: (10, 20)
Assertion failed: 1 == 2, file stringify_concat.c, line 29`,
      prompt: '$ gcc stringify_concat.c -o stringify_concat && ./stringify_concat',
    },
    {
      type: 'prose',
      markdown: `## Условная компиляция

Директивы \`#if\`, \`#ifdef\`, \`#ifndef\`, \`#elif\`, \`#else\`, \`#endif\` позволяют включать или исключать части кода в зависимости от условий. Это используется для:
- Кроссплатформенного кода
- Отладочных сообщений
- Конфигурации сборки`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Отладочный вывод */
#define DEBUG 1

#if DEBUG
    #define LOG(msg) fprintf(stderr, "[DEBUG] %s\\n", msg)
#else
    #define LOG(msg) ((void)0)
#endif

/* Определение платформы */
#ifdef _WIN32
    #define OS_NAME "Windows"
#elif defined(__linux__)
    #define OS_NAME "Linux"
#elif defined(__APPLE__)
    #define OS_NAME "macOS"
#else
    #define OS_NAME "Unknown"
#endif

/* Проверка версии стандарта C */
#if __STDC_VERSION__ >= 201112L
    #define C_STANDARD "C11 или новее"
#elif __STDC_VERSION__ >= 199901L
    #define C_STANDARD "C99"
#else
    #define C_STANDARD "C89/C90"
#endif

int main(void) {
    LOG("Программа запущена");
    printf("ОС: %s\\n", OS_NAME);
    printf("Стандарт: %s\\n", C_STANDARD);

    #ifdef DEBUG
    printf("Отладочная сборка\\n");
    #endif

    return 0;
}`,
      filename: 'conditional_compile.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Предопределённые макросы',
      markdown: `Компилятор предоставляет полезные предопределённые макросы:
- \`__FILE__\` — имя текущего файла (строка)
- \`__LINE__\` — номер текущей строки (число)
- \`__func__\` — имя текущей функции (C99, строка)
- \`__DATE__\` — дата компиляции
- \`__TIME__\` — время компиляции
- \`__STDC_VERSION__\` — версия стандарта C (например, \`201710L\` для C17)`,
    },
    {
      type: 'prose',
      markdown: `## #undef и переопределение

Директива \`#undef\` удаляет определение макроса. После \`#undef\` макрос можно определить заново с другим значением.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

#define BUFFER_SIZE 256

void func1(void) {
    char buf[BUFFER_SIZE]; /* 256 */
    printf("func1: BUFFER_SIZE = %d\\n", BUFFER_SIZE);
    (void)buf;
}

#undef BUFFER_SIZE
#define BUFFER_SIZE 1024

void func2(void) {
    char buf[BUFFER_SIZE]; /* 1024 */
    printf("func2: BUFFER_SIZE = %d\\n", BUFFER_SIZE);
    (void)buf;
}

int main(void) {
    func1();
    func2();
    return 0;
}`,
      filename: 'undef_demo.c',
    },
    {
      type: 'quiz',
      question: 'Что выведет SQUARE(1 + 2) при определении #define SQUARE(x) x * x?',
      options: [
        '9',
        '5',
        '7',
        'Ошибка компиляции',
      ],
      correctIndex: 1,
      explanation: 'Макрос раскроется в 1 + 2 * 1 + 2. По приоритету операций: 1 + (2 * 1) + 2 = 5, а не 9. Правильное определение: #define SQUARE(x) ((x) * (x)), тогда получится ((1 + 2) * (1 + 2)) = 9.',
    },
    {
      type: 'exercise',
      title: 'Отладочный макрос с уровнями',
      description: 'Создайте систему отладочных макросов с уровнями логирования. Определите макрос `LOG_LEVEL` (0=выкл, 1=ошибки, 2=предупреждения, 3=всё). Создайте макросы `LOG_ERROR(fmt, ...)`, `LOG_WARN(fmt, ...)`, `LOG_INFO(fmt, ...)`, которые печатают сообщение с указанием файла и строки, только если уровень достаточный. Используйте `__VA_ARGS__` для переменного числа аргументов.',
      hints: [
        'Используйте #if LOG_LEVEL >= N для условного определения макросов',
        'Для пустого макроса используйте ((void)0)',
        '__VA_ARGS__ передаёт все аргументы после fmt',
        'fprintf(stderr, "[ERROR] %s:%d: " fmt "\\n", __FILE__, __LINE__, __VA_ARGS__)',
      ],
      solution: `#include <stdio.h>

#define LOG_LEVEL 3

#if LOG_LEVEL >= 1
    #define LOG_ERROR(fmt, ...) \\
        fprintf(stderr, "[ERROR] %s:%d: " fmt "\\n", \\
                __FILE__, __LINE__, __VA_ARGS__)
#else
    #define LOG_ERROR(fmt, ...) ((void)0)
#endif

#if LOG_LEVEL >= 2
    #define LOG_WARN(fmt, ...) \\
        fprintf(stderr, "[WARN]  %s:%d: " fmt "\\n", \\
                __FILE__, __LINE__, __VA_ARGS__)
#else
    #define LOG_WARN(fmt, ...) ((void)0)
#endif

#if LOG_LEVEL >= 3
    #define LOG_INFO(fmt, ...) \\
        fprintf(stderr, "[INFO]  %s:%d: " fmt "\\n", \\
                __FILE__, __LINE__, __VA_ARGS__)
#else
    #define LOG_INFO(fmt, ...) ((void)0)
#endif

int main(void) {
    LOG_INFO("Программа запущена, PID=%d", 1234);
    LOG_WARN("Память заполнена на %d%%", 85);
    LOG_ERROR("Файл '%s' не найден", "data.txt");
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
