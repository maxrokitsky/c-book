import type { Chapter } from '../types'

export default {
  id: 'mini-compiler',
  title: 'Мини-компилятор',
  description: 'Компилятор простого языка в x86 ассемблер',
  blocks: [
    {
      type: 'prose',
      markdown: `# Мини-компилятор

В этом проекте мы напишем компилятор простого языка программирования, который генерирует x86-64 ассемблер. Наш язык будет поддерживать целочисленные переменные, арифметику, условные конструкции \`if/else\` и циклы \`while\`.

Компилятор — это программа, которая переводит код с одного языка на другой. Наш компилятор пройдёт через классические фазы:

1. **Лексический анализ** — разбиение исходного кода на токены
2. **Синтаксический анализ** — построение абстрактного синтаксического дерева (AST)
3. **Генерация кода** — обход AST и генерация ассемблера`,
    },
    {
      type: 'prose',
      markdown: `## Входной язык

Наш язык выглядит так:

\`\`\`
var x = 10;
var y = 3;
var result = 0;

while (x > 0) {
    result = result + y;
    x = x - 1;
}

print(result);
\`\`\`

Эта программа умножает 10 на 3 через последовательное сложение. Язык поддерживает:
- Объявление переменных: \`var name = expr;\`
- Присваивание: \`name = expr;\`
- Арифметику: \`+\`, \`-\`, \`*\`, \`/\`
- Сравнения: \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`
- Конструкцию \`if (cond) { ... } else { ... }\`
- Цикл \`while (cond) { ... }\`
- Вывод: \`print(expr);\``,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Почему x86-64 ассемблер?',
      markdown:
        'Генерация ассемблера вместо машинного кода значительно проще: не нужно вычислять смещения переходов и кодировать инструкции в байты — этим занимается ассемблер (nasm или gas). При этом мы получаем настоящий исполняемый файл.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

/* ========== Лексер ========== */
typedef enum {
    T_INT, T_IDENT, T_VAR, T_IF, T_ELSE, T_WHILE, T_PRINT,
    T_PLUS, T_MINUS, T_STAR, T_SLASH,
    T_EQ, T_NEQ, T_LT, T_GT, T_LEQ, T_GEQ,
    T_ASSIGN, T_SEMI, T_LPAREN, T_RPAREN, T_LBRACE, T_RBRACE,
    T_EOF, T_ERROR
} TokenType;

typedef struct {
    TokenType type;
    int int_val;
    char ident[64];
} Token;

typedef struct {
    const char *src;
    size_t pos;
} Lexer;

static void lexer_skip_ws(Lexer *lex)
{
    while (lex->src[lex->pos] == ' '  ||
           lex->src[lex->pos] == '\\n' ||
           lex->src[lex->pos] == '\\t' ||
           lex->src[lex->pos] == '\\r')
        lex->pos++;
}

static Token lexer_next(Lexer *lex)
{
    Token tok = {T_ERROR, 0, ""};
    lexer_skip_ws(lex);
    char c = lex->src[lex->pos];

    if (c == '\\0') { tok.type = T_EOF; return tok; }

    /* Числа */
    if (isdigit(c)) {
        tok.type = T_INT;
        tok.int_val = 0;
        while (isdigit(lex->src[lex->pos])) {
            tok.int_val = tok.int_val * 10 + (lex->src[lex->pos] - '0');
            lex->pos++;
        }
        return tok;
    }

    /* Идентификаторы и ключевые слова */
    if (isalpha(c) || c == '_') {
        size_t start = lex->pos;
        while (isalnum(lex->src[lex->pos]) || lex->src[lex->pos] == '_')
            lex->pos++;
        size_t len = lex->pos - start;
        if (len >= sizeof(tok.ident)) len = sizeof(tok.ident) - 1;
        memcpy(tok.ident, &lex->src[start], len);
        tok.ident[len] = '\\0';

        if (strcmp(tok.ident, "var") == 0)        tok.type = T_VAR;
        else if (strcmp(tok.ident, "if") == 0)    tok.type = T_IF;
        else if (strcmp(tok.ident, "else") == 0)  tok.type = T_ELSE;
        else if (strcmp(tok.ident, "while") == 0) tok.type = T_WHILE;
        else if (strcmp(tok.ident, "print") == 0) tok.type = T_PRINT;
        else                                       tok.type = T_IDENT;
        return tok;
    }

    /* Операторы и пунктуация */
    lex->pos++;
    switch (c) {
    case '+': tok.type = T_PLUS; break;
    case '-': tok.type = T_MINUS; break;
    case '*': tok.type = T_STAR; break;
    case '/': tok.type = T_SLASH; break;
    case ';': tok.type = T_SEMI; break;
    case '(': tok.type = T_LPAREN; break;
    case ')': tok.type = T_RPAREN; break;
    case '{': tok.type = T_LBRACE; break;
    case '}': tok.type = T_RBRACE; break;
    case '=':
        if (lex->src[lex->pos] == '=') { lex->pos++; tok.type = T_EQ; }
        else tok.type = T_ASSIGN;
        break;
    case '!':
        if (lex->src[lex->pos] == '=') { lex->pos++; tok.type = T_NEQ; }
        break;
    case '<':
        if (lex->src[lex->pos] == '=') { lex->pos++; tok.type = T_LEQ; }
        else tok.type = T_LT;
        break;
    case '>':
        if (lex->src[lex->pos] == '=') { lex->pos++; tok.type = T_GEQ; }
        else tok.type = T_GT;
        break;
    }
    return tok;
}`,
      filename: 'minicc.c',
    },
    {
      type: 'prose',
      markdown: `## Абстрактное синтаксическое дерево (AST)

AST — это древовидное представление программы. Каждый узел дерева соответствует конструкции языка: числовому литералу, оператору, присваиванию, циклу и т.д.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* ========== AST ========== */
typedef enum {
    NODE_INT, NODE_VAR, NODE_BINOP,
    NODE_ASSIGN, NODE_VARDECL,
    NODE_IF, NODE_WHILE, NODE_PRINT,
    NODE_BLOCK
} NodeType;

typedef struct ASTNode {
    NodeType type;
    int int_val;
    char name[64];
    TokenType op;              /* для NODE_BINOP */
    struct ASTNode *left;
    struct ASTNode *right;
    struct ASTNode *cond;      /* для if/while */
    struct ASTNode *body;      /* для if/while */
    struct ASTNode *else_body; /* для if */
    struct ASTNode **stmts;    /* для NODE_BLOCK */
    int stmt_count;
} ASTNode;

static ASTNode *new_node(NodeType type)
{
    ASTNode *node = calloc(1, sizeof(ASTNode));
    node->type = type;
    return node;
}

/* Парсер с рекурсивным спуском */
typedef struct {
    Lexer lex;
    Token current;
} Parser;

static void parser_advance(Parser *p)
{
    p->current = lexer_next(&p->lex);
}

static void parser_expect(Parser *p, TokenType type)
{
    if (p->current.type != type) {
        fprintf(stderr, "Ожидался токен типа %d, получен %d\\n",
                type, p->current.type);
        exit(1);
    }
    parser_advance(p);
}`,
      filename: 'minicc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Парсинг выражений */
static ASTNode *parse_primary(Parser *p)
{
    if (p->current.type == T_INT) {
        ASTNode *node = new_node(NODE_INT);
        node->int_val = p->current.int_val;
        parser_advance(p);
        return node;
    }
    if (p->current.type == T_IDENT) {
        ASTNode *node = new_node(NODE_VAR);
        strcpy(node->name, p->current.ident);
        parser_advance(p);
        return node;
    }
    if (p->current.type == T_LPAREN) {
        parser_advance(p);
        ASTNode *node = parse_expr(p);
        parser_expect(p, T_RPAREN);
        return node;
    }
    fprintf(stderr, "Неожиданный токен в выражении\\n");
    exit(1);
}

static ASTNode *parse_mul(Parser *p)
{
    ASTNode *left = parse_primary(p);
    while (p->current.type == T_STAR || p->current.type == T_SLASH) {
        ASTNode *node = new_node(NODE_BINOP);
        node->op = p->current.type;
        parser_advance(p);
        node->left = left;
        node->right = parse_primary(p);
        left = node;
    }
    return left;
}

static ASTNode *parse_add(Parser *p)
{
    ASTNode *left = parse_mul(p);
    while (p->current.type == T_PLUS || p->current.type == T_MINUS) {
        ASTNode *node = new_node(NODE_BINOP);
        node->op = p->current.type;
        parser_advance(p);
        node->left = left;
        node->right = parse_mul(p);
        left = node;
    }
    return left;
}

static ASTNode *parse_expr(Parser *p)
{
    ASTNode *left = parse_add(p);
    if (p->current.type >= T_EQ && p->current.type <= T_GEQ) {
        ASTNode *node = new_node(NODE_BINOP);
        node->op = p->current.type;
        parser_advance(p);
        node->left = left;
        node->right = parse_add(p);
        return node;
    }
    return left;
}`,
      filename: 'minicc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* ========== Генерация x86-64 ассемблера (AT&T синтаксис) ========== */

typedef struct {
    FILE *out;
    int label_count;
    char vars[256][64];
    int var_count;
} CodeGen;

static int codegen_var_offset(CodeGen *cg, const char *name)
{
    for (int i = 0; i < cg->var_count; i++) {
        if (strcmp(cg->vars[i], name) == 0)
            return -(i + 1) * 8;  /* смещение от rbp */
    }
    /* Новая переменная */
    strcpy(cg->vars[cg->var_count], name);
    int offset = -(cg->var_count + 1) * 8;
    cg->var_count++;
    return offset;
}

static int codegen_new_label(CodeGen *cg)
{
    return cg->label_count++;
}

/* Генерация кода для выражения — результат в %rax */
static void codegen_expr(CodeGen *cg, ASTNode *node)
{
    switch (node->type) {
    case NODE_INT:
        fprintf(cg->out, "    movq $%d, %%rax\\n", node->int_val);
        break;
    case NODE_VAR: {
        int off = codegen_var_offset(cg, node->name);
        fprintf(cg->out, "    movq %d(%%rbp), %%rax\\n", off);
        break;
    }
    case NODE_BINOP:
        codegen_expr(cg, node->right);
        fprintf(cg->out, "    pushq %%rax\\n");
        codegen_expr(cg, node->left);
        fprintf(cg->out, "    popq %%rcx\\n");
        switch (node->op) {
        case T_PLUS:
            fprintf(cg->out, "    addq %%rcx, %%rax\\n"); break;
        case T_MINUS:
            fprintf(cg->out, "    subq %%rcx, %%rax\\n"); break;
        case T_STAR:
            fprintf(cg->out, "    imulq %%rcx, %%rax\\n"); break;
        case T_SLASH:
            fprintf(cg->out, "    cqo\\n");
            fprintf(cg->out, "    idivq %%rcx\\n"); break;
        case T_EQ: case T_NEQ: case T_LT: case T_GT:
        case T_LEQ: case T_GEQ:
            fprintf(cg->out, "    cmpq %%rcx, %%rax\\n");
            const char *set_instr = "sete";
            if (node->op == T_NEQ) set_instr = "setne";
            if (node->op == T_LT)  set_instr = "setl";
            if (node->op == T_GT)  set_instr = "setg";
            if (node->op == T_LEQ) set_instr = "setle";
            if (node->op == T_GEQ) set_instr = "setge";
            fprintf(cg->out, "    %s %%al\\n", set_instr);
            fprintf(cg->out, "    movzbq %%al, %%rax\\n");
            break;
        default: break;
        }
        break;
    default:
        fprintf(stderr, "Неизвестный тип узла в выражении\\n");
        exit(1);
    }
}`,
      filename: 'minicc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Генерация кода для операторов */
static void codegen_stmt(CodeGen *cg, ASTNode *node)
{
    switch (node->type) {
    case NODE_VARDECL:
    case NODE_ASSIGN: {
        codegen_expr(cg, node->right);
        int off = codegen_var_offset(cg, node->name);
        fprintf(cg->out, "    movq %%rax, %d(%%rbp)\\n", off);
        break;
    }
    case NODE_PRINT:
        codegen_expr(cg, node->left);
        fprintf(cg->out, "    movq %%rax, %%rsi\\n");
        fprintf(cg->out, "    leaq fmt(%%rip), %%rdi\\n");
        fprintf(cg->out, "    xorq %%rax, %%rax\\n");
        fprintf(cg->out, "    call printf\\n");
        break;
    case NODE_IF: {
        int lbl_else = codegen_new_label(cg);
        int lbl_end = codegen_new_label(cg);
        codegen_expr(cg, node->cond);
        fprintf(cg->out, "    testq %%rax, %%rax\\n");
        fprintf(cg->out, "    jz .L%d\\n", lbl_else);
        codegen_stmt(cg, node->body);
        fprintf(cg->out, "    jmp .L%d\\n", lbl_end);
        fprintf(cg->out, ".L%d:\\n", lbl_else);
        if (node->else_body)
            codegen_stmt(cg, node->else_body);
        fprintf(cg->out, ".L%d:\\n", lbl_end);
        break;
    }
    case NODE_WHILE: {
        int lbl_start = codegen_new_label(cg);
        int lbl_end = codegen_new_label(cg);
        fprintf(cg->out, ".L%d:\\n", lbl_start);
        codegen_expr(cg, node->cond);
        fprintf(cg->out, "    testq %%rax, %%rax\\n");
        fprintf(cg->out, "    jz .L%d\\n", lbl_end);
        codegen_stmt(cg, node->body);
        fprintf(cg->out, "    jmp .L%d\\n", lbl_start);
        fprintf(cg->out, ".L%d:\\n", lbl_end);
        break;
    }
    case NODE_BLOCK:
        for (int i = 0; i < node->stmt_count; i++)
            codegen_stmt(cg, node->stmts[i]);
        break;
    default:
        break;
    }
}

static void codegen_program(CodeGen *cg, ASTNode *program)
{
    fprintf(cg->out, ".section .data\\n");
    fprintf(cg->out, "fmt: .asciz \"%%ld\\\\n\"\\n");
    fprintf(cg->out, ".section .text\\n");
    fprintf(cg->out, ".globl main\\n");
    fprintf(cg->out, "main:\\n");
    fprintf(cg->out, "    pushq %%rbp\\n");
    fprintf(cg->out, "    movq %%rsp, %%rbp\\n");
    fprintf(cg->out, "    subq $256, %%rsp\\n");

    codegen_stmt(cg, program);

    fprintf(cg->out, "    xorq %%rax, %%rax\\n");
    fprintf(cg->out, "    leave\\n");
    fprintf(cg->out, "    ret\\n");
}`,
      filename: 'minicc.c',
    },
    {
      type: 'output',
      content: `$ cat test.lang
var x = 10;
var y = 3;
var result = 0;
while (x > 0) {
    result = result + y;
    x = x - 1;
}
print(result);

$ ./minicc test.lang > test.s
$ gcc -o test test.s -no-pie
$ ./test
30`,
      prompt: '$ gcc -Wall -Wextra -o minicc minicc.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Соглашение о вызовах',
      markdown:
        'При вызове `printf` мы следуем System V AMD64 ABI: первый аргумент (строка формата) передаётся в `%rdi`, второй (значение) — в `%rsi`. Стек должен быть выровнен на 16 байт перед вызовом. Несоблюдение этих правил приведёт к падению программы или неверным результатам.',
    },
    {
      type: 'exercise',
      title: 'Добавьте поддержку функций',
      description:
        'Расширьте язык поддержкой пользовательских функций. Синтаксис: `func add(a, b) { return a + b; }`. Функции принимают целочисленные аргументы и возвращают целое значение. При вызове `add(3, 5)` аргументы передаются через регистры по System V ABI.',
      hints: [
        'Добавьте узлы AST: NODE_FUNC (определение), NODE_CALL (вызов), NODE_RETURN',
        'Аргументы передаются в регистрах: rdi, rsi, rdx, rcx, r8, r9',
        'Каждая функция получает свой пролог (push rbp / mov rsp rbp) и эпилог (leave / ret)',
        'Локальные переменные и параметры адресуются через [rbp - offset] и [rbp + offset]',
      ],
      solution: `/* Генерация определения функции */
static void codegen_func(CodeGen *cg, ASTNode *node)
{
    const char *regs[] = {"rdi", "rsi", "rdx", "rcx", "r8", "r9"};
    fprintf(cg->out, "%s:\\n", node->name);
    fprintf(cg->out, "    pushq %%rbp\\n");
    fprintf(cg->out, "    movq %%rsp, %%rbp\\n");
    fprintf(cg->out, "    subq $128, %%rsp\\n");

    /* Сохраняем аргументы из регистров в стек */
    for (int i = 0; i < node->stmt_count && i < 6; i++) {
        int off = codegen_var_offset(cg, node->stmts[i]->name);
        fprintf(cg->out, "    movq %%%s, %d(%%rbp)\\n", regs[i], off);
    }

    codegen_stmt(cg, node->body);

    fprintf(cg->out, "    leave\\n");
    fprintf(cg->out, "    ret\\n");
}

/* Генерация вызова функции */
static void codegen_call(CodeGen *cg, ASTNode *node)
{
    const char *regs[] = {"rdi", "rsi", "rdx", "rcx", "r8", "r9"};
    for (int i = 0; i < node->stmt_count && i < 6; i++) {
        codegen_expr(cg, node->stmts[i]);
        fprintf(cg->out, "    movq %%rax, %%%s\\n", regs[i]);
    }
    fprintf(cg->out, "    call %s\\n", node->name);
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Реализуйте оптимизацию константных выражений',
      description:
        'Добавьте простую оптимизацию: если оба операнда бинарной операции — константы, вычислите результат на этапе компиляции (constant folding). Например, `3 + 5` должно компилироваться как `movq $8, %rax`, а не как три инструкции.',
      hints: [
        'Напишите рекурсивную функцию, которая обходит AST после парсинга',
        'Если у NODE_BINOP оба потомка — NODE_INT, замените узел на NODE_INT с вычисленным значением',
        'Рекурсия должна идти снизу вверх: сначала оптимизируем потомков, затем проверяем текущий узел',
      ],
      solution: `static ASTNode *optimize(ASTNode *node)
{
    if (!node) return NULL;
    node->left = optimize(node->left);
    node->right = optimize(node->right);

    if (node->type == NODE_BINOP &&
        node->left->type == NODE_INT &&
        node->right->type == NODE_INT) {
        int a = node->left->int_val;
        int b = node->right->int_val;
        int result = 0;
        switch (node->op) {
        case T_PLUS:  result = a + b; break;
        case T_MINUS: result = a - b; break;
        case T_STAR:  result = a * b; break;
        case T_SLASH: if (b != 0) result = a / b; break;
        case T_EQ:    result = a == b; break;
        case T_NEQ:   result = a != b; break;
        case T_LT:    result = a < b; break;
        case T_GT:    result = a > b; break;
        default: return node;
        }
        ASTNode *folded = new_node(NODE_INT);
        folded->int_val = result;
        /* Освобождение старых узлов опущено для краткости */
        return folded;
    }
    return node;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
