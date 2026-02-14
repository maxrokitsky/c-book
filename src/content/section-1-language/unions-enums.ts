import type { Chapter } from '../types'

export default {
  id: 'unions-enums',
  title: 'Объединения и перечисления',
  description: 'union, enum и их применение',
  blocks: [
    {
      type: 'prose',
      markdown: `# Объединения и перечисления

В этой главе мы рассмотрим два составных типа данных: **объединения** (\`union\`) и **перечисления** (\`enum\`). Объединения позволяют хранить разные типы данных в одной области памяти, а перечисления — создавать именованные целочисленные константы.`,
    },
    {
      type: 'prose',
      markdown: `## Объединения (union)

Объединение синтаксически похоже на структуру, но все его поля **разделяют одну и ту же область памяти**. Размер union равен размеру самого большого поля. В каждый момент времени только одно поле содержит корректное значение.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

union Value {
    int i;
    float f;
    char c;
};

int main(void) {
    union Value v;

    v.i = 42;
    printf("v.i = %d\\n", v.i);

    v.f = 3.14f;
    printf("v.f = %.2f\\n", v.f);
    /* v.i теперь содержит «мусор» — биты float */
    printf("v.i после записи float = %d (некорректно!)\\n", v.i);

    printf("\\nsizeof(int)   = %zu\\n", sizeof(int));
    printf("sizeof(float) = %zu\\n", sizeof(float));
    printf("sizeof(union Value) = %zu\\n", sizeof(union Value));

    return 0;
}`,
      filename: 'union_basic.c',
    },
    {
      type: 'output',
      content: `v.i = 42
v.f = 3.14
v.i после записи float = 1078523331 (некорректно!)

sizeof(int)   = 4
sizeof(float) = 4
sizeof(union Value) = 4`,
      prompt: '$ gcc union_basic.c -o union_basic && ./union_basic',
    },
    {
      type: 'diagram',
      component: 'StructLayoutDiagram',
      props: {
        title: 'struct vs union: размещение в памяти',
        layouts: [
          {
            name: 'struct { int i; float f; char c; }',
            fields: [
              { name: 'i', size: 4 },
              { name: 'f', size: 4 },
              { name: 'c', size: 1 },
              { name: 'padding', size: 3 },
            ],
            totalSize: 12,
          },
          {
            name: 'union { int i; float f; char c; }',
            fields: [
              { name: 'i / f / c', size: 4, shared: true },
            ],
            totalSize: 4,
          },
        ],
      },
      caption: 'В struct поля расположены последовательно, в union — наложены друг на друга',
    },
    {
      type: 'prose',
      markdown: `## Тегированные объединения

На практике union часто используется вместе со struct и enum для создания **тегированного объединения** (tagged union / discriminated union) — типа, который может хранить значения разных типов и «знает», какой тип сейчас активен.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

enum ValueType {
    VAL_INT,
    VAL_FLOAT,
    VAL_STRING
};

struct TaggedValue {
    enum ValueType type;   /* тег — какой тип сейчас хранится */
    union {
        int i;
        float f;
        char s[64];
    } data;
};

void print_value(const struct TaggedValue *v) {
    switch (v->type) {
    case VAL_INT:
        printf("int: %d\\n", v->data.i);
        break;
    case VAL_FLOAT:
        printf("float: %.2f\\n", v->data.f);
        break;
    case VAL_STRING:
        printf("string: \\"%s\\"\\n", v->data.s);
        break;
    }
}

int main(void) {
    struct TaggedValue values[3];

    values[0].type = VAL_INT;
    values[0].data.i = 42;

    values[1].type = VAL_FLOAT;
    values[1].data.f = 2.718f;

    values[2].type = VAL_STRING;
    strcpy(values[2].data.s, "Привет");

    for (int i = 0; i < 3; i++)
        print_value(&values[i]);

    return 0;
}`,
      filename: 'tagged_union.c',
    },
    {
      type: 'output',
      content: `int: 42
float: 2.72
string: "Привет"`,
      prompt: '$ gcc tagged_union.c -o tagged_union && ./tagged_union',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Паттерн тегированного объединения',
      markdown: `Тегированные объединения — один из важнейших паттернов в C. Они используются повсеместно:
- Токены лексера (число, строка, идентификатор)
- AST-узлы компилятора
- Варианты событий в GUI
- Конфигурационные значения разных типов

Этот паттерн настолько полезен, что в Rust он встроен в язык как \`enum\` с данными.`,
    },
    {
      type: 'prose',
      markdown: `## Перечисления (enum)

Перечисление задаёт набор именованных целочисленных констант. По умолчанию первая константа равна 0, каждая следующая увеличивается на 1. Можно задавать значения явно.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Значения по умолчанию: 0, 1, 2, 3 */
enum Direction {
    DIR_NORTH,
    DIR_EAST,
    DIR_SOUTH,
    DIR_WEST
};

/* Явные значения */
enum HttpStatus {
    HTTP_OK          = 200,
    HTTP_NOT_FOUND   = 404,
    HTTP_SERVER_ERROR = 500
};

/* Битовые флаги через enum */
enum Permission {
    PERM_READ    = 1 << 0,  /* 1 */
    PERM_WRITE   = 1 << 1,  /* 2 */
    PERM_EXECUTE = 1 << 2   /* 4 */
};

const char *direction_name(enum Direction d) {
    switch (d) {
    case DIR_NORTH: return "Север";
    case DIR_EAST:  return "Восток";
    case DIR_SOUTH: return "Юг";
    case DIR_WEST:  return "Запад";
    }
    return "Неизвестно";
}

int main(void) {
    enum Direction dir = DIR_SOUTH;
    printf("Направление: %s (%d)\\n", direction_name(dir), dir);

    /* Битовые флаги */
    int perms = PERM_READ | PERM_WRITE;
    if (perms & PERM_READ)    printf("Чтение: да\\n");
    if (perms & PERM_WRITE)   printf("Запись: да\\n");
    if (perms & PERM_EXECUTE) printf("Выполнение: да\\n");
    else                      printf("Выполнение: нет\\n");

    return 0;
}`,
      filename: 'enum_demo.c',
    },
    {
      type: 'output',
      content: `Направление: Юг (2)
Чтение: да
Запись: да
Выполнение: нет`,
      prompt: '$ gcc enum_demo.c -o enum_demo && ./enum_demo',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'enum в C — это просто int',
      markdown: `В C (в отличие от C++) перечисления не являются отдельным типом — это обычные \`int\`. Компилятор **не проверяет**, что значение переменной типа \`enum Direction\` находится в допустимом диапазоне. Можно написать:

\`\`\`c
enum Direction d = 42;  /* компилируется без ошибок */
\`\`\`

Поэтому всегда добавляйте ветку \`default\` в \`switch\` по enum и используйте префиксы для констант (\`DIR_\`, \`HTTP_\`, \`PERM_\`), чтобы избежать конфликтов имён.`,
    },
    {
      type: 'quiz',
      question: 'Чему равен sizeof(union U) для union U { char c; int i; double d; } на типичной 64-битной системе?',
      options: [
        '1 (размер char)',
        '4 (размер int)',
        '8 (размер double)',
        '13 (сумма всех полей)',
      ],
      correctIndex: 2,
      explanation: 'Размер union равен размеру его наибольшего поля. double обычно занимает 8 байт, что больше int (4) и char (1). Поля не суммируются, как в struct, — они размещены по одному и тому же адресу.',
    },
    {
      type: 'exercise',
      title: 'Простой калькулятор на тегированном объединении',
      description: 'Создайте тип `struct Token` с тегом `enum TokenType { TOK_NUMBER, TOK_PLUS, TOK_MINUS, TOK_MULT, TOK_DIV }` и union для хранения числового значения (double). Напишите функцию `struct Token make_number(double val)` и функцию `void print_token(struct Token t)`, которая печатает токен.',
      hints: [
        'Для операторов union-поле не нужно — достаточно тега',
        'В make_number устанавливайте type = TOK_NUMBER и data.value = val',
        'В print_token используйте switch по type',
      ],
      solution: `#include <stdio.h>

enum TokenType {
    TOK_NUMBER,
    TOK_PLUS,
    TOK_MINUS,
    TOK_MULT,
    TOK_DIV
};

struct Token {
    enum TokenType type;
    union {
        double value;
    } data;
};

struct Token make_number(double val) {
    struct Token t;
    t.type = TOK_NUMBER;
    t.data.value = val;
    return t;
}

struct Token make_op(enum TokenType type) {
    struct Token t;
    t.type = type;
    return t;
}

void print_token(struct Token t) {
    switch (t.type) {
    case TOK_NUMBER: printf("NUMBER(%.2f)", t.data.value); break;
    case TOK_PLUS:   printf("PLUS");  break;
    case TOK_MINUS:  printf("MINUS"); break;
    case TOK_MULT:   printf("MULT");  break;
    case TOK_DIV:    printf("DIV");   break;
    }
    printf("\\n");
}

int main(void) {
    struct Token tokens[] = {
        make_number(3.0),
        make_op(TOK_PLUS),
        make_number(4.5),
        make_op(TOK_MULT),
        make_number(2.0),
    };

    for (int i = 0; i < 5; i++)
        print_token(tokens[i]);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
