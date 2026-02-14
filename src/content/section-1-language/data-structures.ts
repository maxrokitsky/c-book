import type { Chapter } from '../types'

export default {
  id: 'data-structures',
  title: 'Структуры данных на C',
  description: 'Связные списки, стеки, очереди, деревья, хеш-таблицы',
  blocks: [
    {
      type: 'prose',
      markdown:
        'В C нет встроенных контейнеров, как в C++ или Java. Все классические структуры данных реализуются вручную с помощью `struct`, указателей и динамической памяти. Это даёт полный контроль над расположением данных в памяти и их временем жизни, но требует аккуратности: каждый `malloc` должен иметь соответствующий `free`, а каждый указатель — быть валидным.',
    },
    {
      type: 'prose',
      markdown:
        '## Односвязный список\n\nОдносвязный список — простейшая динамическая структура данных. Каждый узел хранит значение и указатель на следующий узел. Последний узел указывает на `NULL`.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *node_create(int data) {
    Node *n = malloc(sizeof(Node));
    if (!n) {
        perror("malloc");
        exit(EXIT_FAILURE);
    }
    n->data = data;
    n->next = NULL;
    return n;
}

void list_push_front(Node **head, int data) {
    Node *n = node_create(data);
    n->next = *head;
    *head = n;
}

void list_print(const Node *head) {
    for (const Node *cur = head; cur; cur = cur->next) {
        printf("%d -> ", cur->data);
    }
    printf("NULL\\n");
}

void list_free(Node *head) {
    while (head) {
        Node *tmp = head;
        head = head->next;
        free(tmp);
    }
}

int main(void) {
    Node *list = NULL;
    list_push_front(&list, 30);
    list_push_front(&list, 20);
    list_push_front(&list, 10);
    list_print(list);
    list_free(list);
    return 0;
}`,
      filename: 'linked_list.c',
    },
    {
      type: 'output',
      content: '10 -> 20 -> 30 -> NULL',
      prompt: '$ gcc linked_list.c -o linked_list && ./linked_list',
    },
    {
      type: 'diagram',
      component: 'LinkedListDiagram',
      props: {
        nodes: [
          { value: '10', label: 'head' },
          { value: '20' },
          { value: '30' },
          { value: 'NULL' },
        ],
      },
      caption: 'Односвязный список после трёх вставок в начало',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Указатель на указатель',
      markdown:
        'Функция `list_push_front` принимает `Node **head`, а не `Node *head`. Это необходимо, чтобы функция могла изменить сам указатель `head` в вызывающем коде. Без двойного указателя изменение `head` внутри функции не было бы видно снаружи.',
    },
    {
      type: 'prose',
      markdown:
        '## Стек на основе массива\n\nСтек (LIFO — Last In, First Out) легко реализовать на основе динамического массива. Операции `push` и `pop` работают за O(1) амортизированного времени.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} Stack;

Stack stack_create(size_t initial_cap) {
    Stack s = {
        .data = malloc(initial_cap * sizeof(int)),
        .size = 0,
        .capacity = initial_cap,
    };
    if (!s.data) {
        perror("malloc");
        exit(EXIT_FAILURE);
    }
    return s;
}

void stack_push(Stack *s, int value) {
    if (s->size == s->capacity) {
        s->capacity *= 2;
        s->data = realloc(s->data, s->capacity * sizeof(int));
        if (!s->data) {
            perror("realloc");
            exit(EXIT_FAILURE);
        }
    }
    s->data[s->size++] = value;
}

bool stack_pop(Stack *s, int *out) {
    if (s->size == 0) return false;
    *out = s->data[--s->size];
    return true;
}

void stack_destroy(Stack *s) {
    free(s->data);
    s->data = NULL;
    s->size = s->capacity = 0;
}

int main(void) {
    Stack s = stack_create(4);
    stack_push(&s, 10);
    stack_push(&s, 20);
    stack_push(&s, 30);

    int val;
    while (stack_pop(&s, &val)) {
        printf("popped: %d\\n", val);
    }
    stack_destroy(&s);
    return 0;
}`,
      filename: 'stack.c',
    },
    {
      type: 'output',
      content: 'popped: 30\npopped: 20\npopped: 10',
      prompt: '$ gcc stack.c -o stack && ./stack',
    },
    {
      type: 'prose',
      markdown:
        '## Очередь на основе кольцевого буфера\n\nОчередь (FIFO — First In, First Out) эффективно реализуется с помощью кольцевого буфера. Два индекса — `head` и `tail` — позволяют добавлять и извлекать элементы за O(1) без сдвигов массива.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct {
    int *buf;
    size_t head;
    size_t tail;
    size_t capacity;
    size_t count;
} Queue;

Queue queue_create(size_t cap) {
    Queue q = {
        .buf = malloc(cap * sizeof(int)),
        .head = 0, .tail = 0,
        .capacity = cap, .count = 0,
    };
    if (!q.buf) { perror("malloc"); exit(EXIT_FAILURE); }
    return q;
}

bool queue_enqueue(Queue *q, int value) {
    if (q->count == q->capacity) return false; /* полна */
    q->buf[q->tail] = value;
    q->tail = (q->tail + 1) % q->capacity;
    q->count++;
    return true;
}

bool queue_dequeue(Queue *q, int *out) {
    if (q->count == 0) return false;
    *out = q->buf[q->head];
    q->head = (q->head + 1) % q->capacity;
    q->count--;
    return true;
}

void queue_destroy(Queue *q) {
    free(q->buf);
}

int main(void) {
    Queue q = queue_create(8);
    queue_enqueue(&q, 1);
    queue_enqueue(&q, 2);
    queue_enqueue(&q, 3);

    int val;
    while (queue_dequeue(&q, &val)) {
        printf("dequeued: %d\\n", val);
    }
    queue_destroy(&q);
    return 0;
}`,
      filename: 'queue.c',
    },
    {
      type: 'prose',
      markdown:
        '## Хеш-таблица\n\nХеш-таблица обеспечивает поиск, вставку и удаление за амортизированное O(1). Ниже приведена реализация с разрешением коллизий методом цепочек (chaining).',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 64

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry *buckets[TABLE_SIZE];
} HashTable;

static unsigned hash(const char *key) {
    unsigned h = 5381;
    for (; *key; key++) {
        h = ((h << 5) + h) + (unsigned char)*key; /* djb2 */
    }
    return h % TABLE_SIZE;
}

void ht_set(HashTable *ht, const char *key, int value) {
    unsigned idx = hash(key);
    for (Entry *e = ht->buckets[idx]; e; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            e->value = value;
            return;
        }
    }
    Entry *e = malloc(sizeof(Entry));
    e->key = strdup(key);
    e->value = value;
    e->next = ht->buckets[idx];
    ht->buckets[idx] = e;
}

int *ht_get(HashTable *ht, const char *key) {
    unsigned idx = hash(key);
    for (Entry *e = ht->buckets[idx]; e; e = e->next) {
        if (strcmp(e->key, key) == 0) return &e->value;
    }
    return NULL;
}

void ht_free(HashTable *ht) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        Entry *e = ht->buckets[i];
        while (e) {
            Entry *tmp = e;
            e = e->next;
            free(tmp->key);
            free(tmp);
        }
    }
}

int main(void) {
    HashTable ht = {0};
    ht_set(&ht, "one", 1);
    ht_set(&ht, "two", 2);
    ht_set(&ht, "three", 3);

    int *val = ht_get(&ht, "two");
    if (val) printf("two = %d\\n", *val);

    ht_free(&ht);
    return 0;
}`,
      filename: 'hashtable.c',
    },
    {
      type: 'quiz',
      question:
        'Какой тип коллизий в хеш-таблице разрешён методом цепочек (chaining)?',
      options: [
        'Когда два разных ключа имеют одинаковый хеш-индекс',
        'Когда два одинаковых ключа имеют разные значения',
        'Когда буфер хеш-таблицы переполнен',
        'Когда хеш-функция возвращает отрицательное число',
      ],
      correctIndex: 0,
      explanation:
        'Коллизия возникает, когда два разных ключа дают одинаковый индекс в массиве бакетов. Метод цепочек хранит все элементы с одним индексом в связном списке.',
    },
    {
      type: 'exercise',
      title: 'Двусвязный список',
      description:
        'Реализуйте двусвязный список с операциями: `push_back`, `push_front`, `pop_back`, `pop_front` и `print_reverse` (вывод в обратном порядке). Каждый узел должен хранить указатели `prev` и `next`.',
      hints: [
        'Структура узла: `struct DNode { int data; struct DNode *prev, *next; }`',
        'Для удобства храните два указателя: `head` и `tail`',
        'При удалении последнего узла не забудьте обнулить оба указателя',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
} DNode;

typedef struct {
    DNode *head;
    DNode *tail;
} DList;

void dlist_push_back(DList *l, int data) {
    DNode *n = malloc(sizeof(DNode));
    *n = (DNode){ .data = data, .prev = l->tail, .next = NULL };
    if (l->tail) l->tail->next = n;
    else l->head = n;
    l->tail = n;
}

void dlist_push_front(DList *l, int data) {
    DNode *n = malloc(sizeof(DNode));
    *n = (DNode){ .data = data, .prev = NULL, .next = l->head };
    if (l->head) l->head->prev = n;
    else l->tail = n;
    l->head = n;
}

void dlist_print_reverse(const DList *l) {
    for (const DNode *n = l->tail; n; n = n->prev)
        printf("%d ", n->data);
    printf("\\n");
}

void dlist_free(DList *l) {
    DNode *cur = l->head;
    while (cur) {
        DNode *tmp = cur;
        cur = cur->next;
        free(tmp);
    }
    l->head = l->tail = NULL;
}

int main(void) {
    DList l = {0};
    dlist_push_back(&l, 1);
    dlist_push_back(&l, 2);
    dlist_push_front(&l, 0);
    dlist_print_reverse(&l); /* 2 1 0 */
    dlist_free(&l);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
