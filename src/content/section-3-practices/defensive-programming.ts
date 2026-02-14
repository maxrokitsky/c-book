import type { Chapter } from '../types'

export default {
  id: 'defensive-programming',
  title: 'Защитное программирование',
  description: 'Предусловия, проверка ошибок, обработка сбоев и безопасный код на C',
  blocks: [
    {
      type: 'prose',
      markdown: `# Защитное программирование

Язык C доверяет программисту, не выполняя почти никаких проверок во время выполнения. Это делает **защитное программирование** (defensive programming) не просто хорошей практикой, а необходимостью.

Защитное программирование — это стиль написания кода, при котором вы предполагаете, что всё может пойти не так, и заранее защищаетесь от ошибок.`,
    },
    {
      type: 'prose',
      markdown: `## Проверка предусловий

Каждая функция должна проверять свои входные данные. Используйте \`assert()\` для инвариантов разработки и явные проверки для ошибок времени выполнения:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <assert.h>
#include <stddef.h>
#include <errno.h>

/**
 * Копирует строку в буфер с ограничением размера.
 * @return 0 при успехе, -1 при ошибке (errno устанавливается).
 */
int safe_copy(char *dest, size_t dest_size, const char *src)
{
    /* Предусловия (ошибка программиста — assert) */
    assert(dest != NULL);
    assert(src != NULL);
    assert(dest_size > 0);

    size_t src_len = strlen(src);

    /* Проверка времени выполнения (внешние данные — код ошибки) */
    if (src_len >= dest_size) {
        errno = ERANGE;
        return -1;
    }

    memcpy(dest, src, src_len + 1);
    return 0;
}`,
      filename: 'safe_copy.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'assert vs проверка ошибок',
      markdown: `**assert()** — для ошибок программиста (нарушение контракта). Отключается в релизе через \`-DNDEBUG\`.

**Явная проверка с кодом ошибки** — для ошибок времени выполнения (файл не найден, нет памяти, некорректный ввод пользователя). Работает всегда.

Правило: если ошибка может произойти в корректно написанной программе — это проверка времени выполнения. Если ошибка означает баг — это assert.`,
    },
    {
      type: 'prose',
      markdown: `## Паттерны обработки ошибок в C

В C нет исключений, поэтому ошибки обрабатываются через возвращаемые значения. Вот основные паттерны:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Паттерн 1: возврат кода ошибки */
int read_config(const char *path, Config *out)
{
    FILE *f = fopen(path, "r");
    if (!f) return -1;

    /* ... чтение ... */

    fclose(f);
    return 0;
}

/* Паттерн 2: возврат NULL + errno */
Buffer *buffer_create(size_t capacity)
{
    Buffer *buf = malloc(sizeof(*buf));
    if (!buf) return NULL;   /* errno уже установлен malloc */

    buf->data = malloc(capacity);
    if (!buf->data) {
        free(buf);
        return NULL;
    }

    buf->size = 0;
    buf->capacity = capacity;
    return buf;
}

/* Паттерн 3: выходной параметр для ошибки */
typedef enum {
    ERR_OK = 0,
    ERR_NULL_ARG,
    ERR_OUT_OF_MEMORY,
    ERR_INVALID_FORMAT,
} ErrorCode;

const char *error_to_string(ErrorCode err);

Data *parse_data(const char *input, ErrorCode *err)
{
    if (!input) {
        if (err) *err = ERR_NULL_ARG;
        return NULL;
    }
    /* ... */
}`,
      filename: 'error_patterns.c',
    },
    {
      type: 'prose',
      markdown: `## Паттерн «goto cleanup»

В C часто используется \`goto\` для централизованной очистки ресурсов при ошибке. Это одно из немногих оправданных применений \`goto\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `int process_file(const char *input_path, const char *output_path)
{
    int result = -1;
    FILE *in = NULL;
    FILE *out = NULL;
    char *buffer = NULL;

    in = fopen(input_path, "r");
    if (!in) goto cleanup;

    out = fopen(output_path, "w");
    if (!out) goto cleanup;

    buffer = malloc(4096);
    if (!buffer) goto cleanup;

    /* Основная логика */
    size_t n;
    while ((n = fread(buffer, 1, 4096, in)) > 0) {
        if (fwrite(buffer, 1, n, out) != n) goto cleanup;
    }

    if (ferror(in)) goto cleanup;

    result = 0;  /* Успех */

cleanup:
    free(buffer);
    if (out) fclose(out);
    if (in) fclose(in);
    return result;
}`,
      filename: 'goto_cleanup.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Защита от переполнения буфера',
      markdown: `Переполнение буфера — одна из самых опасных уязвимостей в C. Правила:

- **Никогда** не используйте \`gets()\` (удалена в C11). Используйте \`fgets()\`.
- Предпочитайте \`snprintf()\` вместо \`sprintf()\`.
- Всегда проверяйте длину входных данных перед копированием.
- Используйте \`strncpy()\` с осторожностью — она не гарантирует нуль-терминатор.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

void unsafe_example(const char *user_input)
{
    char buf[64];
    /* ОПАСНО: переполнение буфера! */
    strcpy(buf, user_input);
}

void safe_example(const char *user_input)
{
    char buf[64];
    /* Безопасно: ограничиваем длину */
    snprintf(buf, sizeof(buf), "%s", user_input);
}`,
      filename: 'buffer_safety.c',
    },
    {
      type: 'quiz',
      question: 'Когда следует использовать assert(), а когда — явную проверку с кодом ошибки?',
      options: [
        'assert() — всегда, код ошибки — никогда',
        'assert() — для ошибок программиста, код ошибки — для ошибок времени выполнения',
        'assert() — в тестах, код ошибки — в основном коде',
        'Они взаимозаменяемы',
      ],
      correctIndex: 1,
      explanation:
        'assert() предназначен для проверки инвариантов и предусловий, нарушение которых означает баг в коде (например, NULL-указатель, который не должен быть NULL по контракту). Явные проверки с кодами ошибок — для ситуаций, которые могут произойти при нормальной работе (файл не найден, нет памяти, невалидный ввод).',
    },
    {
      type: 'exercise',
      title: 'Реализуйте безопасную функцию чтения строки',
      description:
        'Напишите функцию safe_readline(), которая читает строку из stdin с ограничением максимальной длины. Функция должна корректно обрабатывать: слишком длинный ввод, EOF, ошибки ввода. Верните 0 при успехе, -1 при ошибке, 1 при EOF.',
      hints: [
        'Используйте fgets() для безопасного чтения',
        'Проверьте, поместилась ли строка целиком (ищите \\n)',
        'При слишком длинном вводе нужно «слить» остаток строки из буфера',
      ],
      solution: `#include <stdio.h>
#include <string.h>

int safe_readline(char *buf, size_t buf_size)
{
    if (!buf || buf_size == 0) return -1;

    if (!fgets(buf, (int)buf_size, stdin)) {
        if (feof(stdin)) return 1;  /* EOF */
        return -1;                   /* Ошибка */
    }

    /* Проверяем, поместилась ли строка */
    size_t len = strlen(buf);
    if (len > 0 && buf[len - 1] == '\\n') {
        buf[len - 1] = '\\0';  /* Убираем \\n */
        return 0;
    }

    /* Строка не поместилась — сливаем остаток */
    int c;
    while ((c = fgetc(stdin)) != '\\n' && c != EOF)
        ;
    /* Строка обрезана, но буфер корректен */
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
