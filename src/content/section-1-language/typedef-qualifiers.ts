import type { Chapter } from '../types'

export default {
  id: 'typedef-qualifiers',
  title: 'typedef и квалификаторы',
  description: 'typedef, const, volatile, restrict',
  blocks: [
    {
      type: 'prose',
      markdown: `# typedef и квалификаторы типов

В этой главе мы рассмотрим средства языка C для создания **псевдонимов типов** (\`typedef\`) и **квалификаторы**, которые сообщают компилятору дополнительную информацию о переменных: \`const\`, \`volatile\` и \`restrict\`.`,
    },
    {
      type: 'prose',
      markdown: `## typedef — псевдонимы типов

Ключевое слово \`typedef\` создаёт новое имя для существующего типа. Это не создаёт новый тип, а лишь вводит синоним, который улучшает читаемость и упрощает поддержку кода.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdint.h>

/* Простые псевдонимы */
typedef unsigned long ulong;
typedef unsigned char byte;

/* typedef для структур — самый частый случай */
typedef struct {
    double x;
    double y;
} Point;

/* typedef для указателей на функции */
typedef int (*Comparator)(const void *, const void *);

/* typedef для массивов */
typedef int Matrix3x3[3][3];

int compare_ints(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int main(void) {
    ulong big = 4000000000UL;
    byte b = 255;
    printf("big = %lu, b = %u\\n", big, b);

    /* Благодаря typedef не нужен «struct» при объявлении */
    Point p = {3.0, 4.0};
    printf("Point: (%.1f, %.1f)\\n", p.x, p.y);

    /* Указатель на функцию через typedef */
    Comparator cmp = compare_ints;
    int a = 10, b2 = 20;
    printf("compare(10, 20) = %d\\n", cmp(&a, &b2));

    /* Массив через typedef */
    Matrix3x3 m = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    printf("m[1][2] = %d\\n", m[1][2]);

    return 0;
}`,
      filename: 'typedef_demo.c',
    },
    {
      type: 'output',
      content: `big = 4000000000, b = 255
Point: (3.0, 4.0)
compare(10, 20) = -10
m[1][2] = 6`,
      prompt: '$ gcc typedef_demo.c -o typedef_demo && ./typedef_demo',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Когда использовать typedef',
      markdown: `Хорошие случаи для \`typedef\`:
- **Структуры**: избавляет от повторения \`struct\` при каждом объявлении
- **Указатели на функции**: делает объявления читаемыми
- **Платформо-зависимые типы**: \`typedef uint32_t pixel_t;\` — при смене платформы меняется только typedef
- **Абстракция**: \`typedef void *Handle;\` — скрывает реализацию

Плохие случаи:
- Сокрытие указателя: \`typedef int *IntPtr;\` — скрывает важную семантику
- Избыточные псевдонимы: \`typedef int Integer;\` — не добавляет ясности`,
    },
    {
      type: 'prose',
      markdown: `## const — неизменяемость

Квалификатор \`const\` указывает, что значение не должно изменяться после инициализации. Попытка модификации \`const\`-переменной приводит к ошибке компиляции.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    const int MAX_SIZE = 100;
    /* MAX_SIZE = 200;  — ошибка компиляции */

    /* const с указателями — четыре варианта */
    int x = 10, y = 20;

    const int *p1 = &x;      /* указатель на const int */
    /* *p1 = 30;  — ОШИБКА: нельзя изменить значение */
    p1 = &y;                  /* OK: можно изменить сам указатель */

    int *const p2 = &x;      /* const-указатель на int */
    *p2 = 30;                 /* OK: можно изменить значение */
    /* p2 = &y;  — ОШИБКА: нельзя изменить указатель */

    const int *const p3 = &x; /* const-указатель на const int */
    /* *p3 = 40;  — ОШИБКА */
    /* p3 = &y;   — ОШИБКА */

    printf("x = %d\\n", x);    /* 30 (изменён через p2) */

    return 0;
}`,
      filename: 'const_demo.c',
    },
    {
      type: 'codeDiff',
      before: `void process_data(char *data, int len) {
    /* data может быть случайно изменён */
}`,
      after: `void process_data(const char *data, int len) {
    /* компилятор защитит от изменения data */
}`,
      language: 'c',
      description: 'Добавление const к параметрам, которые функция не должна изменять — хорошая практика, документирующая намерение',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Правило чтения const',
      markdown: `Читайте объявление **справа налево**:
- \`const int *p\` — p это указатель на int, который const → нельзя менять \`*p\`
- \`int *const p\` — p это const указатель на int → нельзя менять \`p\`
- \`const int *const p\` — p это const указатель на const int → нельзя менять ни \`p\`, ни \`*p\``,
    },
    {
      type: 'prose',
      markdown: `## volatile — запрет оптимизации

Квалификатор \`volatile\` сообщает компилятору, что значение переменной может изменяться **вне контроля программы** — например, аппаратным регистром, обработчиком прерывания или другим потоком. Компилятор не будет кешировать такую переменную в регистре и не оптимизирует обращения к ней.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <signal.h>

/* Без volatile компилятор может оптимизировать цикл
   в бесконечный, решив, что flag никогда не меняется */
volatile sig_atomic_t flag = 0;

void handler(int sig) {
    (void)sig;
    flag = 1;
}

int main(void) {
    signal(SIGINT, handler);

    printf("Ожидание Ctrl+C...\\n");
    while (!flag) {
        /* ожидание — volatile гарантирует,
           что flag читается из памяти каждую итерацию */
    }
    printf("Получен сигнал, завершаемся\\n");

    return 0;
}`,
      filename: 'volatile_demo.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'volatile не заменяет синхронизацию',
      markdown: `\`volatile\` гарантирует только то, что компилятор не оптимизирует чтение/запись. Он **не обеспечивает**:
- Атомарность операций
- Барьеры памяти
- Порядок выполнения операций другими потоками

Для многопоточного кода используйте \`_Atomic\` (C11) или средства \`<threads.h>\`.`,
    },
    {
      type: 'prose',
      markdown: `## restrict — обещание неперекрытия

Квалификатор \`restrict\` (C99) применяется к указателям и говорит компилятору, что данный указатель — **единственный** способ доступа к области памяти, на которую он ссылается. Это позволяет компилятору генерировать более эффективный код.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

/* Без restrict компилятор не знает, перекрываются ли a и b,
   и вынужден перечитывать данные после каждой записи */
void add_arrays(int *restrict dst,
                const int *restrict src1,
                const int *restrict src2,
                int n)
{
    for (int i = 0; i < n; i++)
        dst[i] = src1[i] + src2[i];
}

int main(void) {
    int a[] = {1, 2, 3, 4};
    int b[] = {10, 20, 30, 40};
    int c[4];

    add_arrays(c, a, b, 4);

    for (int i = 0; i < 4; i++)
        printf("c[%d] = %d\\n", i, c[i]);

    /* memcpy использует restrict, а memmove — нет */
    /* memcpy(dst, src, n)  — src и dst не должны перекрываться */
    /* memmove(dst, src, n) — src и dst могут перекрываться */

    return 0;
}`,
      filename: 'restrict_demo.c',
    },
    {
      type: 'output',
      content: `c[0] = 11
c[1] = 22
c[2] = 33
c[3] = 44`,
      prompt: '$ gcc -O2 restrict_demo.c -o restrict_demo && ./restrict_demo',
    },
    {
      type: 'quiz',
      question: 'Что означает объявление const int *p?',
      options: [
        'p — константный указатель, его нельзя перенаправить',
        'Значение *p нельзя изменить через p',
        'Ни p, ни *p нельзя изменить',
        'p указывает на статическую переменную',
      ],
      correctIndex: 1,
      explanation: 'const int *p означает «указатель на const int» — через p нельзя изменить значение, на которое он указывает (*p = 5 вызовет ошибку). Но сам указатель p можно перенаправить на другой адрес (p = &y).',
    },
    {
      type: 'exercise',
      title: 'Typedef для связного списка',
      description: 'Используя `typedef`, определите тип `Node` для узла односвязного списка (содержит `int data` и указатель `next` на следующий узел). Напишите функции `Node *node_create(int data)`, `void list_push_front(Node **head, int data)` и `void list_print(const Node *head)`. Не забудьте освобождение памяти.',
      hints: [
        'Для самоссылающейся структуры нужен тег: typedef struct Node { ... } Node;',
        'node_create выделяет память через malloc и инициализирует поля',
        'list_push_front создаёт новый узел и ставит его в начало',
        'Для освобождения пройдите список, сохраняя next перед free',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *node_create(int data) {
    Node *n = malloc(sizeof *n);
    if (!n) return NULL;
    n->data = data;
    n->next = NULL;
    return n;
}

void list_push_front(Node **head, int data) {
    Node *n = node_create(data);
    if (!n) return;
    n->next = *head;
    *head = n;
}

void list_print(const Node *head) {
    for (const Node *cur = head; cur; cur = cur->next)
        printf("%d -> ", cur->data);
    printf("NULL\\n");
}

void list_free(Node *head) {
    while (head) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}

int main(void) {
    Node *list = NULL;
    list_push_front(&list, 30);
    list_push_front(&list, 20);
    list_push_front(&list, 10);

    list_print(list);  /* 10 -> 20 -> 30 -> NULL */
    list_free(list);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
