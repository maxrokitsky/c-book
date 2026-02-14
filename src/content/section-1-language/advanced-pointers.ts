import type { Chapter } from '../types'

export default {
  id: 'advanced-pointers',
  title: 'Продвинутые указатели',
  description: 'Указатели на указатели, void*, generic-контейнеры',
  blocks: [
    {
      type: 'prose',
      markdown: `# Продвинутые указатели

Указатели — фундамент языка C. В предыдущих главах мы рассмотрели базовые указатели и арифметику. Теперь перейдём к более сложным конструкциям:

- **Указатели на указатели** (\`int **pp\`) — многоуровневая косвенность
- **void*** — универсальный (нетипизированный) указатель
- **Generic-контейнеры** — структуры данных, работающие с любым типом через \`void *\`

Эти инструменты используются повсеместно: \`main(int argc, char **argv)\`, библиотечный \`qsort\`, реализации связных списков и хеш-таблиц.`,
    },
    {
      type: 'prose',
      markdown: `## Указатели на указатели

Указатель на указатель хранит адрес другого указателя. Это необходимо, когда функция должна **изменить сам указатель**, а не данные, на которые он указывает.`,
    },
    {
      type: 'diagram',
      component: 'PointerDiagram',
      props: {
        title: 'Указатель на указатель',
        boxes: [
          { label: 'pp', address: '0x100', value: '0x200', type: 'pointer' },
          { label: 'p', address: '0x200', value: '0x300', type: 'pointer' },
          { label: 'x', address: '0x300', value: '42', type: 'data' },
        ],
        arrows: [
          { from: 'pp', to: 'p' },
          { from: 'p', to: 'x' },
        ],
      },
      caption: 'pp указывает на p, p указывает на x. **pp == 42',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;     /* p хранит адрес x */
    int **pp = &p;   /* pp хранит адрес p */

    printf("x   = %d\\n", x);
    printf("*p  = %d\\n", *p);     /* Разыменование p -> x */
    printf("**pp = %d\\n", **pp);  /* Двойное разыменование pp -> p -> x */

    **pp = 100;  /* Изменяем x через pp */
    printf("x после **pp = 100: %d\\n", x);

    return 0;
}`,
      filename: 'double_pointer.c',
    },
    {
      type: 'output',
      content: `x   = 42
*p  = 42
**pp = 42
x после **pp = 100: 100`,
    },
    {
      type: 'prose',
      markdown: `## Практическое применение: изменение указателя в функции

Типичный случай — функция, которая выделяет память и должна вернуть указатель через параметр. Без двойного указателя это невозможно, потому что C передаёт всё по значению.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* НЕПРАВИЛЬНО: изменяет локальную копию указателя */
void alloc_wrong(int *ptr, int n) {
    ptr = malloc(n * sizeof(int));  /* Изменяется копия! */
    /* Оригинальный указатель в main остаётся NULL */
}

/* ПРАВИЛЬНО: принимает адрес указателя */
int alloc_correct(int **ptr, int n) {
    *ptr = malloc(n * sizeof(int));
    if (*ptr == NULL) return -1;
    for (int i = 0; i < n; i++) {
        (*ptr)[i] = i * 10;
    }
    return 0;
}

/* Альтернатива: возврат указателя */
int *alloc_return(int n) {
    int *ptr = malloc(n * sizeof(int));
    if (!ptr) return NULL;
    for (int i = 0; i < n; i++) {
        ptr[i] = i * 10;
    }
    return ptr;
}

int main(void) {
    int *data = NULL;

    alloc_wrong(data, 5);
    printf("После alloc_wrong: data = %p\\n", (void *)data);  /* NULL! */

    alloc_correct(&data, 5);
    printf("После alloc_correct: data[2] = %d\\n", data[2]);  /* 20 */
    free(data);

    data = alloc_return(5);
    printf("После alloc_return: data[3] = %d\\n", data[3]);   /* 30 */
    free(data);

    return 0;
}`,
      filename: 'alloc_pattern.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'char **argv и массив строк',
      markdown:
        '`char **argv` (или `char *argv[]`) — массив указателей на строки. '
        + 'Каждый `argv[i]` — это `char *`, указывающий на отдельную строку-аргумент. '
        + 'Это классический пример двойного указателя в действии.',
    },
    {
      type: 'prose',
      markdown: `## void* — универсальный указатель

\`void *\` — указатель, который может хранить адрес **любого** типа данных. Он не привязан к типу и не может быть разыменован напрямую — нужно явное приведение. \`void *\` — основа обобщённого программирования в C.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

/* Функция, которая печатает значение любого типа */
void print_value(const void *data, char type) {
    switch (type) {
        case 'i': printf("%d", *(const int *)data); break;
        case 'f': printf("%.2f", *(const double *)data); break;
        case 's': printf("%s", (const char *)data); break;
    }
    printf("\\n");
}

/* Обмен значений любого типа */
void generic_swap(void *a, void *b, size_t size) {
    unsigned char temp[size];  /* VLA (C99) */
    memcpy(temp, a, size);
    memcpy(a, b, size);
    memcpy(b, temp, size);
}

int main(void) {
    int n = 42;
    double pi = 3.14159;
    const char *msg = "Hello";

    print_value(&n, 'i');
    print_value(&pi, 'f');
    print_value(msg, 's');

    /* Обмен двух int */
    int a = 10, b = 20;
    generic_swap(&a, &b, sizeof(int));
    printf("a = %d, b = %d\\n", a, b);

    /* Обмен двух double */
    double x = 1.5, y = 9.9;
    generic_swap(&x, &y, sizeof(double));
    printf("x = %.1f, y = %.1f\\n", x, y);

    return 0;
}`,
      filename: 'void_pointer.c',
    },
    {
      type: 'output',
      content: `42
3.14
Hello
a = 20, b = 10
x = 9.9, y = 1.5`,
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Опасности void*',
      markdown:
        'Компилятор **не проверяет типы** при работе с `void *`. '
        + 'Если вы приведёте `void *` к неправильному типу, результат — '
        + 'неопределённое поведение. Используйте `void *` осторожно '
        + 'и документируйте ожидаемые типы.',
    },
    {
      type: 'prose',
      markdown: `## Generic-контейнер: динамический массив

Используя \`void *\` и размер элемента, можно создать контейнер, работающий с любым типом. Вот пример динамического массива (аналог \`std::vector\` из C++).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    void *data;        /* Указатель на данные */
    size_t elem_size;  /* Размер одного элемента */
    size_t length;     /* Количество элементов */
    size_t capacity;   /* Выделенная ёмкость */
} Vector;

Vector vec_create(size_t elem_size) {
    return (Vector){
        .data = NULL,
        .elem_size = elem_size,
        .length = 0,
        .capacity = 0,
    };
}

int vec_push(Vector *v, const void *elem) {
    if (v->length == v->capacity) {
        size_t new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        void *new_data = realloc(v->data, new_cap * v->elem_size);
        if (!new_data) return -1;
        v->data = new_data;
        v->capacity = new_cap;
    }
    /* Копируем элемент в конец массива */
    memcpy((char *)v->data + v->length * v->elem_size,
           elem, v->elem_size);
    v->length++;
    return 0;
}

void *vec_get(const Vector *v, size_t index) {
    if (index >= v->length) return NULL;
    return (char *)v->data + index * v->elem_size;
}

void vec_free(Vector *v) {
    free(v->data);
    v->data = NULL;
    v->length = 0;
    v->capacity = 0;
}

int main(void) {
    /* Вектор из int */
    Vector vi = vec_create(sizeof(int));
    for (int i = 0; i < 5; i++) {
        int val = i * 10;
        vec_push(&vi, &val);
    }
    for (size_t i = 0; i < vi.length; i++) {
        printf("%d ", *(int *)vec_get(&vi, i));
    }
    printf("\\n");
    vec_free(&vi);

    /* Вектор из double */
    Vector vd = vec_create(sizeof(double));
    double vals[] = {1.1, 2.2, 3.3};
    for (int i = 0; i < 3; i++) {
        vec_push(&vd, &vals[i]);
    }
    for (size_t i = 0; i < vd.length; i++) {
        printf("%.1f ", *(double *)vec_get(&vd, i));
    }
    printf("\\n");
    vec_free(&vd);

    return 0;
}`,
      filename: 'generic_vector.c',
    },
    {
      type: 'output',
      content: `0 10 20 30 40
1.1 2.2 3.3`,
    },
    {
      type: 'diagram',
      component: 'PointerDiagram',
      props: {
        title: 'Структура Vector в памяти',
        boxes: [
          { label: 'Vector v', address: '(stack)', value: 'data, elem_size, len, cap', type: 'data' },
          { label: 'v.data', address: '(heap)', value: '[elem0][elem1][elem2][...][свободно]', type: 'data' },
        ],
        arrows: [
          { from: 'Vector v', to: 'v.data' },
        ],
      },
      caption: 'Vector хранит метаданные в стеке, а элементы — в непрерывном блоке кучи',
    },
    {
      type: 'quiz',
      question: 'Почему `void *` нельзя разыменовать напрямую?',
      options: [
        'Потому что void * всегда равен NULL',
        'Потому что компилятор не знает размер данных, на которые указывает void *',
        'Потому что void * можно использовать только для чтения',
        'Потому что void * автоматически преобразуется в int *',
      ],
      correctIndex: 1,
      explanation:
        'Разыменование требует знания типа (и размера) данных, чтобы прочитать '
        + 'нужное количество байтов и интерпретировать их. `void *` не несёт '
        + 'информации о типе, поэтому перед разыменованием его нужно привести '
        + 'к конкретному типу указателя.',
    },
    {
      type: 'exercise',
      title: 'Generic-функция поиска',
      description:
        'Реализуйте функцию `void *linear_search(const void *arr, size_t count, '
        + 'size_t elem_size, const void *target, int (*cmp)(const void *, const void *))`, '
        + 'которая выполняет линейный поиск в массиве любого типа. Функция должна '
        + 'вернуть указатель на найденный элемент или NULL.',
      hints: [
        'Используйте арифметику указателей: (const char *)arr + i * elem_size',
        'Для сравнения элементов вызывайте переданную функцию cmp',
        'cmp возвращает 0, если элементы равны (аналогично strcmp)',
      ],
      solution: `#include <stdio.h>
#include <string.h>

void *linear_search(const void *arr, size_t count, size_t elem_size,
                    const void *target,
                    int (*cmp)(const void *, const void *)) {
    for (size_t i = 0; i < count; i++) {
        const void *elem = (const char *)arr + i * elem_size;
        if (cmp(elem, target) == 0) {
            return (void *)elem;
        }
    }
    return NULL;
}

int cmp_int(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int cmp_str(const void *a, const void *b) {
    return strcmp(*(const char *const *)a, *(const char *const *)b);
}

int main(void) {
    int nums[] = {10, 20, 30, 40, 50};
    int target = 30;
    int *found = linear_search(nums, 5, sizeof(int), &target, cmp_int);
    if (found) printf("Найдено: %d\\n", *found);

    const char *words[] = {"яблоко", "банан", "вишня"};
    const char *word = "банан";
    const char **res = linear_search(words, 3, sizeof(char *), &word, cmp_str);
    if (res) printf("Найдено: %s\\n", *res);

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
