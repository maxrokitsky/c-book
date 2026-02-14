import type { Chapter } from '../types'

export default {
  id: 'structs',
  title: 'Структуры',
  description: 'struct, вложенные структуры, массивы структур',
  blocks: [
    {
      type: 'prose',
      markdown: `# Структуры

Структура (\`struct\`) — это составной тип данных, объединяющий несколько переменных (полей) под одним именем. В отличие от массива, поля структуры могут иметь **разные типы**. Структуры — основной инструмент организации данных в C.`,
    },
    {
      type: 'prose',
      markdown: `## Объявление и инициализация

Структура объявляется ключевым словом \`struct\`, за которым следует необязательное имя тега и список полей в фигурных скобках.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

struct Point {
    double x;
    double y;
};

struct Student {
    char name[50];
    int age;
    double gpa;
};

int main(void) {
    /* Инициализация при объявлении */
    struct Point p1 = {3.0, 4.0};
    struct Point p2 = {.x = 1.0, .y = 2.0};  /* designated initializer (C99) */

    printf("p1 = (%.1f, %.1f)\\n", p1.x, p1.y);
    printf("p2 = (%.1f, %.1f)\\n", p2.x, p2.y);

    /* Инициализация по полям */
    struct Student s;
    strcpy(s.name, "Иван");
    s.age = 20;
    s.gpa = 4.5;

    printf("\\n%s, %d лет, средний балл: %.1f\\n", s.name, s.age, s.gpa);

    return 0;
}`,
      filename: 'struct_basic.c',
    },
    {
      type: 'output',
      content: `p1 = (3.0, 4.0)
p2 = (1.0, 2.0)

Иван, 20 лет, средний балл: 4.5`,
      prompt: '$ gcc struct_basic.c -o struct_basic && ./struct_basic',
    },
    {
      type: 'diagram',
      component: 'StructLayoutDiagram',
      props: {
        title: 'Размещение struct Student в памяти',
        structName: 'Student',
        fields: [
          { name: 'name', type: 'char[50]', size: 50 },
          { name: 'padding', type: '(выравнивание)', size: 2 },
          { name: 'age', type: 'int', size: 4 },
          { name: 'gpa', type: 'double', size: 8 },
        ],
      },
      caption: 'Компилятор может вставлять байты выравнивания (padding) между полями',
    },
    {
      type: 'prose',
      markdown: `## Указатели на структуры и оператор ->

Для доступа к полям через указатель на структуру используется оператор \`->\`. Выражение \`p->field\` эквивалентно \`(*p).field\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <math.h>

struct Point {
    double x;
    double y;
};

double distance(const struct Point *a, const struct Point *b) {
    double dx = a->x - b->x;
    double dy = a->y - b->y;
    return sqrt(dx * dx + dy * dy);
}

void translate(struct Point *p, double dx, double dy) {
    p->x += dx;
    p->y += dy;
}

int main(void) {
    struct Point a = {0.0, 0.0};
    struct Point b = {3.0, 4.0};

    printf("Расстояние: %.2f\\n", distance(&a, &b));

    translate(&a, 1.0, 1.0);
    printf("a после сдвига: (%.1f, %.1f)\\n", a.x, a.y);

    return 0;
}`,
      filename: 'struct_pointer.c',
    },
    {
      type: 'output',
      content: `Расстояние: 5.00
a после сдвига: (1.0, 1.0)`,
      prompt: '$ gcc struct_pointer.c -lm -o struct_pointer && ./struct_pointer',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Передача по указателю',
      markdown: `Структуры передаются в функции **по значению** — создаётся полная копия. Для больших структур это неэффективно. Используйте указатель:
- \`const struct T *p\` — если функция только читает данные
- \`struct T *p\` — если функция модифицирует данные`,
    },
    {
      type: 'prose',
      markdown: `## Вложенные структуры

Поля структуры могут сами быть структурами, что позволяет строить иерархические типы данных.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

struct Date {
    int day;
    int month;
    int year;
};

struct Address {
    char city[50];
    char street[100];
    int building;
};

struct Employee {
    char name[100];
    struct Date birth_date;
    struct Address address;
    double salary;
};

void print_employee(const struct Employee *e) {
    printf("Имя: %s\\n", e->name);
    printf("Дата рождения: %02d.%02d.%d\\n",
           e->birth_date.day, e->birth_date.month, e->birth_date.year);
    printf("Адрес: г. %s, ул. %s, д. %d\\n",
           e->address.city, e->address.street, e->address.building);
    printf("Зарплата: %.2f\\n", e->salary);
}

int main(void) {
    struct Employee emp = {
        .name = "Петров Алексей",
        .birth_date = {.day = 15, .month = 3, .year = 1990},
        .address = {
            .city = "Москва",
            .street = "Тверская",
            .building = 12
        },
        .salary = 120000.0
    };

    print_employee(&emp);
    return 0;
}`,
      filename: 'nested_struct.c',
    },
    {
      type: 'prose',
      markdown: `## Массивы структур

Массивы структур — основной способ хранения коллекций однотипных записей.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

struct Product {
    char name[50];
    double price;
    int quantity;
};

struct Product *find_cheapest(struct Product *products, int n) {
    struct Product *cheapest = &products[0];
    for (int i = 1; i < n; i++) {
        if (products[i].price < cheapest->price)
            cheapest = &products[i];
    }
    return cheapest;
}

int main(void) {
    struct Product shop[] = {
        {"Хлеб",    45.50,  100},
        {"Молоко",  82.00,   50},
        {"Масло",  130.00,   30},
        {"Сыр",    250.00,   20},
        {"Яйца",    90.00,   60},
    };
    int n = sizeof shop / sizeof shop[0];

    printf("%-12s %10s %10s\\n", "Товар", "Цена", "Кол-во");
    printf("%-12s %10s %10s\\n", "------", "------", "------");
    for (int i = 0; i < n; i++) {
        printf("%-12s %10.2f %10d\\n",
               shop[i].name, shop[i].price, shop[i].quantity);
    }

    struct Product *cheap = find_cheapest(shop, n);
    printf("\\nСамый дешёвый: %s (%.2f руб.)\\n", cheap->name, cheap->price);

    return 0;
}`,
      filename: 'array_of_structs.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Выравнивание и sizeof',
      markdown: `Размер структуры может быть **больше** суммы размеров её полей из-за выравнивания (padding). Компилятор вставляет неиспользуемые байты, чтобы каждое поле начиналось с адреса, кратного его выравниванию. Порядок полей влияет на итоговый размер:

\`\`\`c
struct A { char a; double b; char c; };  /* sizeof может быть 24 */
struct B { double b; char a; char c; };  /* sizeof может быть 16 */
\`\`\`

Располагайте поля от большего к меньшему для минимизации padding.`,
    },
    {
      type: 'quiz',
      question: 'Какой оператор используется для доступа к полю структуры через указатель?',
      options: [
        'Оператор . (точка)',
        'Оператор -> (стрелка)',
        'Оператор :: (двойное двоеточие)',
        'Оператор * (разыменование)',
      ],
      correctIndex: 1,
      explanation: 'Оператор -> используется для доступа к полю структуры через указатель. Выражение p->field эквивалентно (*p).field. Оператор . используется при прямом доступе (не через указатель).',
    },
    {
      type: 'exercise',
      title: 'Стек на основе структуры',
      description: 'Реализуйте простой стек целых чисел с помощью структуры. Определите `struct Stack` с массивом `data[100]` и полем `top`. Напишите функции `stack_init`, `stack_push`, `stack_pop` и `stack_is_empty`, принимающие указатель на `struct Stack`.',
      hints: [
        'В stack_init установите top в 0 (или -1, в зависимости от конвенции)',
        'В stack_push увеличивайте top и записывайте значение',
        'В stack_pop считывайте значение и уменьшайте top',
        'Не забудьте проверки на переполнение и пустой стек',
      ],
      solution: `#include <stdio.h>
#include <stdbool.h>

#define STACK_MAX 100

struct Stack {
    int data[STACK_MAX];
    int top;
};

void stack_init(struct Stack *s) {
    s->top = 0;
}

bool stack_is_empty(const struct Stack *s) {
    return s->top == 0;
}

bool stack_push(struct Stack *s, int value) {
    if (s->top >= STACK_MAX) return false;
    s->data[s->top++] = value;
    return true;
}

bool stack_pop(struct Stack *s, int *out) {
    if (stack_is_empty(s)) return false;
    *out = s->data[--s->top];
    return true;
}

int main(void) {
    struct Stack s;
    stack_init(&s);

    stack_push(&s, 10);
    stack_push(&s, 20);
    stack_push(&s, 30);

    int val;
    while (stack_pop(&s, &val))
        printf("%d\\n", val);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
