import type { Chapter } from '../types'

export default {
  id: 'storage-classes',
  title: 'Классы памяти',
  description: 'auto, static, extern, register, _Thread_local',
  blocks: [
    {
      type: 'prose',
      markdown: `# Классы памяти в C

Каждая переменная в C имеет **класс памяти** (storage class), который определяет три характеристики:

- **Время жизни** (storage duration) — когда переменная создаётся и уничтожается
- **Область видимости** (scope) — где переменная доступна
- **Связывание** (linkage) — видна ли переменная из других единиц трансляции

В C определены пять спецификаторов класса памяти: \`auto\`, \`static\`, \`extern\`, \`register\` и \`_Thread_local\`.`,
    },
    {
      type: 'prose',
      markdown: `## auto — автоматические переменные

Спецификатор \`auto\` используется для локальных переменных, которые создаются при входе в блок и уничтожаются при выходе. Фактически \`auto\` — это класс памяти по умолчанию для локальных переменных, поэтому его почти никогда не пишут явно.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

void demonstrate_auto(void) {
    auto int x = 10;  /* auto — необязательно, подразумевается */
    int y = 20;        /* эквивалентно auto int y = 20 */

    printf("x = %d, y = %d\\n", x, y);
    /* x и y уничтожаются при выходе из функции */
}

int main(void) {
    demonstrate_auto();
    demonstrate_auto();  /* x и y создаются заново */
    return 0;
}`,
      filename: 'auto_example.c',
    },
    {
      type: 'prose',
      markdown: `## static — статические переменные

Спецификатор \`static\` имеет два разных значения в зависимости от контекста:

1. **Внутри функции** — переменная сохраняет своё значение между вызовами (статическое время жизни, но локальная область видимости).
2. **На уровне файла** — функция или переменная видна только внутри текущей единицы трансляции (внутреннее связывание).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

/* static на уровне файла: функция видна только в этом файле */
static int internal_helper(int x) {
    return x * 2;
}

int count_calls(void) {
    /* static внутри функции: значение сохраняется между вызовами */
    static int counter = 0;
    counter++;
    return counter;
}

int main(void) {
    printf("Вызов #%d\\n", count_calls());  /* Вызов #1 */
    printf("Вызов #%d\\n", count_calls());  /* Вызов #2 */
    printf("Вызов #%d\\n", count_calls());  /* Вызов #3 */
    printf("helper: %d\\n", internal_helper(5));
    return 0;
}`,
      filename: 'static_example.c',
    },
    {
      type: 'output',
      content: `Вызов #1
Вызов #2
Вызов #3
helper: 10`,
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'static и многопоточность',
      markdown:
        'Статические локальные переменные разделяются между всеми потоками. '
        + 'Если функция с такой переменной вызывается из нескольких потоков '
        + 'одновременно, возникает состояние гонки (race condition). '
        + 'Используйте `_Thread_local` или мьютексы для потокобезопасности.',
    },
    {
      type: 'prose',
      markdown: `## extern — внешнее связывание

Спецификатор \`extern\` объявляет переменную или функцию, определённую в другой единице трансляции. Он не выделяет память — только сообщает компилятору, что символ существует где-то ещё.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* === config.c === */
#include "config.h"

/* Определение глобальной переменной (выделяет память) */
int log_level = 1;

void set_log_level(int level) {
    log_level = level;
}`,
      filename: 'config.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* === config.h === */
#ifndef CONFIG_H
#define CONFIG_H

/* Объявление с extern: память НЕ выделяется */
extern int log_level;

void set_log_level(int level);

#endif`,
      filename: 'config.h',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* === main.c === */
#include <stdio.h>
#include "config.h"

int main(void) {
    printf("Уровень логирования: %d\\n", log_level);  /* 1 */
    set_log_level(3);
    printf("Уровень логирования: %d\\n", log_level);  /* 3 */
    return 0;
}`,
      filename: 'main.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Правило одного определения',
      markdown:
        'Переменная с внешним связыванием должна быть **определена** ровно '
        + 'в одном файле (без `extern`), а **объявлена** с `extern` во всех '
        + 'остальных файлах (обычно через заголовочный файл).',
    },
    {
      type: 'prose',
      markdown: `## register — рекомендация компилятору

Спецификатор \`register\` просит компилятор разместить переменную в регистре процессора для ускорения доступа. Современные компиляторы сами прекрасно оптимизируют размещение переменных, поэтому \`register\` практически не используется.

Важное ограничение: к переменной с \`register\` нельзя применять оператор взятия адреса \`&\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

long sum_array(const int *arr, int n) {
    register long sum = 0;
    for (register int i = 0; i < n; i++) {
        sum += arr[i];
    }
    /* &sum — ОШИБКА компиляции: нельзя взять адрес register-переменной */
    return sum;
}

int main(void) {
    int data[] = {1, 2, 3, 4, 5};
    printf("Сумма: %ld\\n", sum_array(data, 5));
    return 0;
}`,
      filename: 'register_example.c',
    },
    {
      type: 'prose',
      markdown: `## _Thread_local — потоколокальные переменные (C11)

Спецификатор \`_Thread_local\` (или макрос \`thread_local\` из \`<threads.h>\`) создаёт отдельную копию переменной для каждого потока. Каждый поток видит своё собственное значение.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <threads.h>

thread_local int tls_counter = 0;

int thread_func(void *arg) {
    int id = *(int *)arg;
    for (int i = 0; i < 3; i++) {
        tls_counter++;
        printf("Поток %d: tls_counter = %d\\n", id, tls_counter);
    }
    return 0;
}

int main(void) {
    thrd_t t1, t2;
    int id1 = 1, id2 = 2;

    thrd_create(&t1, thread_func, &id1);
    thrd_create(&t2, thread_func, &id2);

    thrd_join(t1, NULL);
    thrd_join(t2, NULL);

    return 0;
}`,
      filename: 'thread_local_example.c',
    },
    {
      type: 'output',
      content: `Поток 1: tls_counter = 1
Поток 1: tls_counter = 2
Поток 1: tls_counter = 3
Поток 2: tls_counter = 1
Поток 2: tls_counter = 2
Поток 2: tls_counter = 3`,
    },
    {
      type: 'quiz',
      question: 'Что произойдёт со статической локальной переменной при повторном вызове функции?',
      options: [
        'Она будет создана заново с начальным значением',
        'Она сохранит значение с предыдущего вызова',
        'Произойдёт ошибка компиляции',
        'Поведение не определено',
      ],
      correctIndex: 1,
      explanation:
        'Статическая локальная переменная инициализируется один раз при первом вызове '
        + 'функции и сохраняет своё значение между вызовами. Она существует на протяжении '
        + 'всего времени работы программы.',
    },
    {
      type: 'exercise',
      title: 'Генератор уникальных идентификаторов',
      description:
        'Напишите функцию `int next_id(void)`, которая при каждом вызове возвращает '
        + 'следующее уникальное целое число, начиная с 1. Функция должна корректно работать '
        + 'при многократных вызовах без передачи внешнего состояния.',
      hints: [
        'Используйте static-переменную внутри функции для хранения счётчика',
        'Инициализируйте счётчик значением 0 и увеличивайте перед возвратом',
      ],
      solution: `#include <stdio.h>

int next_id(void) {
    static int counter = 0;
    return ++counter;
}

int main(void) {
    for (int i = 0; i < 5; i++) {
        printf("ID: %d\\n", next_id());
    }
    /* Выведет: ID: 1, ID: 2, ID: 3, ID: 4, ID: 5 */
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
