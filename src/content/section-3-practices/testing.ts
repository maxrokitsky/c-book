import type { Chapter } from '../types'

export default {
  id: 'testing',
  title: 'Тестирование',
  description: 'Модульное тестирование, фреймворки и практики тестирования кода на C',
  blocks: [
    {
      type: 'prose',
      markdown: `# Тестирование

Тестирование — неотъемлемая часть разработки надёжного ПО. Язык C не имеет встроенного фреймворка тестирования, но существует множество сторонних решений: от минимальных до полнофункциональных.

В этой главе мы рассмотрим основные подходы к тестированию кода на C: от простых assert-проверок до использования специализированных фреймворков.`,
    },
    {
      type: 'prose',
      markdown: `## Тестирование через assert

Самый простой способ тестирования — использование макроса \`assert\` из \`<assert.h>\`. Он прерывает программу, если условие ложно:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <assert.h>
#include <string.h>
#include "mylib.h"

void test_buffer_create(void)
{
    MyLib_Buffer *buf = mylib_buffer_create(64);
    assert(buf != NULL);
    assert(mylib_buffer_size(buf) == 0);
    mylib_buffer_destroy(buf);
}

void test_buffer_append(void)
{
    MyLib_Buffer *buf = mylib_buffer_create(64);
    int rc = mylib_buffer_append(buf, "hello", 5);
    assert(rc == 0);
    assert(mylib_buffer_size(buf) == 5);
    assert(memcmp(mylib_buffer_data(buf), "hello", 5) == 0);
    mylib_buffer_destroy(buf);
}

int main(void)
{
    test_buffer_create();
    test_buffer_append();
    printf("All tests passed!\\n");
    return 0;
}`,
      filename: 'tests/test_basic.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Ограничения assert',
      markdown: 'Макрос `assert` отключается при компиляции с флагом `-DNDEBUG`. Никогда не помещайте побочные эффекты (вызовы функций, изменение переменных) внутрь `assert` — в релизной сборке эти выражения просто исчезнут.',
    },
    {
      type: 'prose',
      markdown: `## Фреймворки тестирования

Для серьёзных проектов лучше использовать специализированные фреймворки. Наиболее популярные:

| Фреймворк | Особенности |
|-----------|-------------|
| **Unity** | Минимальный, один .c файл, идеален для embedded |
| **Check** | Поддержка fork-изоляции, таймаутов, XML-отчётов |
| **CMocka** | Моки, фикстуры, интеграция с CMake |
| **CTest** | Встроен в CMake, запуск любых тестовых программ |

Рассмотрим Unity как пример лёгкого фреймворка:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include "unity.h"
#include "mylib.h"

void setUp(void)
{
    /* Вызывается перед каждым тестом */
}

void tearDown(void)
{
    /* Вызывается после каждого теста */
}

void test_buffer_create_returns_non_null(void)
{
    MyLib_Buffer *buf = mylib_buffer_create(64);
    TEST_ASSERT_NOT_NULL(buf);
    mylib_buffer_destroy(buf);
}

void test_buffer_initial_size_is_zero(void)
{
    MyLib_Buffer *buf = mylib_buffer_create(64);
    TEST_ASSERT_EQUAL_UINT(0, mylib_buffer_size(buf));
    mylib_buffer_destroy(buf);
}

void test_buffer_append_increases_size(void)
{
    MyLib_Buffer *buf = mylib_buffer_create(64);
    mylib_buffer_append(buf, "data", 4);
    TEST_ASSERT_EQUAL_UINT(4, mylib_buffer_size(buf));
    mylib_buffer_destroy(buf);
}

int main(void)
{
    UNITY_BEGIN();
    RUN_TEST(test_buffer_create_returns_non_null);
    RUN_TEST(test_buffer_initial_size_is_zero);
    RUN_TEST(test_buffer_append_increases_size);
    return UNITY_END();
}`,
      filename: 'tests/test_buffer.c',
    },
    {
      type: 'output',
      content: `tests/test_buffer.c:18:test_buffer_create_returns_non_null:PASS
tests/test_buffer.c:25:test_buffer_initial_size_is_zero:PASS
tests/test_buffer.c:33:test_buffer_append_increases_size:PASS

-----------------------
3 Tests 0 Failures 0 Ignored
OK`,
      prompt: '$ ./build/test_buffer',
    },
    {
      type: 'prose',
      markdown: `## Покрытие кода (Code Coverage)

Покрытие кода показывает, какие строки исполнялись во время тестов. GCC поддерживает покрытие через флаги \`--coverage\` (или \`-fprofile-arcs -ftest-coverage\`):`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Компиляция с покрытием
gcc --coverage -o test_buffer tests/test_buffer.c src/buffer.c -Iinclude

# Запуск тестов (генерирует .gcda файлы)
./test_buffer

# Генерация отчёта
gcov src/buffer.c

# Красивый HTML-отчёт через lcov
lcov --capture --directory . --output-file coverage.info
genhtml coverage.info --output-directory coverage_report`,
      filename: 'coverage.sh',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Стремитесь к осмысленному покрытию',
      markdown: '100% покрытие строк не гарантирует отсутствие ошибок. Фокусируйтесь на покрытии **ветвлений** (branch coverage) и тестировании **граничных случаев**: пустые массивы, NULL-указатели, переполнение, нулевой размер.',
    },
    {
      type: 'quiz',
      question: 'Что произойдёт с вызовами assert(), если код скомпилирован с флагом -DNDEBUG?',
      options: [
        'Они будут работать как обычно',
        'Они превратятся в пустые выражения (будут полностью удалены)',
        'Они будут выводить предупреждения вместо прерывания',
        'Программа не скомпилируется',
      ],
      correctIndex: 1,
      explanation:
        'Когда определён макрос NDEBUG, assert() раскрывается в пустое выражение ((void)0). Все проверки полностью удаляются из кода, поэтому нельзя помещать побочные эффекты внутрь assert().',
    },
    {
      type: 'exercise',
      title: 'Напишите тесты для стека',
      description:
        'Дана функция стека: stack_create(), stack_push(), stack_pop(), stack_peek(), stack_is_empty(), stack_destroy(). Напишите набор тестов с использованием простых assert(), которые проверяют: создание, добавление элементов, извлечение в порядке LIFO, проверку пустоты и граничные случаи.',
      hints: [
        'Проверьте, что стек пуст после создания',
        'Проверьте порядок LIFO: push 1, push 2, pop должен вернуть 2',
        'Проверьте, что pop из пустого стека возвращает ошибку',
      ],
      solution: `#include <assert.h>
#include <stdio.h>
#include "stack.h"

void test_create_and_empty(void)
{
    Stack *s = stack_create(10);
    assert(s != NULL);
    assert(stack_is_empty(s));
    stack_destroy(s);
}

void test_push_pop_lifo(void)
{
    Stack *s = stack_create(10);
    stack_push(s, 10);
    stack_push(s, 20);
    stack_push(s, 30);

    assert(!stack_is_empty(s));
    assert(stack_pop(s) == 30);
    assert(stack_pop(s) == 20);
    assert(stack_pop(s) == 10);
    assert(stack_is_empty(s));
    stack_destroy(s);
}

void test_peek(void)
{
    Stack *s = stack_create(10);
    stack_push(s, 42);
    assert(stack_peek(s) == 42);
    assert(!stack_is_empty(s)); /* peek не извлекает */
    stack_destroy(s);
}

int main(void)
{
    test_create_and_empty();
    test_push_pop_lifo();
    test_peek();
    printf("All stack tests passed!\\n");
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
