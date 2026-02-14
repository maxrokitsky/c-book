import type { Chapter } from '../types'

export default {
  id: 'threads',
  title: 'Многопоточность (C11)',
  description: 'threads.h, мьютексы, атомарные операции',
  blocks: [
    {
      type: 'prose',
      markdown:
        'Начиная с C11, стандарт языка включает поддержку многопоточности через заголовки `<threads.h>` и `<stdatomic.h>`. До C11 многопоточность обеспечивалась только платформенными API (POSIX threads, Windows threads).\n\nМногопоточность позволяет выполнять несколько задач параллельно, но требует аккуратной синхронизации для предотвращения **гонок данных** (data races) — одновременного доступа к общим данным, когда хотя бы один доступ — запись.',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Поддержка threads.h',
      markdown:
        'Заголовок `<threads.h>` является опциональным в C11/C17. GCC (glibc >= 2.28) и musl поддерживают его. На платформах без `<threads.h>` можно использовать POSIX threads (`<pthread.h>`) или библиотеку-обёртку [tinycthread](https://tinycthread.github.io/).',
    },
    {
      type: 'prose',
      markdown:
        '## Создание потоков\n\nПоток создаётся функцией `thrd_create()`. Каждый поток выполняет функцию с сигнатурой `int func(void *arg)` и возвращает целочисленный код.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <threads.h>

int worker(void *arg) {
    int id = *(int *)arg;
    printf("Поток %d запущен\\n", id);
    /* Имитация работы */
    thrd_sleep(&(struct timespec){.tv_sec = 0, .tv_nsec = 100000000}, NULL);
    printf("Поток %d завершён\\n", id);
    return id * 10;
}

int main(void) {
    enum { NUM_THREADS = 4 };
    thrd_t threads[NUM_THREADS];
    int ids[NUM_THREADS];

    /* Создание потоков */
    for (int i = 0; i < NUM_THREADS; i++) {
        ids[i] = i;
        if (thrd_create(&threads[i], worker, &ids[i]) != thrd_success) {
            fprintf(stderr, "Не удалось создать поток %d\\n", i);
            return 1;
        }
    }

    /* Ожидание завершения */
    for (int i = 0; i < NUM_THREADS; i++) {
        int result;
        thrd_join(threads[i], &result);
        printf("Поток %d вернул: %d\\n", i, result);
    }

    return 0;
}`,
      filename: 'threads_basic.c',
    },
    {
      type: 'output',
      content:
        'Поток 0 запущен\nПоток 1 запущен\nПоток 2 запущен\nПоток 3 запущен\nПоток 0 завершён\nПоток 1 завершён\nПоток 2 завершён\nПоток 3 завершён\nПоток 0 вернул: 0\nПоток 1 вернул: 10\nПоток 2 вернул: 20\nПоток 3 вернул: 30',
      prompt: '$ gcc -std=c11 threads_basic.c -o threads -lpthread && ./threads',
    },
    {
      type: 'prose',
      markdown:
        '## Гонка данных и мьютексы\n\nКогда несколько потоков одновременно изменяют одну переменную без синхронизации, возникает **гонка данных** — результат непредсказуем. Мьютекс (`mtx_t`) гарантирует, что только один поток одновременно выполняет критическую секцию.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <threads.h>

#define ITERATIONS 1000000

int counter = 0;     /* общий ресурс */
mtx_t counter_mtx;   /* мьютекс для защиты */

int increment_unsafe(void *arg) {
    (void)arg;
    for (int i = 0; i < ITERATIONS; i++) {
        counter++;  /* гонка данных! */
    }
    return 0;
}

int increment_safe(void *arg) {
    (void)arg;
    for (int i = 0; i < ITERATIONS; i++) {
        mtx_lock(&counter_mtx);
        counter++;
        mtx_unlock(&counter_mtx);
    }
    return 0;
}

int main(void) {
    thrd_t t1, t2;

    /* Без синхронизации — гонка данных */
    counter = 0;
    thrd_create(&t1, increment_unsafe, NULL);
    thrd_create(&t2, increment_unsafe, NULL);
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    printf("Без мьютекса:  %d (ожидалось %d)\\n",
           counter, 2 * ITERATIONS);

    /* С мьютексом — корректно */
    counter = 0;
    mtx_init(&counter_mtx, mtx_plain);
    thrd_create(&t1, increment_safe, NULL);
    thrd_create(&t2, increment_safe, NULL);
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    mtx_destroy(&counter_mtx);
    printf("С мьютексом:   %d (ожидалось %d)\\n",
           counter, 2 * ITERATIONS);

    return 0;
}`,
      filename: 'mutex_demo.c',
    },
    {
      type: 'output',
      content:
        'Без мьютекса:  1873642 (ожидалось 2000000)\nС мьютексом:   2000000 (ожидалось 2000000)',
      prompt: '$ gcc -std=c11 mutex_demo.c -o mutex -lpthread && ./mutex',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Deadlock',
      markdown:
        'Если поток A захватил мьютекс M1 и ждёт M2, а поток B захватил M2 и ждёт M1, оба потока заблокированы навечно — это **deadlock** (взаимная блокировка). Избежать его можно, всегда захватывая мьютексы в одном и том же порядке.',
    },
    {
      type: 'prose',
      markdown:
        '## Атомарные операции\n\n`<stdatomic.h>` предоставляет типы и операции, которые выполняются атомарно — без необходимости мьютекса. Для простых счётчиков и флагов атомарные операции значительно быстрее мьютексов.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <threads.h>
#include <stdatomic.h>

#define ITERATIONS 1000000

atomic_int counter = 0;

int increment(void *arg) {
    (void)arg;
    for (int i = 0; i < ITERATIONS; i++) {
        atomic_fetch_add(&counter, 1);
    }
    return 0;
}

int main(void) {
    thrd_t t1, t2;
    thrd_create(&t1, increment, NULL);
    thrd_create(&t2, increment, NULL);
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);

    printf("Атомарный счётчик: %d (ожидалось %d)\\n",
           atomic_load(&counter), 2 * ITERATIONS);

    /* Атомарный compare-and-swap */
    atomic_int flag = 0;
    int expected = 0;
    if (atomic_compare_exchange_strong(&flag, &expected, 1)) {
        printf("CAS успешен: flag = %d\\n", atomic_load(&flag));
    }

    return 0;
}`,
      filename: 'atomic_demo.c',
    },
    {
      type: 'output',
      content:
        'Атомарный счётчик: 2000000 (ожидалось 2000000)\nCAS успешен: flag = 1',
      prompt: '$ gcc -std=c11 atomic_demo.c -o atomic -lpthread && ./atomic',
    },
    {
      type: 'prose',
      markdown:
        '## Thread-local хранилище\n\nКвалификатор `_Thread_local` (или макрос `thread_local` из `<threads.h>`) создаёт переменную, у которой каждый поток имеет собственную копию.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <threads.h>

thread_local int tls_counter = 0;

int worker(void *arg) {
    int id = *(int *)arg;
    for (int i = 0; i < 5; i++) {
        tls_counter++;
    }
    printf("Поток %d: tls_counter = %d\\n", id, tls_counter);
    return 0;
}

int main(void) {
    thrd_t t1, t2;
    int id1 = 1, id2 = 2;
    thrd_create(&t1, worker, &id1);
    thrd_create(&t2, worker, &id2);
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);

    printf("main: tls_counter = %d\\n", tls_counter);
    return 0;
}`,
      filename: 'tls_demo.c',
    },
    {
      type: 'output',
      content:
        'Поток 1: tls_counter = 5\nПоток 2: tls_counter = 5\nmain: tls_counter = 0',
      prompt: '$ gcc -std=c11 tls_demo.c -o tls -lpthread && ./tls',
    },
    {
      type: 'quiz',
      question:
        'Какой порядок памяти (memory order) обеспечивает наибольшую синхронизацию, но наименьшую производительность?',
      options: [
        'memory_order_relaxed',
        'memory_order_acquire',
        'memory_order_release',
        'memory_order_seq_cst',
      ],
      correctIndex: 3,
      explanation:
        'memory_order_seq_cst (sequentially consistent) — самый строгий порядок. Он гарантирует, что все атомарные операции видны всем потокам в одном и том же порядке. Это порядок по умолчанию для всех атомарных операций в C11.',
    },
    {
      type: 'exercise',
      title: 'Потокобезопасная очередь',
      description:
        'Реализуйте простую потокобезопасную очередь фиксированного размера с операциями `enqueue` и `dequeue`. Используйте мьютекс для синхронизации. Создайте два потока-производителя и два потока-потребителя.',
      hints: [
        'Используйте кольцевой буфер с мьютексом',
        'При попытке записи в полную очередь поток может подождать (spin) или вернуть ошибку',
        'Condition variable (cnd_t) позволяет потокам ждать без busy-waiting',
      ],
      solution: `#include <stdio.h>
#include <threads.h>
#include <stdbool.h>

#define QUEUE_CAP 16

typedef struct {
    int buf[QUEUE_CAP];
    size_t head, tail, count;
    mtx_t mtx;
    cnd_t not_empty;
    cnd_t not_full;
} TSQueue;

void tsq_init(TSQueue *q) {
    q->head = q->tail = q->count = 0;
    mtx_init(&q->mtx, mtx_plain);
    cnd_init(&q->not_empty);
    cnd_init(&q->not_full);
}

void tsq_enqueue(TSQueue *q, int val) {
    mtx_lock(&q->mtx);
    while (q->count == QUEUE_CAP)
        cnd_wait(&q->not_full, &q->mtx);
    q->buf[q->tail] = val;
    q->tail = (q->tail + 1) % QUEUE_CAP;
    q->count++;
    cnd_signal(&q->not_empty);
    mtx_unlock(&q->mtx);
}

int tsq_dequeue(TSQueue *q) {
    mtx_lock(&q->mtx);
    while (q->count == 0)
        cnd_wait(&q->not_empty, &q->mtx);
    int val = q->buf[q->head];
    q->head = (q->head + 1) % QUEUE_CAP;
    q->count--;
    cnd_signal(&q->not_full);
    mtx_unlock(&q->mtx);
    return val;
}

void tsq_destroy(TSQueue *q) {
    mtx_destroy(&q->mtx);
    cnd_destroy(&q->not_empty);
    cnd_destroy(&q->not_full);
}

TSQueue queue;

int producer(void *arg) {
    int id = *(int *)arg;
    for (int i = 0; i < 5; i++) {
        int val = id * 100 + i;
        tsq_enqueue(&queue, val);
        printf("P%d -> %d\\n", id, val);
    }
    return 0;
}

int consumer(void *arg) {
    int id = *(int *)arg;
    for (int i = 0; i < 5; i++) {
        int val = tsq_dequeue(&queue);
        printf("C%d <- %d\\n", id, val);
    }
    return 0;
}

int main(void) {
    tsq_init(&queue);
    thrd_t p1, p2, c1, c2;
    int ids[] = {1, 2, 1, 2};
    thrd_create(&p1, producer, &ids[0]);
    thrd_create(&p2, producer, &ids[1]);
    thrd_create(&c1, consumer, &ids[2]);
    thrd_create(&c2, consumer, &ids[3]);
    thrd_join(p1, NULL); thrd_join(p2, NULL);
    thrd_join(c1, NULL); thrd_join(c2, NULL);
    tsq_destroy(&queue);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
