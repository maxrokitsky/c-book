import type { Chapter } from '../types'

export default {
  id: 'calculator',
  title: 'Калькулятор',
  description: 'Консольный калькулятор с парсингом выражений',
  blocks: [
    {
      type: 'prose',
      markdown: `# Консольный калькулятор

Наш первый проект — консольный калькулятор, который умеет разбирать и вычислять арифметические выражения вида \`3 + 5 * (2 - 1)\`. Это не просто программа с \`switch\` на операторы: мы напишем полноценный **парсер выражений** с поддержкой приоритетов операций и скобок.

Этот проект познакомит вас с фундаментальными концепциями:
- Лексический анализ (токенизация)
- Рекурсивный нисходящий парсинг
- Работа со строками в C
- Обработка ошибок`,
    },
    {
      type: 'prose',
      markdown: `## Архитектура

Калькулятор состоит из трёх этапов обработки:

1. **Лексер** — разбивает строку ввода на токены (числа, операторы, скобки).
2. **Парсер** — строит дерево выражения с учётом приоритетов операций.
3. **Вычислитель** — обходит дерево и вычисляет результат.

Мы используем классический подход **рекурсивного спуска** (recursive descent). Каждому уровню приоритета операций соответствует отдельная функция парсера.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Рекурсивный спуск',
      markdown:
        'Рекурсивный спуск — один из самых простых и понятных методов построения парсеров. Он используется в реальных компиляторах (например, GCC использует рекурсивный спуск для парсинга C). Идея проста: для каждого правила грамматики пишется отдельная функция.',
    },
    {
      type: 'prose',
      markdown: `## Токенизация

Первый шаг — разбить строку на осмысленные единицы (токены). Для арифметических выражений нам нужны токены: числа, операторы \`+ - * /\`, скобки \`( )\` и маркер конца ввода.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

typedef enum {
    TOK_NUMBER,
    TOK_PLUS,
    TOK_MINUS,
    TOK_STAR,
    TOK_SLASH,
    TOK_LPAREN,
    TOK_RPAREN,
    TOK_END,
    TOK_ERROR
} TokenType;

typedef struct {
    TokenType type;
    double value;
} Token;

typedef struct {
    const char *input;
    size_t pos;
    Token current;
} Lexer;

void lexer_init(Lexer *lex, const char *input)
{
    lex->input = input;
    lex->pos = 0;
    lex->current.type = TOK_ERROR;
    lex->current.value = 0;
}

Token lexer_next(Lexer *lex)
{
    /* Пропускаем пробелы */
    while (lex->input[lex->pos] == ' ')
        lex->pos++;

    char c = lex->input[lex->pos];

    if (c == '\\0') {
        lex->current = (Token){TOK_END, 0};
        return lex->current;
    }

    if (isdigit(c) || c == '.') {
        char *end;
        double val = strtod(&lex->input[lex->pos], &end);
        lex->pos = (size_t)(end - lex->input);
        lex->current = (Token){TOK_NUMBER, val};
        return lex->current;
    }

    lex->pos++;
    switch (c) {
    case '+': lex->current = (Token){TOK_PLUS, 0}; break;
    case '-': lex->current = (Token){TOK_MINUS, 0}; break;
    case '*': lex->current = (Token){TOK_STAR, 0}; break;
    case '/': lex->current = (Token){TOK_SLASH, 0}; break;
    case '(': lex->current = (Token){TOK_LPAREN, 0}; break;
    case ')': lex->current = (Token){TOK_RPAREN, 0}; break;
    default:
        fprintf(stderr, "Неизвестный символ: '%c'\\n", c);
        lex->current = (Token){TOK_ERROR, 0};
    }
    return lex->current;
}`,
      filename: 'calc.c',
    },
    {
      type: 'prose',
      markdown: `## Парсер: рекурсивный спуск

Грамматика арифметических выражений с учётом приоритетов:

\`\`\`
expr   → term (('+' | '-') term)*
term   → factor (('*' | '/') factor)*
factor → NUMBER | '(' expr ')' | '-' factor
\`\`\`

Каждому правилу соответствует функция. Функция \`parse_factor\` обрабатывает числа, скобки и унарный минус. Функция \`parse_term\` — умножение и деление. Функция \`parse_expr\` — сложение и вычитание.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Предварительные объявления */
static double parse_expr(Lexer *lex);
static double parse_term(Lexer *lex);
static double parse_factor(Lexer *lex);

static double parse_factor(Lexer *lex)
{
    Token tok = lex->current;

    if (tok.type == TOK_NUMBER) {
        lexer_next(lex);
        return tok.value;
    }

    if (tok.type == TOK_MINUS) {
        lexer_next(lex);
        return -parse_factor(lex);
    }

    if (tok.type == TOK_LPAREN) {
        lexer_next(lex);
        double result = parse_expr(lex);
        if (lex->current.type != TOK_RPAREN) {
            fprintf(stderr, "Ожидалась ')\\n'");
            exit(1);
        }
        lexer_next(lex);
        return result;
    }

    fprintf(stderr, "Неожиданный токен\\n");
    exit(1);
}

static double parse_term(Lexer *lex)
{
    double left = parse_factor(lex);
    while (lex->current.type == TOK_STAR ||
           lex->current.type == TOK_SLASH) {
        TokenType op = lex->current.type;
        lexer_next(lex);
        double right = parse_factor(lex);
        if (op == TOK_STAR)
            left *= right;
        else {
            if (right == 0.0) {
                fprintf(stderr, "Деление на ноль\\n");
                exit(1);
            }
            left /= right;
        }
    }
    return left;
}

static double parse_expr(Lexer *lex)
{
    double left = parse_term(lex);
    while (lex->current.type == TOK_PLUS ||
           lex->current.type == TOK_MINUS) {
        TokenType op = lex->current.type;
        lexer_next(lex);
        double right = parse_term(lex);
        if (op == TOK_PLUS)
            left += right;
        else
            left -= right;
    }
    return left;
}`,
      filename: 'calc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `double calc_eval(const char *expression)
{
    Lexer lex;
    lexer_init(&lex, expression);
    lexer_next(&lex);               /* загружаем первый токен */
    double result = parse_expr(&lex);
    if (lex.current.type != TOK_END) {
        fprintf(stderr, "Лишние символы в выражении\\n");
        exit(1);
    }
    return result;
}

int main(void)
{
    char line[256];
    printf("Калькулятор. Введите выражение (или 'q' для выхода):\\n");

    while (1) {
        printf("> ");
        if (!fgets(line, sizeof(line), stdin))
            break;
        if (line[0] == 'q' || line[0] == 'Q')
            break;
        printf("= %.10g\\n", calc_eval(line));
    }
    return 0;
}`,
      filename: 'calc.c',
    },
    {
      type: 'output',
      content: `Калькулятор. Введите выражение (или 'q' для выхода):
> 3 + 5 * (2 - 1)
= 8
> (10 + 20) / 3
= 10
> -4 * -2.5
= 10
> q`,
      prompt: '$ gcc -Wall -Wextra -o calc calc.c && ./calc',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Деление на ноль',
      markdown:
        'Наш калькулятор выбрасывает ошибку при делении на ноль. В реальном проекте стоит обрабатывать ошибки без завершения программы — возвращать код ошибки через параметр-указатель или использовать `setjmp`/`longjmp` для нелокальных переходов.',
    },
    {
      type: 'prose',
      markdown: `## Расширения

Базовый калькулятор можно развить в полноценный инструмент:

- **Переменные:** хранение именованных значений в хеш-таблице (\`x = 42\`)
- **Функции:** \`sin(x)\`, \`cos(x)\`, \`sqrt(x)\` — вызовы из \`<math.h>\`
- **Оператор возведения в степень:** \`^\` с правой ассоциативностью
- **История ввода:** интеграция с библиотекой \`readline\`
- **Побитовые операции:** \`&\`, \`|\`, \`~\`, \`<<\`, \`>>\` для целых чисел`,
    },
    {
      type: 'exercise',
      title: 'Добавьте оператор возведения в степень',
      description:
        'Добавьте оператор `^` для возведения в степень. Помните, что возведение в степень правоассоциативно: `2^3^2` должно вычисляться как `2^(3^2) = 512`, а не как `(2^3)^2 = 64`. Для вычисления используйте функцию `pow()` из `<math.h>` и компилируйте с флагом `-lm`.',
      hints: [
        'Создайте новый уровень приоритета между factor и term',
        'Для правой ассоциативности используйте рекурсию вместо цикла: power → factor ("^" power)?',
        'Не забудьте добавить TOK_CARET в перечисление токенов',
      ],
      solution: `static double parse_power(Lexer *lex)
{
    double base = parse_factor(lex);
    if (lex->current.type == TOK_CARET) {
        lexer_next(lex);
        double exp = parse_power(lex); /* рекурсия для правой ассоциативности */
        return pow(base, exp);
    }
    return base;
}

/* В parse_term замените parse_factor на parse_power */
static double parse_term(Lexer *lex)
{
    double left = parse_power(lex);
    while (lex->current.type == TOK_STAR ||
           lex->current.type == TOK_SLASH) {
        TokenType op = lex->current.type;
        lexer_next(lex);
        double right = parse_power(lex);
        if (op == TOK_STAR)
            left *= right;
        else
            left /= right;
    }
    return left;
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Поддержка переменных',
      description:
        'Добавьте поддержку переменных. Пользователь должен иметь возможность ввести `x = 5 + 3`, а затем использовать `x` в последующих выражениях. Храните переменные в массиве структур `{ char name[32]; double value; }`. Лексер должен распознавать идентификаторы (последовательности букв).',
      hints: [
        'Добавьте тип токена TOK_IDENT и поле char name[32] в структуру Token',
        'В parse_factor проверяйте, является ли следующий символ "=" — если да, это присваивание',
        'Используйте линейный поиск по массиву переменных (для десятка переменных этого достаточно)',
      ],
      solution: `#define MAX_VARS 64

typedef struct {
    char name[32];
    double value;
} Variable;

static Variable vars[MAX_VARS];
static int var_count = 0;

static double *var_lookup(const char *name)
{
    for (int i = 0; i < var_count; i++) {
        if (strcmp(vars[i].name, name) == 0)
            return &vars[i].value;
    }
    return NULL;
}

static double *var_create(const char *name)
{
    if (var_count >= MAX_VARS) {
        fprintf(stderr, "Слишком много переменных\\n");
        exit(1);
    }
    strncpy(vars[var_count].name, name, 31);
    vars[var_count].name[31] = '\\0';
    vars[var_count].value = 0;
    return &vars[var_count++].value;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
