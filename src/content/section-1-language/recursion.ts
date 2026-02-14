import type { Chapter } from '../types'

export default {
  id: 'recursion',
  title: 'Рекурсия',
  description: 'Рекурсивные функции, стек вызовов, хвостовая рекурсия',
  blocks: [
    {
      type: 'prose',
      markdown: `# Рекурсия в C

**Рекурсия** — это приём, при котором функция вызывает сама себя. Каждый рекурсивный вызов создаёт новый **кадр стека** (stack frame) с собственными локальными переменными и адресом возврата.

Рекурсивная функция должна содержать:

1. **Базовый случай** (base case) — условие завершения рекурсии
2. **Рекурсивный шаг** — вызов функции с аргументом, приближающимся к базовому случаю

Без базового случая рекурсия станет бесконечной и приведёт к **переполнению стека** (stack overflow).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Классический пример: факториал */
unsigned long factorial(int n) {
    if (n <= 1) {          /* Базовый случай */
        return 1;
    }
    return n * factorial(n - 1);  /* Рекурсивный шаг */
}

int main(void) {
    for (int i = 0; i <= 10; i++) {
        printf("%2d! = %lu\\n", i, factorial(i));
    }
    return 0;
}`,
      filename: 'factorial.c',
    },
    {
      type: 'output',
      content: ` 0! = 1
 1! = 1
 2! = 2
 3! = 6
 4! = 24
 5! = 120
 6! = 720
 7! = 5040
 8! = 40320
 9! = 362880
10! = 3628800`,
    },
    {
      type: 'prose',
      markdown: `## Стек вызовов

При каждом рекурсивном вызове в стек помещается новый кадр, содержащий параметры, локальные переменные и адрес возврата. Когда базовый случай достигнут, кадры начинают «сворачиваться» в обратном порядке.`,
    },
    {
      type: 'diagram',
      component: 'StackFrameVisualizer',
      props: {
        title: 'Стек вызовов для factorial(4)',
        frames: [
          { name: 'main()', locals: ['i = 4'], status: 'waiting' },
          { name: 'factorial(4)', locals: ['n = 4'], status: 'waiting' },
          { name: 'factorial(3)', locals: ['n = 3'], status: 'waiting' },
          { name: 'factorial(2)', locals: ['n = 2'], status: 'waiting' },
          { name: 'factorial(1)', locals: ['n = 1', 'return 1'], status: 'active' },
        ],
      },
      caption: 'При n=1 достигнут базовый случай. Стек начинает раскручиваться: 1 -> 2*1 -> 3*2 -> 4*6 = 24',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Ограничение стека',
      markdown:
        'Стек имеет ограниченный размер (обычно 1-8 МБ). Глубокая рекурсия '
        + '(тысячи и более вызовов) может вызвать **stack overflow**. '
        + 'Для таких случаев рассмотрите итеративное решение или увеличьте '
        + 'размер стека (`ulimit -s` в Linux).',
    },
    {
      type: 'prose',
      markdown: `## Примеры рекурсивных алгоритмов

Рекурсия естественна для задач, которые можно разбить на подзадачи такой же структуры: обход деревьев, сортировка разделением, комбинаторика.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Числа Фибоначчи (наивная рекурсия — экспоненциальная сложность!) */
long fib_naive(int n) {
    if (n <= 1) return n;
    return fib_naive(n - 1) + fib_naive(n - 2);
}

/* Бинарный поиск рекурсивно */
int binary_search(const int *arr, int low, int high, int target) {
    if (low > high) return -1;  /* Не найден */

    int mid = low + (high - low) / 2;

    if (arr[mid] == target)      return mid;
    if (arr[mid] > target)       return binary_search(arr, low, mid - 1, target);
    return binary_search(arr, mid + 1, high, target);
}

/* Ханойские башни */
void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);
    printf("Переместить диск %d: %c -> %c\\n", n, from, to);
    hanoi(n - 1, aux, to, from);
}

int main(void) {
    printf("fib(10) = %ld\\n\\n", fib_naive(10));

    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int idx = binary_search(arr, 0, 9, 23);
    printf("Индекс числа 23: %d\\n\\n", idx);

    printf("Ханойские башни (3 диска):\\n");
    hanoi(3, 'A', 'C', 'B');

    return 0;
}`,
      filename: 'recursive_examples.c',
    },
    {
      type: 'output',
      content: `fib(10) = 55

Индекс числа 23: 5

Ханойские башни (3 диска):
Переместить диск 1: A -> C
Переместить диск 2: A -> B
Переместить диск 1: C -> B
Переместить диск 3: A -> C
Переместить диск 1: B -> A
Переместить диск 2: B -> C
Переместить диск 1: A -> C`,
    },
    {
      type: 'prose',
      markdown: `## Хвостовая рекурсия

**Хвостовая рекурсия** (tail recursion) — это рекурсия, при которой рекурсивный вызов — последнее действие функции. Компилятор может оптимизировать такую рекурсию, заменив её циклом (**tail call optimization, TCO**), что устраняет рост стека.

Не все компиляторы гарантируют TCO в C. GCC и Clang делают это при включённых оптимизациях (\`-O2\` и выше).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* Обычная рекурсия: результат вычисляется ПОСЛЕ возврата из вызова */
unsigned long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  /* Умножение ПОСЛЕ рекурсивного вызова */
}

/* Хвостовая рекурсия: результат накапливается в аккумуляторе */
unsigned long factorial_tail(int n, unsigned long acc) {
    if (n <= 1) return acc;
    return factorial_tail(n - 1, n * acc);  /* Ничего после вызова */
}

/* Хвостовая рекурсия для Фибоначчи — линейная сложность */
long fib_tail(int n, long a, long b) {
    if (n == 0) return a;
    return fib_tail(n - 1, b, a + b);
}

int main(void) {
    printf("factorial(20) = %lu\\n", factorial_tail(20, 1));
    printf("fib(50)       = %ld\\n", fib_tail(50, 0, 1));
    return 0;
}`,
      filename: 'tail_recursion.c',
    },
    {
      type: 'output',
      content: `factorial(20) = 2432902008176640000
fib(50)       = 12586269025`,
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Как проверить TCO',
      markdown:
        'Скомпилируйте с `-O2 -S` и посмотрите ассемблер: если вместо `call` '
        + 'используется `jmp` к началу функции, оптимизация применена. '
        + 'Пример: `gcc -O2 -S tail_recursion.c && grep -A2 factorial_tail tail_recursion.s`',
    },
    {
      type: 'prose',
      markdown: `## Рекурсия vs итерация

Любую рекурсию можно заменить итерацией (циклом) с явным стеком. Выбор зависит от задачи:

| Критерий | Рекурсия | Итерация |
|----------|----------|----------|
| Читаемость | Нагляднее для деревьев, графов | Нагляднее для линейных задач |
| Память | Растёт стек вызовов | Постоянный расход |
| Скорость | Накладные расходы на вызовы | Обычно быстрее |
| Глубина | Ограничена размером стека | Не ограничена |`,
    },
    {
      type: 'quiz',
      question: 'Какой из вариантов является хвостовой рекурсией?',
      options: [
        '`return n * factorial(n - 1);`',
        '`return factorial_tail(n - 1, n * acc);`',
        '`return 1 + count(n - 1);`',
        '`return factorial(n - 1) + factorial(n - 2);`',
      ],
      correctIndex: 1,
      explanation:
        'Хвостовая рекурсия — когда рекурсивный вызов является последней операцией '
        + 'в функции, и его результат возвращается без дополнительных вычислений. '
        + 'В варианте `return factorial_tail(n - 1, n * acc)` после вызова ничего '
        + 'не происходит — это и есть хвостовая рекурсия.',
    },
    {
      type: 'exercise',
      title: 'Рекурсивный обход директории',
      description:
        'Напишите функцию `void print_tree(const char *path, int depth)`, '
        + 'которая рекурсивно печатает дерево файлов с отступами. Используйте '
        + '`<dirent.h>` для чтения директорий. Пропускайте "." и "..".',
      hints: [
        'Используйте opendir/readdir/closedir для обхода директории',
        'Проверяйте d_type == DT_DIR для определения поддиректорий',
        'Формируйте полный путь с помощью snprintf для рекурсивного вызова',
        'Отступ можно сделать циклом, печатая пробелы: depth * 2 пробелов',
      ],
      solution: `#include <stdio.h>
#include <string.h>
#include <dirent.h>

void print_tree(const char *path, int depth) {
    DIR *dir = opendir(path);
    if (!dir) { perror(path); return; }

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        /* Пропускаем . и .. */
        if (strcmp(entry->d_name, ".") == 0 ||
            strcmp(entry->d_name, "..") == 0) {
            continue;
        }

        /* Печатаем с отступом */
        for (int i = 0; i < depth; i++) printf("  ");
        printf("%s%s\\n", entry->d_name,
               entry->d_type == DT_DIR ? "/" : "");

        /* Рекурсивно обходим поддиректории */
        if (entry->d_type == DT_DIR) {
            char subpath[1024];
            snprintf(subpath, sizeof(subpath), "%s/%s", path, entry->d_name);
            print_tree(subpath, depth + 1);
        }
    }
    closedir(dir);
}

int main(void) {
    print_tree(".", 0);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
