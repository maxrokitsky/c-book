import type { Chapter } from '../types'

export default {
  id: 'modern-c',
  title: 'Современный C (C11/C17/C23)',
  description: 'Новые возможности стандартов, typeof, constexpr',
  blocks: [
    {
      type: 'prose',
      markdown:
        'Язык C продолжает развиваться. После долгого периода стабильности (C89/C99) последние стандарты принесли значительные улучшения:\n\n- **C11** (2011) — многопоточность, `_Generic`, `_Static_assert`, анонимные структуры/объединения\n- **C17** (2018) — исправление дефектов C11, без новых возможностей\n- **C23** (2024) — `typeof`, `constexpr`, `nullptr`, `auto`, атрибуты, `#embed` и многое другое\n\nВ этой главе рассмотрим наиболее полезные нововведения каждого стандарта.',
    },
    {
      type: 'prose',
      markdown:
        '## C11: ключевые возможности\n\n### `_Static_assert` — проверки на этапе компиляции\n\nПозволяет проверить условие в момент компиляции. Если условие ложно, компиляция завершается с сообщением об ошибке.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <limits.h>
#include <stddef.h>

/* Проверяем, что int не менее 32 бит */
_Static_assert(sizeof(int) >= 4,
    "Этот код требует 32-битного int");

/* Проверяем, что структура имеет ожидаемый размер */
struct Packet {
    uint32_t id;
    uint16_t type;
    uint16_t flags;
    uint8_t  data[64];
};

_Static_assert(sizeof(struct Packet) == 72,
    "Packet должен быть ровно 72 байта");

/* C23 упрощает: можно без сообщения */
/* static_assert(sizeof(int) >= 4); */`,
      filename: 'static_assert.c',
    },
    {
      type: 'prose',
      markdown:
        '### Анонимные структуры и объединения\n\nC11 позволяет вкладывать безымянные структуры и объединения, обращаясь к их полям напрямую.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

struct Vec3 {
    union {
        struct { float x, y, z; };   /* анонимная структура */
        float data[3];                /* тот же блок памяти */
    };
};

int main(void) {
    struct Vec3 v = { .x = 1.0f, .y = 2.0f, .z = 3.0f };

    /* Доступ через имена полей */
    printf("x=%.1f y=%.1f z=%.1f\\n", v.x, v.y, v.z);

    /* Доступ через массив — та же память */
    for (int i = 0; i < 3; i++) {
        printf("data[%d]=%.1f\\n", i, v.data[i]);
    }

    return 0;
}`,
      filename: 'anonymous_struct.c',
    },
    {
      type: 'output',
      content: 'x=1.0 y=2.0 z=3.0\ndata[0]=1.0\ndata[1]=2.0\ndata[2]=3.0',
      prompt: '$ gcc -std=c11 anonymous_struct.c -o anon && ./anon',
    },
    {
      type: 'diagram',
      component: 'StructLayoutDiagram',
      props: {
        name: 'struct Vec3',
        fields: [
          { name: 'x / [0]', type: 'float', size: 4, offset: 0 },
          { name: 'y / [1]', type: 'float', size: 4, offset: 4 },
          { name: 'z / [2]', type: 'float', size: 4, offset: 8 },
        ],
        totalSize: 12,
      },
      caption: 'Поля анонимной структуры и массив разделяют одну область памяти',
    },
    {
      type: 'prose',
      markdown:
        '## C23: главные нововведения\n\n### `typeof` — получение типа выражения\n\nРаньше `typeof` был расширением GCC/Clang (`__typeof__`). C23 стандартизирует его. Также добавляется `typeof_unqual` — тип без квалификаторов (`const`, `volatile`).',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Компилируем с -std=c2x (GCC 13+ / Clang 16+) */
#include <stdio.h>

#define SWAP(a, b) do {      \\
    typeof(a) _tmp = (a);    \\
    (a) = (b);               \\
    (b) = _tmp;              \\
} while (0)

int main(void) {
    int x = 10, y = 20;
    SWAP(x, y);
    printf("x=%d, y=%d\\n", x, y); /* x=20, y=10 */

    double a = 1.5, b = 2.5;
    SWAP(a, b);
    printf("a=%.1f, b=%.1f\\n", a, b);

    /* typeof_unqual снимает const */
    const int ci = 42;
    typeof_unqual(ci) mutable_copy = ci;
    mutable_copy = 100; /* OK, не const */
    printf("mutable_copy=%d\\n", mutable_copy);

    return 0;
}`,
      filename: 'typeof_c23.c',
    },
    {
      type: 'prose',
      markdown:
        '### `constexpr` — константы времени компиляции\n\nC23 вводит `constexpr` для переменных, гарантируя, что значение вычислено на этапе компиляции. В отличие от `const`, `constexpr`-переменная может использоваться там, где требуется целочисленная константа (например, размер массива).',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* C23: constexpr */
#include <stdio.h>

constexpr int MAX_SIZE = 256;
constexpr double PI = 3.14159265358979323846;

int main(void) {
    /* constexpr как размер массива — допустимо */
    int buffer[MAX_SIZE];
    buffer[0] = 42;

    /* const не всегда можно использовать как размер VLA-free */
    /* const int n = 256; int arr[n]; — это VLA! */

    constexpr int ROWS = 3;
    constexpr int COLS = 4;
    int matrix[ROWS][COLS];
    matrix[0][0] = 1;

    printf("MAX_SIZE=%d, PI=%f\\n", MAX_SIZE, PI);
    printf("sizeof(buffer)=%zu\\n", sizeof(buffer));
    printf("matrix: %dx%d\\n", ROWS, COLS);

    return 0;
}`,
      filename: 'constexpr_c23.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'constexpr в C vs C++',
      markdown:
        'В C23 `constexpr` применяется **только к переменным** (скаляры, структуры с constexpr-полями). В C++ `constexpr` также работает с функциями, конструкторами, и лямбдами. C23-версия гораздо проще.',
    },
    {
      type: 'prose',
      markdown:
        '### `nullptr` — типизированный нулевой указатель\n\nC23 добавляет ключевое слово `nullptr` типа `nullptr_t`. В отличие от макроса `NULL` (который может быть `0` или `(void *)0`), `nullptr` однозначно является нулевым указателем.',
    },
    {
      type: 'codeDiff',
      before: `/* До C23 */
#include <stddef.h>
int *p = NULL;     /* NULL может быть (void*)0 или 0 */

/* Проблема с перегрузкой через _Generic */
#define show(x) _Generic((x), \\
    int:    "int",             \\
    void *: "pointer"          \\
)
/* show(NULL) может выбрать "int" если NULL == 0 */`,
      after: `/* C23 */
int *p = nullptr;  /* всегда нулевой указатель */

#define show(x) _Generic((x),  \\
    int:       "int",           \\
    nullptr_t: "null pointer"   \\
)
/* show(nullptr) всегда выберет "null pointer" */`,
      language: 'c',
      description: 'nullptr устраняет двусмысленность NULL',
    },
    {
      type: 'prose',
      markdown:
        '### `auto` — вывод типа переменной\n\nC23 позволяет использовать `auto` для автоматического вывода типа из инициализатора. Работает только для локальных переменных с инициализацией.',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* C23: auto для вывода типа */
#include <stdio.h>

int main(void) {
    auto x = 42;          /* int */
    auto pi = 3.14;       /* double */
    auto ch = 'A';        /* int (в C символьные литералы — int) */
    auto ptr = &x;        /* int* */

    printf("x: %d\\n", x);
    printf("pi: %f\\n", pi);
    printf("*ptr: %d\\n", *ptr);

    /* auto удобен с typeof */
    int arr[] = {1, 2, 3, 4, 5};
    auto size = sizeof(arr) / sizeof(arr[0]); /* size_t */

    return 0;
}`,
      filename: 'auto_c23.c',
    },
    {
      type: 'quiz',
      question: 'Какое из следующих нововведений появилось в C11?',
      options: [
        'typeof для получения типа выражения',
        'constexpr для констант времени компиляции',
        '_Generic для выбора по типу',
        'nullptr как типизированный нулевой указатель',
      ],
      correctIndex: 2,
      explanation:
        '_Generic появился в C11. typeof, constexpr и nullptr — нововведения C23. До C23 typeof существовал только как расширение компиляторов (__typeof__ в GCC/Clang).',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Проверка поддержки стандартов',
      markdown:
        'Используйте предопределённые макросы для проверки версии стандарта:\n```c\n#if __STDC_VERSION__ >= 201112L  /* C11 */\n#if __STDC_VERSION__ >= 201710L  /* C17 */\n#if __STDC_VERSION__ >= 202311L  /* C23 */\n```\nФлаги компиляции: `-std=c11`, `-std=c17`, `-std=c23` (или `-std=c2x`).',
    },
    {
      type: 'exercise',
      title: 'Типобезопасный min/max на C23',
      description:
        'Используя возможности C23 (typeof, auto), напишите макросы `MIN(a, b)` и `MAX(a, b)`, которые:\n1. Не вычисляют аргументы дважды\n2. Работают с любыми арифметическими типами\n3. Генерируют ошибку компиляции, если типы аргументов несовместимы\n\nПротестируйте с int, double и смешанными типами.',
      hints: [
        'Используйте typeof(a) для создания временных переменных',
        'Конструкция do { ... } while(0) делает макрос безопасным в if/else',
        'Для C23 можно использовать typeof напрямую вместо __typeof__',
      ],
      solution: `#include <stdio.h>

#define MIN(a, b) ({                \\
    typeof(a) _min_a = (a);         \\
    typeof(b) _min_b = (b);         \\
    _min_a < _min_b ? _min_a : _min_b; \\
})

#define MAX(a, b) ({                \\
    typeof(a) _max_a = (a);         \\
    typeof(b) _max_b = (b);         \\
    _max_a > _max_b ? _max_a : _max_b; \\
})

int main(void) {
    /* int */
    int a = 5, b = 3;
    printf("min(%d, %d) = %d\\n", a, b, MIN(a, b));
    printf("max(%d, %d) = %d\\n", a, b, MAX(a, b));

    /* double */
    double x = 1.5, y = 2.7;
    printf("min(%.1f, %.1f) = %.1f\\n", x, y, MIN(x, y));

    /* Безопасность: без двойного вычисления */
    int i = 10;
    auto m = MIN(i++, 15);
    printf("MIN(i++, 15) = %d, i = %d\\n", m, i);
    /* m == 10, i == 11 (ровно один инкремент) */

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
