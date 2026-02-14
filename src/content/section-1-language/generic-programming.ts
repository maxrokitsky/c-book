import type { Chapter } from '../types'

export default {
  id: 'generic-programming',
  title: 'Обобщённое программирование',
  description: '_Generic, макросы для обобщённого кода',
  blocks: [
    {
      type: 'prose',
      markdown:
        'C не имеет шаблонов (templates) или дженериков (generics) как C++ или Java. Однако язык предоставляет несколько механизмов для написания обобщённого кода:\n\n- **`void *`** — нетипизированный указатель, позволяющий работать с данными любого типа\n- **`_Generic`** (C11) — выбор выражения на основе типа аргумента\n- **Макросы** — генерация кода на этапе препроцессора\n\nКаждый подход имеет свои компромиссы между безопасностью типов, читаемостью и производительностью.',
    },
    {
      type: 'prose',
      markdown:
        '## Обобщённый код через `void *`\n\nКлассический подход — использование `void *` для указателей на данные произвольного типа. Именно так работают стандартные функции `qsort()` и `bsearch()`. Недостаток — потеря информации о типе, компилятор не может проверить корректность.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Обобщённый динамический массив через void* */
typedef struct {
    void *data;
    size_t elem_size;
    size_t size;
    size_t capacity;
} Vector;

Vector vec_create(size_t elem_size, size_t initial_cap) {
    Vector v = {
        .data = malloc(elem_size * initial_cap),
        .elem_size = elem_size,
        .size = 0,
        .capacity = initial_cap,
    };
    if (!v.data) { perror("malloc"); exit(1); }
    return v;
}

void vec_push(Vector *v, const void *elem) {
    if (v->size == v->capacity) {
        v->capacity *= 2;
        v->data = realloc(v->data, v->elem_size * v->capacity);
        if (!v->data) { perror("realloc"); exit(1); }
    }
    char *dst = (char *)v->data + v->size * v->elem_size;
    memcpy(dst, elem, v->elem_size);
    v->size++;
}

void *vec_get(const Vector *v, size_t index) {
    return (char *)v->data + index * v->elem_size;
}

void vec_destroy(Vector *v) {
    free(v->data);
    v->data = NULL;
    v->size = v->capacity = 0;
}

int main(void) {
    /* Vector для int */
    Vector vi = vec_create(sizeof(int), 4);
    for (int i = 0; i < 5; i++) {
        vec_push(&vi, &i);
    }
    for (size_t i = 0; i < vi.size; i++) {
        printf("%d ", *(int *)vec_get(&vi, i));
    }
    printf("\\n");
    vec_destroy(&vi);

    /* Vector для double */
    Vector vd = vec_create(sizeof(double), 4);
    double vals[] = {1.1, 2.2, 3.3};
    for (int i = 0; i < 3; i++) {
        vec_push(&vd, &vals[i]);
    }
    for (size_t i = 0; i < vd.size; i++) {
        printf("%.1f ", *(double *)vec_get(&vd, i));
    }
    printf("\\n");
    vec_destroy(&vd);

    return 0;
}`,
      filename: 'generic_void.c',
    },
    {
      type: 'output',
      content: '0 1 2 3 4 \n1.1 2.2 3.3 ',
      prompt: '$ gcc generic_void.c -o gv && ./gv',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Потеря типобезопасности',
      markdown:
        'При использовании `void *` компилятор не проверяет, что вы передаёте данные правильного типа. Вызов `vec_push(&vi, &some_double)` скомпилируется без ошибок, но приведёт к некорректным данным. Всегда тщательно документируйте, какой тип хранит контейнер.',
    },
    {
      type: 'prose',
      markdown:
        '## `_Generic` — диспетчеризация по типу (C11)\n\nВыражение `_Generic` выбирает одно из нескольких выражений в зависимости от типа первого аргумента. Оно вычисляется **на этапе компиляции** — никаких затрат в рантайме.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <math.h>

/* Типобезопасный макрос для вывода значений разных типов */
#define print_value(x) _Generic((x), \\
    int:          print_int,          \\
    double:       print_double,       \\
    const char *: print_string,       \\
    char *:       print_string        \\
)(x)

void print_int(int x)          { printf("int: %d\\n", x); }
void print_double(double x)    { printf("double: %f\\n", x); }
void print_string(const char *x) { printf("string: %s\\n", x); }

/* Обобщённый abs */
#define generic_abs(x) _Generic((x), \\
    int:    abs,                      \\
    long:   labs,                     \\
    float:  fabsf,                    \\
    double: fabs                      \\
)(x)

/* Имя типа как строка */
#define type_name(x) _Generic((x),   \\
    int:          "int",              \\
    double:       "double",           \\
    float:        "float",            \\
    char:         "char",             \\
    char *:       "char*",            \\
    const char *: "const char*",      \\
    default:      "unknown"           \\
)

int main(void) {
    print_value(42);
    print_value(3.14);
    print_value("hello");

    printf("|-5| = %d\\n", generic_abs(-5));
    printf("|-3.14| = %f\\n", generic_abs(-3.14));

    int x = 0;
    double y = 0.0;
    printf("x is %s\\n", type_name(x));
    printf("y is %s\\n", type_name(y));

    return 0;
}`,
      filename: 'generic_c11.c',
    },
    {
      type: 'output',
      content:
        'int: 42\ndouble: 3.140000\nstring: hello\n|-5| = 5\n|-3.14| = 3.140000\nx is int\ny is double',
      prompt: '$ gcc -std=c11 generic_c11.c -o gc11 -lm && ./gc11',
    },
    {
      type: 'prose',
      markdown:
        '## Обобщённые макросы для генерации типизированного кода\n\nМакросы препроцессора позволяют генерировать специализированные функции и структуры для конкретных типов. Это похоже на шаблоны C++, но работает на уровне текстовой подстановки.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Макрос, генерирующий типизированный динамический массив */
#define DEFINE_VECTOR(T, Name)                                    \\
    typedef struct {                                              \\
        T *data;                                                  \\
        size_t size;                                              \\
        size_t capacity;                                          \\
    } Name;                                                       \\
                                                                  \\
    static inline Name Name##_create(size_t cap) {                \\
        Name v = { .data = malloc(cap * sizeof(T)),               \\
                   .size = 0, .capacity = cap };                  \\
        return v;                                                 \\
    }                                                             \\
                                                                  \\
    static inline void Name##_push(Name *v, T val) {             \\
        if (v->size == v->capacity) {                             \\
            v->capacity *= 2;                                     \\
            v->data = realloc(v->data, v->capacity * sizeof(T)); \\
        }                                                         \\
        v->data[v->size++] = val;                                 \\
    }                                                             \\
                                                                  \\
    static inline T Name##_get(const Name *v, size_t i) {        \\
        return v->data[i];                                        \\
    }                                                             \\
                                                                  \\
    static inline void Name##_free(Name *v) {                    \\
        free(v->data);                                            \\
    }

/* Генерация конкретных типов */
DEFINE_VECTOR(int, IntVec)
DEFINE_VECTOR(double, DoubleVec)

int main(void) {
    IntVec iv = IntVec_create(4);
    IntVec_push(&iv, 10);
    IntVec_push(&iv, 20);
    IntVec_push(&iv, 30);

    for (size_t i = 0; i < iv.size; i++) {
        printf("%d ", IntVec_get(&iv, i));
    }
    printf("\\n");
    IntVec_free(&iv);

    DoubleVec dv = DoubleVec_create(4);
    DoubleVec_push(&dv, 1.5);
    DoubleVec_push(&dv, 2.5);

    for (size_t i = 0; i < dv.size; i++) {
        printf("%.1f ", DoubleVec_get(&dv, i));
    }
    printf("\\n");
    DoubleVec_free(&dv);

    return 0;
}`,
      filename: 'generic_macro.c',
    },
    {
      type: 'output',
      content: '10 20 30 \n1.5 2.5 ',
      prompt: '$ gcc generic_macro.c -o gm && ./gm',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Когда что использовать',
      markdown:
        '| Подход | Типобезопасность | Дебаг | Размер кода |\n|--------|------------------|-------|-------------|\n| `void *` | Нет | Сложный | Минимальный |\n| `_Generic` | Да (ограничено) | Хороший | Минимальный |\n| Макросы | Да | Сложный | Дублирование |\n\nДля маленьких проектов `void *` часто достаточно. Для библиотек — макросы дают лучшую типобезопасность. `_Generic` идеален для перегрузки функций по типу.',
    },
    {
      type: 'prose',
      markdown:
        '## Пример: обобщённый макрос `min` / `max`\n\nКлассическая задача — написать макрос, безопасный от двойного вычисления аргументов. В GCC/Clang для этого используется расширение `__typeof__`, а в C23 появится стандартный `typeof`.',
    },
    {
      type: 'codeDiff',
      before: `/* Опасный макрос: двойное вычисление */
#define MAX(a, b) ((a) > (b) ? (a) : (b))

/* Проблема: i инкрементируется дважды */
int i = 5;
int m = MAX(i++, 3); /* UB? Нет, но i == 7 */`,
      after: `/* Безопасный макрос (GCC/Clang extension) */
#define MAX(a, b) ({           \\
    __typeof__(a) _a = (a);    \\
    __typeof__(b) _b = (b);    \\
    _a > _b ? _a : _b;         \\
})

/* i инкрементируется ровно один раз */
int i = 5;
int m = MAX(i++, 3); /* m == 5, i == 6 */`,
      language: 'c',
      description: 'Безопасный макрос MAX без двойного вычисления аргументов',
    },
    {
      type: 'quiz',
      question: 'Что делает выражение _Generic в C11?',
      options: [
        'Создаёт шаблонную функцию, которая компилируется для каждого типа',
        'Выбирает выражение на этапе компиляции в зависимости от типа аргумента',
        'Добавляет runtime-проверку типа для void* указателей',
        'Генерирует полиморфные vtable, как в C++',
      ],
      correctIndex: 1,
      explanation:
        '_Generic — это ключевое слово C11, которое на этапе компиляции выбирает одно из нескольких выражений на основе типа управляющего выражения. Оно не создаёт шаблоны и не генерирует код — просто выбирает уже существующую ветку.',
    },
    {
      type: 'exercise',
      title: 'Обобщённый стек на макросах',
      description:
        'Напишите макрос `DEFINE_STACK(T, Name)`, который генерирует типизированный стек с операциями:\n- `Name_create(capacity)` — создание стека\n- `Name_push(stack, value)` — добавление элемента\n- `Name_pop(stack)` — извлечение элемента (возвращает значение)\n- `Name_peek(stack)` — просмотр верхнего элемента без извлечения\n- `Name_is_empty(stack)` — проверка на пустоту\n- `Name_free(stack)` — освобождение памяти\n\nПротестируйте для типов `int` и `const char *`.',
      hints: [
        'Структура стека: массив T*, size_t top, size_t capacity',
        'Используйте оператор ## для склейки имени типа и операции',
        'Для pop проверяйте, что стек не пуст (assert или возврат значения по умолчанию)',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

#define DEFINE_STACK(T, Name)                                \\
    typedef struct { T *data; size_t top, cap; } Name;       \\
                                                             \\
    static inline Name Name##_create(size_t cap) {           \\
        return (Name){ .data = malloc(cap * sizeof(T)),      \\
                       .top = 0, .cap = cap };               \\
    }                                                        \\
    static inline void Name##_push(Name *s, T val) {        \\
        assert(s->top < s->cap);                             \\
        s->data[s->top++] = val;                             \\
    }                                                        \\
    static inline T Name##_pop(Name *s) {                    \\
        assert(s->top > 0);                                  \\
        return s->data[--s->top];                            \\
    }                                                        \\
    static inline T Name##_peek(const Name *s) {             \\
        assert(s->top > 0);                                  \\
        return s->data[s->top - 1];                          \\
    }                                                        \\
    static inline int Name##_is_empty(const Name *s) {       \\
        return s->top == 0;                                  \\
    }                                                        \\
    static inline void Name##_free(Name *s) { free(s->data); }

DEFINE_STACK(int, IntStack)
DEFINE_STACK(const char *, StrStack)

int main(void) {
    IntStack is = IntStack_create(8);
    IntStack_push(&is, 1);
    IntStack_push(&is, 2);
    IntStack_push(&is, 3);
    while (!IntStack_is_empty(&is))
        printf("%d ", IntStack_pop(&is));
    printf("\\n");
    IntStack_free(&is);

    StrStack ss = StrStack_create(8);
    StrStack_push(&ss, "hello");
    StrStack_push(&ss, "world");
    printf("%s %s\\n", StrStack_pop(&ss), StrStack_pop(&ss));
    StrStack_free(&ss);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
