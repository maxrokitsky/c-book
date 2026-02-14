import type { Chapter } from '../types'

export default {
  id: 'variables-and-types',
  title: 'Переменные и типы данных',
  description: 'int, float, char, размеры типов, литералы',
  blocks: [
    {
      type: 'prose',
      markdown: `# Переменные и типы данных

Переменные — это именованные области памяти, в которых хранятся данные. В C каждая переменная имеет **тип**, который определяет:

- Сколько байт памяти занимает переменная
- Как интерпретируются биты в этой памяти
- Какие операции допустимы

В отличие от Python или JavaScript, C — **статически типизированный** язык: тип переменной задаётся при объявлении и не может измениться.`,
    },
    {
      type: 'prose',
      markdown: `## Объявление и инициализация

В C переменную нужно **объявить** перед использованием. При объявлении указывается тип и имя:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    // Объявление переменных
    int age;            // объявление без инициализации
    int height = 180;   // объявление с инициализацией

    age = 25;           // присваивание значения

    // Объявление нескольких переменных одного типа
    int x = 10, y = 20, z = 30;

    printf("Возраст: %d\\n", age);
    printf("Рост: %d см\\n", height);
    printf("x=%d, y=%d, z=%d\\n", x, y, z);

    return 0;
}`,
      filename: 'variables.c',
    },
    {
      type: 'output',
      content: `Возраст: 25
Рост: 180 см
x=10, y=20, z=30`,
      prompt: '$ gcc variables.c -o variables && ./variables',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Неинициализированные переменные',
      markdown:
        'Если объявить переменную без инициализации (`int age;`), её значение **не определено** — в ней будет «мусор», оставшийся в памяти от предыдущих операций. Чтение неинициализированной переменной — это **неопределённое поведение** (undefined behavior). Всегда инициализируйте переменные!',
    },
    {
      type: 'prose',
      markdown: `## Целочисленные типы

C предоставляет несколько целочисленных типов разного размера:

| Тип | Минимальный размер | Типичный размер (x86-64) | Диапазон (типичный) |
|-----|-------------------|--------------------------|---------------------|
| \`char\` | 1 байт | 1 байт | -128 ... 127 |
| \`short\` | 2 байта | 2 байта | -32 768 ... 32 767 |
| \`int\` | 2 байта | 4 байта | -2 147 483 648 ... 2 147 483 647 |
| \`long\` | 4 байта | 8 байт (Linux) / 4 байта (Windows) | зависит от платформы |
| \`long long\` | 8 байт | 8 байт | -9.2 * 10^18 ... 9.2 * 10^18 |

Каждый из этих типов имеет беззнаковый (unsigned) вариант:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    // Знаковые типы (могут хранить отрицательные значения)
    int temperature = -15;
    long population = 146000000L;

    // Беззнаковые типы (только неотрицательные значения)
    unsigned int students = 30;
    unsigned long file_size = 4294967295UL;

    printf("Температура: %d°C\\n", temperature);
    printf("Население: %ld\\n", population);
    printf("Студенты: %u\\n", students);
    printf("Размер файла: %lu байт\\n", file_size);

    return 0;
}`,
      filename: 'integers.c',
    },
    {
      type: 'output',
      content: `Температура: -15°C
Население: 146000000
Студенты: 30
Размер файла: 4294967295 байт`,
      prompt: '$ gcc integers.c -o integers && ./integers',
    },
    {
      type: 'prose',
      markdown: `## Оператор sizeof

Оператор \`sizeof\` возвращает размер типа или переменной в байтах. Это ключевой инструмент для понимания того, сколько памяти занимают данные:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    printf("Размеры типов на данной платформе:\\n");
    printf("char:        %zu байт\\n", sizeof(char));
    printf("short:       %zu байт\\n", sizeof(short));
    printf("int:         %zu байт\\n", sizeof(int));
    printf("long:        %zu байт\\n", sizeof(long));
    printf("long long:   %zu байт\\n", sizeof(long long));
    printf("float:       %zu байт\\n", sizeof(float));
    printf("double:      %zu байт\\n", sizeof(double));
    printf("long double: %zu байт\\n", sizeof(long double));

    // sizeof работает и с переменными
    int x = 42;
    printf("\\nsizeof(x) = %zu байт\\n", sizeof(x));

    return 0;
}`,
      filename: 'sizes.c',
    },
    {
      type: 'output',
      content: `Размеры типов на данной платформе:
char:        1 байт
short:       2 байт
int:         4 байт
long:        8 байт
long long:   8 байт
float:       4 байт
double:      8 байт
long double: 16 байт

sizeof(x) = 4 байт`,
      prompt: '$ gcc sizes.c -o sizes && ./sizes',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Спецификатор %zu',
      markdown:
        'Для вывода результата `sizeof` используется спецификатор `%zu`, потому что `sizeof` возвращает тип `size_t` — беззнаковое целое, размер которого зависит от платформы. Использование `%d` или `%ld` может дать некорректный результат.',
    },
    {
      type: 'diagram',
      component: 'MemoryVisualizer',
      props: {
        variables: [
          {
            name: 'c',
            type: 'char',
            value: "'A' (65)",
            size: 1,
            address: '0x7ffc00',
          },
          {
            name: 'padding',
            type: '(выравнивание)',
            value: '-',
            size: 3,
            address: '0x7ffc01',
          },
          {
            name: 'x',
            type: 'int',
            value: '42',
            size: 4,
            address: '0x7ffc04',
          },
          {
            name: 'pi',
            type: 'double',
            value: '3.14159',
            size: 8,
            address: '0x7ffc08',
          },
        ],
      },
      caption:
        'Расположение переменных разных типов в памяти. Обратите внимание на выравнивание (padding) после char.',
    },
    {
      type: 'prose',
      markdown: `## Типы с плавающей точкой

Для представления дробных чисел C использует типы с плавающей точкой (стандарт IEEE 754):

| Тип | Размер | Точность | Пример |
|-----|--------|----------|--------|
| \`float\` | 4 байта | ~7 значащих цифр | \`3.14f\` |
| \`double\` | 8 байт | ~15 значащих цифр | \`3.14159265358979\` |
| \`long double\` | 8-16 байт | ~18-33 цифр | \`3.14159265358979L\` |`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    float pi_f = 3.14159265358979323846f;   // суффикс f — float
    double pi_d = 3.14159265358979323846;    // по умолчанию — double
    long double pi_ld = 3.14159265358979323846L; // суффикс L

    printf("float:       %.20f\\n", pi_f);
    printf("double:      %.20f\\n", pi_d);
    printf("long double: %.20Lf\\n", pi_ld);

    // Потеря точности при float
    float a = 1.0f;
    float b = 0.0000001f;
    float sum = a + b;
    printf("\\n1.0 + 0.0000001 = %.10f (float)\\n", sum);

    return 0;
}`,
      filename: 'floats.c',
    },
    {
      type: 'output',
      content: `float:       3.14159274101257324219
double:      3.14159265358979311600
long double: 3.14159265358979323851

1.0 + 0.0000001 = 1.0000001192 (float)`,
      prompt: '$ gcc floats.c -o floats && ./floats',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Погрешности float',
      markdown:
        'Числа с плавающей точкой не могут точно представить все десятичные дроби. Это фундаментальное ограничение двоичного представления. Никогда не сравнивайте `float`/`double` на точное равенство (`==`). Вместо этого проверяйте, что разница меньше допустимой погрешности (epsilon).',
    },
    {
      type: 'prose',
      markdown: `## Символьный тип char

\`char\` — это однобайтовый целочисленный тип, который обычно используется для хранения символов. Символ в одинарных кавычках (\`'A'\`) интерпретируется как его числовой код (ASCII):`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    char letter = 'A';
    char digit = '7';

    // char — это число! Можно выполнять арифметику
    printf("Символ: %c, код: %d\\n", letter, letter);
    printf("Следующая буква: %c\\n", letter + 1);
    printf("Символ '7' - это число %d, а не 7\\n", digit);
    printf("Разность: '7' - '0' = %d\\n", digit - '0');

    // Прописные -> строчные (и наоборот)
    char upper = 'G';
    char lower = upper + 32;  // разница между 'A' и 'a' = 32
    printf("%c -> %c\\n", upper, lower);

    return 0;
}`,
      filename: 'chars.c',
    },
    {
      type: 'output',
      content: `Символ: A, код: 65
Следующая буква: B
Символ '7' - это число 55, а не 7
Разность: '7' - '0' = 7
G -> g`,
      prompt: '$ gcc chars.c -o chars && ./chars',
    },
    {
      type: 'prose',
      markdown: `## Тип _Bool

Начиная с C99, доступен логический тип \`_Bool\`, который может хранить только \`0\` или \`1\`. При подключении заголовка \`<stdbool.h>\` можно использовать более привычные имена:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdbool.h>  // bool, true, false

int main(void)
{
    bool is_ready = true;
    bool is_empty = false;

    printf("is_ready = %d\\n", is_ready);   // 1
    printf("is_empty = %d\\n", is_empty);   // 0
    printf("sizeof(bool) = %zu\\n", sizeof(bool));

    // Любое ненулевое значение — true
    bool truthy = 42;  // станет 1
    printf("truthy = %d\\n", truthy);

    return 0;
}`,
      filename: 'booleans.c',
    },
    {
      type: 'output',
      content: `is_ready = 1
is_empty = 0
sizeof(bool) = 1
truthy = 1`,
      prompt: '$ gcc -std=c17 booleans.c -o booleans && ./booleans',
    },
    {
      type: 'prose',
      markdown: `## Литералы

Литерал — это непосредственное значение в коде. C поддерживает различные формы записи:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void)
{
    // Целочисленные литералы
    int dec = 255;       // десятичный
    int oct = 0377;      // восьмеричный (начинается с 0)
    int hex = 0xFF;      // шестнадцатеричный (начинается с 0x)
    int bin = 0b11111111; // двоичный (C23, поддерживается GCC как расширение)

    printf("dec=%d, oct=%d, hex=%d, bin=%d\\n", dec, oct, hex, bin);

    // Суффиксы для типов
    long big = 100000L;
    unsigned int positive = 42U;
    long long huge = 9000000000LL;
    float precise = 3.14f;

    // Символьные литералы
    char ch = 'Z';
    char esc = '\\n';

    // Строковые литералы
    const char *greeting = "Привет!";
    printf("%s\\n", greeting);

    return 0;
}`,
      filename: 'literals.c',
    },
    {
      type: 'prose',
      markdown: `## Константы

Константа — это переменная, значение которой нельзя изменить после инициализации:`,
    },
    {
      type: 'codeDiff',
      before: `int max_size = 100;
max_size = 200;  // OK — можно изменить`,
      after: `const int max_size = 100;
max_size = 200;  // ОШИБКА компиляции!`,
      language: 'c',
      description:
        'Квалификатор const запрещает изменение переменной после инициализации',
    },
    {
      type: 'quiz',
      question: 'Каков гарантированный минимальный размер типа int в стандарте C?',
      options: ['1 байт', '2 байта', '4 байта', '8 байт'],
      correctIndex: 1,
      explanation:
        'Стандарт C гарантирует, что `int` занимает не менее 2 байт (16 бит). На большинстве современных платформ `int` равен 4 байтам, но стандарт требует лишь минимум 16 бит. Именно поэтому для портируемого кода важно не делать предположений о размере типов.',
    },
    {
      type: 'quiz',
      question: 'Что произойдёт при чтении неинициализированной локальной переменной?',
      options: [
        'Переменная будет равна 0',
        'Программа выдаст ошибку компиляции',
        'Неопределённое поведение (undefined behavior)',
        'Переменная будет равна -1',
      ],
      correctIndex: 2,
      explanation:
        'Чтение неинициализированной локальной переменной — это неопределённое поведение (undefined behavior). Компилятор может предупредить, но не обязан генерировать ошибку. Значение может быть любым — это «мусор» в памяти. Глобальные переменные, в отличие от локальных, инициализируются нулями.',
    },
    {
      type: 'exercise',
      title: 'Размеры типов',
      description: `Напишите программу, которая:
1. Объявляет переменные каждого основного типа: \`char\`, \`short\`, \`int\`, \`long\`, \`long long\`, \`float\`, \`double\`
2. Для каждой переменной выводит:
   - Имя типа
   - Размер в байтах (используя \`sizeof\`)
   - Размер в битах (байты * 8)

Пример вывода:
\`\`\`
char:        1 байт  (8 бит)
short:       2 байт  (16 бит)
int:         4 байт  (32 бит)
...
\`\`\``,
      hints: [
        'Используйте sizeof(тип) или sizeof(переменная)',
        'Для вывода результата sizeof используйте %zu',
        'Чтобы получить биты, умножьте байты на 8',
      ],
      solution: `#include <stdio.h>

int main(void)
{
    printf("char:        %zu байт  (%zu бит)\\n", sizeof(char), sizeof(char) * 8);
    printf("short:       %zu байт  (%zu бит)\\n", sizeof(short), sizeof(short) * 8);
    printf("int:         %zu байт  (%zu бит)\\n", sizeof(int), sizeof(int) * 8);
    printf("long:        %zu байт  (%zu бит)\\n", sizeof(long), sizeof(long) * 8);
    printf("long long:   %zu байт  (%zu бит)\\n", sizeof(long long), sizeof(long long) * 8);
    printf("float:       %zu байт  (%zu бит)\\n", sizeof(float), sizeof(float) * 8);
    printf("double:      %zu байт  (%zu бит)\\n", sizeof(double), sizeof(double) * 8);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
