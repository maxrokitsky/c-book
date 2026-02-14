import type { Chapter } from '../types'

export default {
  id: 'bitwise',
  title: 'Побитовые операции',
  description: 'AND, OR, XOR, сдвиги, битовые маски и флаги',
  blocks: [
    {
      type: 'prose',
      markdown: `# Побитовые операции в C

Побитовые операции работают с **отдельными битами** целочисленных значений. Они применяются в системном программировании, работе с оборудованием, сетевых протоколах, криптографии и оптимизации.

C предоставляет шесть побитовых операторов:

| Оператор | Название | Описание |
|----------|----------|----------|
| \`&\` | AND | Бит = 1, если оба бита = 1 |
| \`\\|\` | OR | Бит = 1, если хотя бы один бит = 1 |
| \`^\` | XOR | Бит = 1, если биты различаются |
| \`~\` | NOT | Инвертирует все биты |
| \`<<\` | Сдвиг влево | Сдвигает биты влево, заполняя нулями |
| \`>>\` | Сдвиг вправо | Сдвигает биты вправо |`,
    },
    {
      type: 'diagram',
      component: 'BitRepresentation',
      props: {
        title: 'Побитовые операции AND, OR, XOR',
        rows: [
          { label: 'A', value: 0b11001010, bits: 8 },
          { label: 'B', value: 0b10101100, bits: 8 },
          { label: 'A & B', value: 0b10001000, bits: 8 },
          { label: 'A | B', value: 0b11101110, bits: 8 },
          { label: 'A ^ B', value: 0b01100110, bits: 8 },
        ],
      },
      caption: 'Результаты побитовых операций для A = 0xCA и B = 0xAC',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

void print_binary(unsigned char val) {
    for (int i = 7; i >= 0; i--) {
        putchar((val >> i) & 1 ? '1' : '0');
        if (i == 4) putchar(' ');  /* Разделитель для наглядности */
    }
}

int main(void) {
    unsigned char a = 0xCA;  /* 1100 1010 */
    unsigned char b = 0xAC;  /* 1010 1100 */

    printf("a     = "); print_binary(a); printf("  (0x%02X)\\n", a);
    printf("b     = "); print_binary(b); printf("  (0x%02X)\\n", b);
    printf("a & b = "); print_binary(a & b); printf("  (0x%02X)\\n", a & b);
    printf("a | b = "); print_binary(a | b); printf("  (0x%02X)\\n", a | b);
    printf("a ^ b = "); print_binary(a ^ b); printf("  (0x%02X)\\n", a ^ b);
    printf("~a    = "); print_binary(~a); printf("  (0x%02X)\\n", (unsigned char)~a);

    return 0;
}`,
      filename: 'bitwise_basics.c',
    },
    {
      type: 'output',
      content: `a     = 1100 1010  (0xCA)
b     = 1010 1100  (0xAC)
a & b = 1000 1000  (0x88)
a | b = 1110 1110  (0xEE)
a ^ b = 0110 0110  (0x66)
~a    = 0011 0101  (0x35)`,
    },
    {
      type: 'prose',
      markdown: `## Битовые сдвиги

Сдвиг влево \`<<\` умножает число на степень двойки, сдвиг вправо \`>>\` — делит. Для беззнаковых типов сдвиг вправо всегда заполняет нулями (логический сдвиг). Для знаковых типов поведение определяется реализацией (обычно арифметический сдвиг — заполнение знаковым битом).`,
    },
    {
      type: 'diagram',
      component: 'BitRepresentation',
      props: {
        title: 'Битовые сдвиги числа 0x1A',
        rows: [
          { label: 'x', value: 0b00011010, bits: 8 },
          { label: 'x << 2', value: 0b01101000, bits: 8 },
          { label: 'x >> 1', value: 0b00001101, bits: 8 },
        ],
      },
      caption: 'Сдвиг влево на 2 = умножение на 4, сдвиг вправо на 1 = деление на 2',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    unsigned int x = 26;  /* 0001 1010 */

    printf("x      = %u\\n", x);
    printf("x << 1 = %u  (умножение на 2)\\n", x << 1);
    printf("x << 2 = %u  (умножение на 4)\\n", x << 2);
    printf("x >> 1 = %u  (деление на 2)\\n", x >> 1);
    printf("x >> 2 = %u  (деление на 4)\\n", x >> 2);

    /* Быстрое возведение 1 в позицию N */
    for (int n = 0; n < 8; n++) {
        printf("1 << %d = %3u  (бит %d)\\n", n, 1U << n, n);
    }

    return 0;
}`,
      filename: 'shifts.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Неопределённое поведение при сдвигах',
      markdown:
        'Сдвиг на отрицательное число или на величину, большую или равную '
        + 'ширине типа, — это **неопределённое поведение**. Например, '
        + '`1 << 32` для 32-битного `int` — UB. Сдвиг влево знакового '
        + 'числа, приводящий к переполнению, тоже UB (до C23).',
    },
    {
      type: 'prose',
      markdown: `## Битовые маски и флаги

Одно из главных применений побитовых операций — **битовые флаги**. Каждый бит числа хранит отдельный булев параметр, что экономит память и позволяет комбинировать флаги.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Определяем флаги как степени двойки */
#define PERM_READ    (1U << 0)  /* 0001 */
#define PERM_WRITE   (1U << 1)  /* 0010 */
#define PERM_EXECUTE (1U << 2)  /* 0100 */
#define PERM_DELETE  (1U << 3)  /* 1000 */

void print_permissions(unsigned int perms) {
    printf("[%c%c%c%c]",
        (perms & PERM_READ)    ? 'r' : '-',
        (perms & PERM_WRITE)   ? 'w' : '-',
        (perms & PERM_EXECUTE) ? 'x' : '-',
        (perms & PERM_DELETE)  ? 'd' : '-');
}

int main(void) {
    unsigned int perms = 0;

    /* Установить флаги (OR) */
    perms |= PERM_READ;
    perms |= PERM_WRITE;
    printf("После добавления r+w: ");
    print_permissions(perms);
    printf("\\n");

    /* Добавить ещё один флаг */
    perms |= PERM_EXECUTE;
    printf("После добавления x:   ");
    print_permissions(perms);
    printf("\\n");

    /* Снять флаг (AND NOT) */
    perms &= ~PERM_WRITE;
    printf("После удаления w:     ");
    print_permissions(perms);
    printf("\\n");

    /* Переключить флаг (XOR) */
    perms ^= PERM_DELETE;
    printf("После toggle d:       ");
    print_permissions(perms);
    printf("\\n");

    /* Проверить флаг (AND) */
    if (perms & PERM_READ) {
        printf("Чтение разрешено\\n");
    }

    return 0;
}`,
      filename: 'bit_flags.c',
    },
    {
      type: 'output',
      content: `После добавления r+w: [rw--]
После добавления x:   [rwx-]
После удаления w:     [r-x-]
После toggle d:       [r-xd]
Чтение разрешено`,
    },
    {
      type: 'prose',
      markdown: `## Полезные битовые приёмы

Побитовые операции позволяют элегантно решать некоторые задачи без ветвлений и дополнительных переменных.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    /* 1. Проверка чётности */
    int n = 42;
    printf("%d %s\\n", n, (n & 1) ? "нечётное" : "чётное");

    /* 2. Обмен двух переменных без временной (XOR swap) */
    int a = 5, b = 9;
    a ^= b;
    b ^= a;
    a ^= b;
    printf("a = %d, b = %d\\n", a, b);  /* a = 9, b = 5 */

    /* 3. Проверка: является ли число степенью двойки */
    unsigned int x = 64;
    if (x && !(x & (x - 1))) {
        printf("%u — степень двойки\\n", x);
    }

    /* 4. Подсчёт установленных битов (popcount) */
    unsigned int val = 0xAB;  /* 1010 1011 = 5 бит */
    int count = 0;
    unsigned int tmp = val;
    while (tmp) {
        count += tmp & 1;
        tmp >>= 1;
    }
    printf("Количество единичных бит в 0x%X: %d\\n", val, count);

    /* 5. Выделение младшего установленного бита */
    unsigned int y = 0b10110000;
    unsigned int lowest = y & (-y);
    printf("Младший установленный бит: %u (позиция %d)\\n",
           lowest, __builtin_ctz(y));

    return 0;
}`,
      filename: 'bit_tricks.c',
    },
    {
      type: 'quiz',
      question: 'Какой результат выражения `0b1100 & 0b1010`?',
      options: [
        '0b1110 (14)',
        '0b1000 (8)',
        '0b0110 (6)',
        '0b0010 (2)',
      ],
      correctIndex: 1,
      explanation:
        'Операция AND (&) возвращает 1 только там, где оба бита равны 1. '
        + '1100 & 1010: бит 3 — оба 1 (результат 1), бит 2 — 1 и 0 (результат 0), '
        + 'бит 1 — 0 и 1 (результат 0), бит 0 — 0 и 0 (результат 0). Итого: 1000 = 8.',
    },
    {
      type: 'exercise',
      title: 'Битовое поле для хранения RGB-цвета',
      description:
        'Реализуйте функции для упаковки и распаковки RGB-цвета в одно 32-битное число. '
        + 'Формат: биты [23:16] — красный, [15:8] — зелёный, [7:0] — синий. '
        + 'Напишите: `uint32_t rgb_pack(uint8_t r, uint8_t g, uint8_t b)` и '
        + '`void rgb_unpack(uint32_t color, uint8_t *r, uint8_t *g, uint8_t *b)`.',
      hints: [
        'Для упаковки используйте сдвиг влево и OR: (r << 16) | (g << 8) | b',
        'Для распаковки используйте сдвиг вправо и маску AND: (color >> 16) & 0xFF',
      ],
      solution: `#include <stdio.h>
#include <stdint.h>

uint32_t rgb_pack(uint8_t r, uint8_t g, uint8_t b) {
    return ((uint32_t)r << 16) | ((uint32_t)g << 8) | (uint32_t)b;
}

void rgb_unpack(uint32_t color, uint8_t *r, uint8_t *g, uint8_t *b) {
    *r = (color >> 16) & 0xFF;
    *g = (color >> 8) & 0xFF;
    *b = color & 0xFF;
}

int main(void) {
    uint32_t coral = rgb_pack(255, 127, 80);
    printf("Упакованный цвет: 0x%06X\\n", coral);

    uint8_t r, g, b;
    rgb_unpack(coral, &r, &g, &b);
    printf("R=%u, G=%u, B=%u\\n", r, g, b);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
