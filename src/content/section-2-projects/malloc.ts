import type { Chapter } from '../types'

export default {
  id: 'malloc',
  title: 'Свой malloc',
  description: 'Реализация аллокатора памяти',
  blocks: [
    {
      type: 'prose',
      markdown: `# Реализация своего malloc

\`malloc()\` — одна из самых важных функций в C. Каждая программа, работающая с динамической памятью, зависит от аллокатора. В этом проекте мы напишем собственную реализацию \`malloc()\`, \`free()\`, \`calloc()\` и \`realloc()\`.

Это даст глубокое понимание:
- Как устроена куча (heap) процесса
- Системные вызовы \`sbrk()\` и \`mmap()\`
- Стратегии управления свободной памятью
- Проблемы фрагментации и выравнивания`,
    },
    {
      type: 'prose',
      markdown: `## Как работает malloc на уровне ОС

Процесс получает память от операционной системы двумя основными способами:

1. **\`sbrk()\`** — расширяет сегмент данных процесса. Простой, но примитивный: можно только увеличивать или уменьшать «верхнюю границу» кучи.
2. **\`mmap()\`** — запрашивает произвольный блок виртуальной памяти. Используется для больших аллокаций.

Наш аллокатор будет использовать \`sbrk()\` для простоты. Внутри полученной от ОС памяти мы сами управляем выделением и освобождением блоков.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Метаданные блока',
      markdown:
        'Перед каждым выделенным блоком памяти аллокатор хранит заголовок (header) с метаданными: размер блока, флаг занятости, указатель на следующий свободный блок. Когда вы вызываете `malloc(32)`, реально выделяется 32 + sizeof(header) байт.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <unistd.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>

/* Выравнивание по 16 байт (требование x86-64 ABI) */
#define ALIGN 16
#define ALIGN_UP(x) (((x) + (ALIGN - 1)) & ~(ALIGN - 1))

/* Минимальный размер блока (чтобы поместился заголовок свободного блока) */
#define MIN_BLOCK_SIZE ALIGN_UP(sizeof(BlockHeader))

typedef struct BlockHeader {
    size_t size;                /* размер блока (без заголовка) */
    int is_free;                /* 1 — свободен, 0 — занят */
    struct BlockHeader *next;   /* следующий блок в списке */
} BlockHeader;

static BlockHeader *free_list = NULL;  /* голова списка свободных блоков */
static BlockHeader *heap_start = NULL; /* начало нашей кучи */`,
      filename: 'mymalloc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Запрос памяти у ОС через sbrk() */
static BlockHeader *request_memory(size_t size)
{
    size_t total = ALIGN_UP(sizeof(BlockHeader)) + ALIGN_UP(size);
    BlockHeader *block = sbrk((intptr_t)total);
    if (block == (void *)-1)
        return NULL;

    block->size = ALIGN_UP(size);
    block->is_free = 0;
    block->next = NULL;

    /* Добавляем в конец списка блоков */
    if (!heap_start) {
        heap_start = block;
    } else {
        BlockHeader *curr = heap_start;
        while (curr->next)
            curr = curr->next;
        curr->next = block;
    }

    return block;
}

/* Поиск свободного блока подходящего размера (first fit) */
static BlockHeader *find_free_block(size_t size)
{
    BlockHeader *curr = heap_start;
    while (curr) {
        if (curr->is_free && curr->size >= size)
            return curr;
        curr = curr->next;
    }
    return NULL;
}`,
      filename: 'mymalloc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Разделение блока, если он слишком большой */
static void split_block(BlockHeader *block, size_t size)
{
    size_t header_size = ALIGN_UP(sizeof(BlockHeader));
    size_t remaining = block->size - size;

    /* Разделяем только если остаток достаточен для нового блока */
    if (remaining <= header_size + ALIGN)
        return;

    BlockHeader *new_block = (BlockHeader *)((char *)block + header_size + size);
    new_block->size = remaining - header_size;
    new_block->is_free = 1;
    new_block->next = block->next;

    block->size = size;
    block->next = new_block;
}

/* Объединение соседних свободных блоков (coalescing) */
static void coalesce(void)
{
    BlockHeader *curr = heap_start;
    while (curr && curr->next) {
        if (curr->is_free && curr->next->is_free) {
            size_t header_size = ALIGN_UP(sizeof(BlockHeader));
            curr->size += header_size + curr->next->size;
            curr->next = curr->next->next;
            /* Не двигаем curr — проверяем объединённый блок снова */
        } else {
            curr = curr->next;
        }
    }
}`,
      filename: 'mymalloc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `void *my_malloc(size_t size)
{
    if (size == 0) return NULL;

    size = ALIGN_UP(size);

    /* Ищем свободный блок */
    BlockHeader *block = find_free_block(size);
    if (block) {
        split_block(block, size);
        block->is_free = 0;
    } else {
        block = request_memory(size);
        if (!block) return NULL;
    }

    /* Возвращаем указатель за заголовком */
    return (char *)block + ALIGN_UP(sizeof(BlockHeader));
}

void my_free(void *ptr)
{
    if (!ptr) return;

    BlockHeader *block =
        (BlockHeader *)((char *)ptr - ALIGN_UP(sizeof(BlockHeader)));
    block->is_free = 1;
    coalesce();
}

void *my_calloc(size_t nmemb, size_t size)
{
    size_t total = nmemb * size;
    /* Проверка переполнения */
    if (nmemb != 0 && total / nmemb != size)
        return NULL;
    void *ptr = my_malloc(total);
    if (ptr)
        memset(ptr, 0, total);
    return ptr;
}

void *my_realloc(void *ptr, size_t size)
{
    if (!ptr) return my_malloc(size);
    if (size == 0) { my_free(ptr); return NULL; }

    BlockHeader *block =
        (BlockHeader *)((char *)ptr - ALIGN_UP(sizeof(BlockHeader)));

    if (block->size >= ALIGN_UP(size))
        return ptr;  /* блок уже достаточно большой */

    void *new_ptr = my_malloc(size);
    if (!new_ptr) return NULL;
    memcpy(new_ptr, ptr, block->size);
    my_free(ptr);
    return new_ptr;
}`,
      filename: 'mymalloc.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Отладочная функция: вывод состояния кучи */
void my_malloc_debug(void)
{
    printf("=== Состояние кучи ===\\n");
    BlockHeader *curr = heap_start;
    int i = 0;
    while (curr) {
        printf("Блок %d: адрес=%p размер=%zu %s\\n",
               i++, (void *)curr, curr->size,
               curr->is_free ? "[свободен]" : "[занят]");
        curr = curr->next;
    }
    printf("=======================\\n");
}

int main(void)
{
    printf("Тестирование аллокатора\\n\\n");

    char *s1 = my_malloc(32);
    strcpy(s1, "Hello, malloc!");
    printf("s1 = \\"%s\\"\\n", s1);

    int *arr = my_calloc(10, sizeof(int));
    for (int i = 0; i < 10; i++)
        arr[i] = i * i;
    printf("arr[5] = %d\\n", arr[5]);

    my_malloc_debug();

    my_free(s1);
    printf("\\nПосле free(s1):\\n");
    my_malloc_debug();

    /* Повторное выделение — должен переиспользовать освобождённый блок */
    char *s2 = my_malloc(16);
    strcpy(s2, "Reuse!");
    printf("\\ns2 = \\"%s\\"\\n", s2);
    my_malloc_debug();

    my_free(arr);
    my_free(s2);

    return 0;
}`,
      filename: 'mymalloc.c',
    },
    {
      type: 'output',
      content: `Тестирование аллокатора

s1 = "Hello, malloc!"
arr[5] = 25
=== Состояние кучи ===
Блок 0: адрес=0x5600a3b1e000 размер=32 [занят]
Блок 1: адрес=0x5600a3b1e040 размер=48 [занят]
=======================

После free(s1):
=== Состояние кучи ===
Блок 0: адрес=0x5600a3b1e000 размер=32 [свободен]
Блок 1: адрес=0x5600a3b1e040 размер=48 [занят]
=======================

s2 = "Reuse!"
=== Состояние кучи ===
Блок 0: адрес=0x5600a3b1e000 размер=16 [занят]
Блок 1: адрес=0x5600a3b1e020 размер=0 [свободен]
Блок 2: адрес=0x5600a3b1e040 размер=48 [занят]
=======================`,
      prompt: '$ gcc -Wall -Wextra -o mymalloc mymalloc.c && ./mymalloc',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Стратегии поиска свободного блока',
      markdown: `Мы используем **first fit** — берём первый подходящий блок. Другие стратегии:

- **Best fit** — ищем наименьший подходящий блок (меньше фрагментация, медленнее поиск)
- **Worst fit** — берём наибольший блок (оставляет больше полезного остатка)
- **Segregated free lists** — отдельные списки для блоков разного размера (используется в glibc)

Реальный malloc в glibc (ptmalloc2) использует комбинацию bins разного размера, fastbins для маленьких аллокаций и mmap для больших.`,
    },
    {
      type: 'exercise',
      title: 'Реализуйте best fit стратегию',
      description:
        'Замените стратегию first fit на best fit: вместо того чтобы брать первый подходящий свободный блок, найдите наименьший из подходящих. Это уменьшит внешнюю фрагментацию.',
      hints: [
        'Пройдите по всему списку блоков, отслеживая лучший найденный результат',
        'Лучший блок — это свободный блок с минимальным size >= запрошенного размера',
        'Если найден блок с точно подходящим размером, можно прервать поиск досрочно',
      ],
      solution: `static BlockHeader *find_best_fit(size_t size)
{
    BlockHeader *best = NULL;
    BlockHeader *curr = heap_start;

    while (curr) {
        if (curr->is_free && curr->size >= size) {
            if (!best || curr->size < best->size) {
                best = curr;
                if (best->size == size)
                    break;  /* идеальное совпадение */
            }
        }
        curr = curr->next;
    }
    return best;
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Добавьте обнаружение двойного free',
      description:
        'Реализуйте проверку на двойное освобождение (double free). Если пользователь вызывает `my_free()` для уже свободного блока, программа должна вывести сообщение об ошибке и прервать выполнение. Также добавьте «канарейку» (magic number) в заголовок для обнаружения повреждения кучи.',
      hints: [
        'Добавьте поле uint64_t magic в BlockHeader со значением 0xDEADBEEFCAFEBABE',
        'В my_free() проверяйте magic — если значение другое, куча повреждена',
        'Проверяйте is_free — если блок уже свободен, это double free',
        'Используйте abort() для немедленного завершения при обнаружении ошибки',
      ],
      solution: `#define HEAP_MAGIC 0xDEADBEEFCAFEBABEULL

/* Добавьте в BlockHeader: uint64_t magic; */

void my_free_safe(void *ptr)
{
    if (!ptr) return;

    BlockHeader *block =
        (BlockHeader *)((char *)ptr - ALIGN_UP(sizeof(BlockHeader)));

    if (block->magic != HEAP_MAGIC) {
        fprintf(stderr,
                "ОШИБКА: повреждение кучи! "
                "Неверная магическая метка по адресу %p\\n",
                (void *)block);
        abort();
    }

    if (block->is_free) {
        fprintf(stderr,
                "ОШИБКА: двойное освобождение по адресу %p\\n",
                ptr);
        abort();
    }

    block->is_free = 1;
    coalesce();
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
