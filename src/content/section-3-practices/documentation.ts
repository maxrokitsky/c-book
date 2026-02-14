import type { Chapter } from '../types'

export default {
  id: 'documentation',
  title: 'Документирование',
  description: 'Doxygen, комментарии и генерация документации из кода',
  blocks: [
    {
      type: 'prose',
      markdown: `# Документирование

Хорошая документация — ключевой фактор успешного проекта. В мире C стандартом де-факто для генерации документации из исходного кода является **Doxygen**. Он извлекает специально оформленные комментарии и создаёт HTML, PDF или man-страницы.

В этой главе мы рассмотрим стиль комментирования, настройку Doxygen и лучшие практики документирования API.`,
    },
    {
      type: 'prose',
      markdown: `## Стили комментариев Doxygen

Doxygen поддерживает несколько стилей комментариев. Два наиболее популярных:

- **Javadoc-стиль**: \`/** ... */\`
- **Qt-стиль**: \`/*! ... */\`

Мы будем использовать Javadoc-стиль как наиболее распространённый.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/**
 * @file buffer.h
 * @brief Модуль для работы с динамическими буферами.
 * @author Иван Петров
 * @version 1.0
 * @date 2024-01-15
 */

#ifndef BUFFER_H
#define BUFFER_H

#include <stddef.h>

/**
 * @brief Непрозрачный тип динамического буфера.
 *
 * Буфер автоматически увеличивается при необходимости.
 * Для создания используйте buffer_create().
 */
typedef struct Buffer Buffer;

/**
 * @brief Создаёт новый буфер с заданной начальной ёмкостью.
 *
 * @param[in] capacity Начальная ёмкость в байтах. Должна быть > 0.
 * @return Указатель на новый буфер или NULL при ошибке выделения памяти.
 *
 * @note Вызывающий обязан освободить буфер через buffer_destroy().
 *
 * @code
 * Buffer *buf = buffer_create(1024);
 * if (!buf) {
 *     perror("buffer_create");
 *     return -1;
 * }
 * // ... использование ...
 * buffer_destroy(buf);
 * @endcode
 */
Buffer *buffer_create(size_t capacity);

/**
 * @brief Добавляет данные в конец буфера.
 *
 * @param[in,out] buf  Указатель на буфер (не NULL).
 * @param[in]     data Указатель на данные для добавления.
 * @param[in]     len  Количество байт для добавления.
 * @return 0 при успехе, -1 при ошибке.
 *
 * @warning Если buf == NULL, поведение не определено.
 */
int buffer_append(Buffer *buf, const char *data, size_t len);

/**
 * @brief Уничтожает буфер и освобождает память.
 *
 * Безопасно принимает NULL (ничего не делает).
 *
 * @param[in] buf Указатель на буфер или NULL.
 */
void buffer_destroy(Buffer *buf);

#endif /* BUFFER_H */`,
      filename: 'include/buffer.h',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Теги @param',
      markdown: 'Используйте модификаторы направления: `@param[in]` для входных параметров, `@param[out]` для выходных, `@param[in,out]` для изменяемых. Это помогает пользователю API мгновенно понять контракт функции.',
    },
    {
      type: 'prose',
      markdown: `## Настройка Doxygen

Doxygen настраивается через файл \`Doxyfile\`. Создать шаблон можно командой \`doxygen -g\`:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Генерация конфигурации по умолчанию
doxygen -g

# Основные параметры для настройки в Doxyfile:
# PROJECT_NAME         = "MyLib"
# OUTPUT_DIRECTORY     = docs/api
# INPUT                = include/ src/
# RECURSIVE            = YES
# EXTRACT_ALL          = NO
# EXTRACT_STATIC       = YES
# OPTIMIZE_OUTPUT_FOR_C = YES
# GENERATE_LATEX       = NO

# Генерация документации
doxygen Doxyfile`,
      filename: 'generate_docs.sh',
    },
    {
      type: 'prose',
      markdown: `## Документирование модулей и групп

Doxygen позволяет объединять связанные функции в группы с помощью \`@defgroup\` и \`@ingroup\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/**
 * @defgroup io Модуль ввода/вывода
 * @brief Функции для чтения и записи данных.
 * @{
 */

/**
 * @brief Читает содержимое файла целиком в память.
 *
 * @param[in]  path   Путь к файлу.
 * @param[out] size   Размер прочитанных данных (может быть NULL).
 * @return Указатель на данные или NULL при ошибке.
 *         Вызывающий обязан вызвать free().
 */
char *io_read_file(const char *path, size_t *size);

/**
 * @brief Записывает данные в файл.
 *
 * @param[in] path  Путь к файлу.
 * @param[in] data  Данные для записи.
 * @param[in] size  Количество байт.
 * @return 0 при успехе, -1 при ошибке.
 */
int io_write_file(const char *path, const char *data, size_t size);

/** @} */ /* конец группы io */`,
      filename: 'include/io.h',
    },
    {
      type: 'prose',
      markdown: `## Лучшие практики

1. **Документируйте публичный API** — каждая функция в заголовочном файле должна иметь Doxygen-комментарий.
2. **Описывайте контракты** — предусловия, постусловия, владение памятью, потокобезопасность.
3. **Используйте \`@note\`, \`@warning\`, \`@deprecated\`** — для важной информации, выделяемой в документации.
4. **Давайте примеры** — блоки \`@code ... @endcode\` бесценны для пользователей.
5. **Не дублируйте очевидное** — \`@brief Уничтожает буфер\` для \`buffer_destroy()\` достаточно; не нужно писать три абзаца.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'README и высокоуровневая документация',
      markdown: 'Doxygen хорош для справочника по API, но проекту также нужны: **README** с обзором и быстрым стартом, **CHANGELOG** с историей изменений, **CONTRIBUTING** с правилами контрибьюции. Для руководств и туториалов можно использовать Markdown-файлы с подключением в Doxygen через `@mainpage` и `@page`.',
    },
    {
      type: 'quiz',
      question: 'Какой тег Doxygen указывает направление параметра функции?',
      options: [
        '@return',
        '@param[in], @param[out], @param[in,out]',
        '@brief',
        '@see',
      ],
      correctIndex: 1,
      explanation:
        'Модификаторы [in], [out] и [in,out] в теге @param указывают направление передачи данных: входной параметр, выходной или двунаправленный. Это помогает пользователям API быстро понять контракт функции.',
    },
    {
      type: 'exercise',
      title: 'Документируйте API хеш-таблицы',
      description:
        'Напишите Doxygen-комментарии для следующих функций хеш-таблицы: ht_create(), ht_set(), ht_get(), ht_delete(), ht_destroy(). Укажите параметры, возвращаемые значения, предусловия и владение памятью.',
      hints: [
        'Укажите, кто владеет ключами и значениями — таблица или вызывающий',
        'Документируйте поведение при дублировании ключа в ht_set()',
        'Не забудьте @brief для каждой функции',
      ],
      solution: `/**
 * @brief Создаёт новую хеш-таблицу.
 *
 * @param[in] capacity Начальное количество слотов.
 * @return Указатель на таблицу или NULL при ошибке.
 * @note Вызывающий обязан вызвать ht_destroy() для освобождения.
 */
HashTable *ht_create(size_t capacity);

/**
 * @brief Устанавливает значение по ключу.
 *
 * Если ключ уже существует, значение перезаписывается.
 * Таблица копирует ключ, но НЕ копирует значение — вызывающий
 * отвечает за время жизни значения.
 *
 * @param[in,out] ht    Указатель на таблицу (не NULL).
 * @param[in]     key   Ключ (строка, не NULL).
 * @param[in]     value Значение (может быть NULL).
 * @return 0 при успехе, -1 при ошибке.
 */
int ht_set(HashTable *ht, const char *key, void *value);

/**
 * @brief Возвращает значение по ключу.
 *
 * @param[in] ht  Указатель на таблицу (не NULL).
 * @param[in] key Ключ для поиска (не NULL).
 * @return Указатель на значение или NULL, если ключ не найден.
 */
void *ht_get(const HashTable *ht, const char *key);

/**
 * @brief Удаляет запись по ключу.
 *
 * @param[in,out] ht  Указатель на таблицу (не NULL).
 * @param[in]     key Ключ для удаления (не NULL).
 * @return 0 если ключ удалён, -1 если ключ не найден.
 * @warning Не освобождает значение — вызывающий обязан сделать это сам.
 */
int ht_delete(HashTable *ht, const char *key);

/**
 * @brief Уничтожает хеш-таблицу и освобождает внутренние ресурсы.
 *
 * Безопасно принимает NULL.
 * @warning Не освобождает хранимые значения.
 *
 * @param[in] ht Указатель на таблицу или NULL.
 */
void ht_destroy(HashTable *ht);`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
