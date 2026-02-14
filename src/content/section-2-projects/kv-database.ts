import type { Chapter } from '../types'

export default {
  id: 'kv-database',
  title: 'База данных ключ-значение',
  description: 'Key-value хранилище с персистентностью',
  blocks: [
    {
      type: 'prose',
      markdown: `# База данных ключ-значение

В этом проекте мы создадим key-value хранилище, данные которого сохраняются на диск и переживают перезапуск программы. По концепции это напоминает Redis или LevelDB, но в упрощённом виде. Проект охватывает:

- Хеш-таблицы: реализация с нуля
- Сериализация данных в бинарный формат
- Файловый ввод-вывод: персистентное хранение
- Простой сетевой протокол для клиент-серверного взаимодействия`,
    },
    {
      type: 'prose',
      markdown: `## Архитектура

Хранилище состоит из трёх слоёв:

1. **Хеш-таблица** — основная структура данных для хранения пар ключ-значение в памяти. Использует открытую адресацию с линейным пробированием.
2. **Движок персистентности** — при каждой записи дописывает операцию в append-only лог (WAL). При старте восстанавливает состояние, воспроизводя лог.
3. **Командный интерфейс** — разбор команд \`SET\`, \`GET\`, \`DEL\`, \`KEYS\`.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Почему хеш-таблица?',
      markdown:
        'Хеш-таблица обеспечивает O(1) среднее время доступа для операций GET, SET и DEL. Это идеальная структура данных для key-value хранилища. Redis, Memcached и множество других систем используют хеш-таблицы как основу.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define INITIAL_CAPACITY 64
#define LOAD_FACTOR_MAX 0.75

typedef struct {
    char *key;
    char *value;
    int occupied;   /* 0 — пусто, 1 — занято, 2 — удалено (tombstone) */
} Entry;

typedef struct {
    Entry *entries;
    size_t capacity;
    size_t size;
    FILE *wal;      /* файл журнала упреждающей записи */
} KVStore;

/* Хеш-функция FNV-1a — простая, быстрая, хорошее распределение */
static uint64_t hash_fnv1a(const char *key)
{
    uint64_t hash = 0xcbf29ce484222325ULL;
    for (const char *p = key; *p; p++) {
        hash ^= (uint64_t)(unsigned char)*p;
        hash *= 0x100000001b3ULL;
    }
    return hash;
}

static KVStore *kv_create(const char *wal_path)
{
    KVStore *store = calloc(1, sizeof(KVStore));
    store->capacity = INITIAL_CAPACITY;
    store->entries = calloc(store->capacity, sizeof(Entry));
    store->wal = fopen(wal_path, "ab+");
    if (!store->wal) {
        perror("fopen WAL");
        free(store->entries);
        free(store);
        return NULL;
    }
    return store;
}`,
      filename: 'kvstore.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Поиск слота в таблице (линейное пробирование) */
static Entry *find_slot(Entry *entries, size_t capacity, const char *key)
{
    uint64_t idx = hash_fnv1a(key) % capacity;
    Entry *tombstone = NULL;

    for (size_t i = 0; i < capacity; i++) {
        Entry *e = &entries[(idx + i) % capacity];
        if (e->occupied == 0) {
            return tombstone ? tombstone : e;
        }
        if (e->occupied == 2 && !tombstone) {
            tombstone = e;
            continue;
        }
        if (e->occupied == 1 && strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return tombstone;  /* таблица полностью занята — не должно случиться */
}

/* Расширение таблицы при превышении порога загрузки */
static void kv_resize(KVStore *store)
{
    size_t new_cap = store->capacity * 2;
    Entry *new_entries = calloc(new_cap, sizeof(Entry));

    for (size_t i = 0; i < store->capacity; i++) {
        Entry *old = &store->entries[i];
        if (old->occupied != 1) continue;
        Entry *slot = find_slot(new_entries, new_cap, old->key);
        *slot = *old;
    }

    free(store->entries);
    store->entries = new_entries;
    store->capacity = new_cap;
}

static void kv_set(KVStore *store, const char *key, const char *value)
{
    if ((double)store->size / (double)store->capacity > LOAD_FACTOR_MAX)
        kv_resize(store);

    Entry *slot = find_slot(store->entries, store->capacity, key);

    if (slot->occupied == 1) {
        /* Обновляем существующее значение */
        free(slot->value);
        slot->value = strdup(value);
    } else {
        /* Новая запись */
        slot->key = strdup(key);
        slot->value = strdup(value);
        slot->occupied = 1;
        store->size++;
    }

    /* Записываем в WAL */
    fprintf(store->wal, "SET %s %s\\n", key, value);
    fflush(store->wal);
}`,
      filename: 'kvstore.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `static const char *kv_get(KVStore *store, const char *key)
{
    Entry *slot = find_slot(store->entries, store->capacity, key);
    if (slot->occupied == 1)
        return slot->value;
    return NULL;
}

static int kv_del(KVStore *store, const char *key)
{
    Entry *slot = find_slot(store->entries, store->capacity, key);
    if (slot->occupied != 1)
        return 0;  /* ключ не найден */

    free(slot->key);
    free(slot->value);
    slot->key = NULL;
    slot->value = NULL;
    slot->occupied = 2;  /* tombstone */
    store->size--;

    fprintf(store->wal, "DEL %s\\n", key);
    fflush(store->wal);
    return 1;
}

/* Восстановление состояния из WAL */
static void kv_recover(KVStore *store)
{
    rewind(store->wal);
    char line[1024];
    while (fgets(line, sizeof(line), store->wal)) {
        char cmd[8], key[256], value[512];
        if (sscanf(line, "SET %255s %511[^\\n]", key, value) == 2) {
            /* Вставляем без записи в WAL (он уже содержит эту запись) */
            if ((double)store->size / (double)store->capacity > LOAD_FACTOR_MAX)
                kv_resize(store);
            Entry *slot = find_slot(store->entries, store->capacity, key);
            if (slot->occupied == 1) {
                free(slot->value);
                slot->value = strdup(value);
            } else {
                slot->key = strdup(key);
                slot->value = strdup(value);
                slot->occupied = 1;
                store->size++;
            }
        } else if (sscanf(line, "%7s %255s", cmd, key) == 2
                   && strcmp(cmd, "DEL") == 0) {
            Entry *slot = find_slot(store->entries, store->capacity, key);
            if (slot->occupied == 1) {
                free(slot->key);
                free(slot->value);
                slot->key = NULL;
                slot->value = NULL;
                slot->occupied = 2;
                store->size--;
            }
        }
    }
    /* Перемещаемся в конец файла для дальнейшей записи */
    fseek(store->wal, 0, SEEK_END);
}`,
      filename: 'kvstore.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Командный интерфейс */
int main(void)
{
    KVStore *store = kv_create("kvstore.wal");
    if (!store) return 1;

    kv_recover(store);
    printf("KV-хранилище запущено (%zu записей восстановлено)\\n", store->size);

    char line[1024];
    while (1) {
        printf("kv> ");
        if (!fgets(line, sizeof(line), stdin))
            break;

        char cmd[8], key[256], value[512];
        if (sscanf(line, "SET %255s %511[^\\n]", key, value) == 2) {
            kv_set(store, key, value);
            printf("OK\\n");
        } else if (sscanf(line, "GET %255s", key) == 1) {
            const char *val = kv_get(store, key);
            if (val)
                printf("%s\\n", val);
            else
                printf("(nil)\\n");
        } else if (sscanf(line, "DEL %255s", key) == 1) {
            printf(kv_del(store, key) ? "OK\\n" : "(nil)\\n");
        } else if (strncmp(line, "KEYS", 4) == 0) {
            for (size_t i = 0; i < store->capacity; i++) {
                if (store->entries[i].occupied == 1)
                    printf("  %s\\n", store->entries[i].key);
            }
        } else if (strncmp(line, "EXIT", 4) == 0) {
            break;
        } else {
            printf("Команды: SET <key> <value> | GET <key>"
                   " | DEL <key> | KEYS | EXIT\\n");
        }
    }

    fclose(store->wal);
    /* Освобождение памяти опущено для краткости */
    return 0;
}`,
      filename: 'kvstore.c',
    },
    {
      type: 'output',
      content: `KV-хранилище запущено (0 записей восстановлено)
kv> SET name Иван
OK
kv> SET age 30
OK
kv> GET name
Иван
kv> KEYS
  name
  age
kv> DEL age
OK
kv> GET age
(nil)
kv> EXIT`,
      prompt: '$ gcc -Wall -Wextra -o kvstore kvstore.c && ./kvstore',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Компактификация WAL',
      markdown:
        'Append-only лог растёт бесконечно: даже удалённые ключи остаются в файле. Реальные базы данных (Bitcask, LSM-деревья) периодически выполняют компактификацию — создают новый файл только с актуальными записями, а старый удаляют.',
    },
    {
      type: 'exercise',
      title: 'Реализуйте компактификацию WAL',
      description:
        'Добавьте команду `COMPACT`, которая создаёт новый файл WAL, содержащий только актуальные SET-записи (по одной на каждый существующий ключ). Старый WAL-файл удаляется и заменяется новым.',
      hints: [
        'Откройте временный файл (например, "kvstore.wal.tmp")',
        'Пройдите по всем occupied==1 записям в хеш-таблице и запишите SET для каждой',
        'Закройте оба файла, удалите старый (remove()), переименуйте новый (rename())',
        'Откройте переименованный файл заново для дальнейшего append',
      ],
      solution: `static void kv_compact(KVStore *store, const char *wal_path)
{
    const char *tmp_path = "kvstore.wal.tmp";
    FILE *tmp = fopen(tmp_path, "w");
    if (!tmp) {
        perror("compact: fopen");
        return;
    }

    for (size_t i = 0; i < store->capacity; i++) {
        Entry *e = &store->entries[i];
        if (e->occupied == 1) {
            fprintf(tmp, "SET %s %s\\n", e->key, e->value);
        }
    }
    fclose(tmp);
    fclose(store->wal);

    remove(wal_path);
    rename(tmp_path, wal_path);

    store->wal = fopen(wal_path, "ab+");
    printf("Компактификация завершена\\n");
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Добавьте TTL для ключей',
      description:
        'Реализуйте поддержку времени жизни (TTL) для ключей. Команда `SETEX <key> <seconds> <value>` задаёт ключ с ограниченным временем жизни. По истечении TTL `GET` должен возвращать `(nil)`, а запись должна удаляться при следующем обращении (lazy expiration).',
      hints: [
        'Добавьте поле time_t expires в структуру Entry (0 означает "без срока")',
        'В kv_get() проверяйте: если expires != 0 && time(NULL) > expires, удалите запись и верните NULL',
        'В WAL записывайте SETEX key seconds value и учитывайте это при восстановлении',
      ],
      solution: `#include <time.h>

/* Добавьте в структуру Entry: */
/* time_t expires;  // 0 = бессрочно */

static void kv_setex(KVStore *store, const char *key,
                     int ttl_seconds, const char *value)
{
    kv_set(store, key, value);
    Entry *slot = find_slot(store->entries, store->capacity, key);
    slot->expires = time(NULL) + ttl_seconds;

    /* Перезаписываем последнюю WAL-запись */
    fprintf(store->wal, "SETEX %s %d %s\\n", key, ttl_seconds, value);
    fflush(store->wal);
}

static const char *kv_get_with_expiry(KVStore *store, const char *key)
{
    Entry *slot = find_slot(store->entries, store->capacity, key);
    if (slot->occupied != 1) return NULL;
    if (slot->expires != 0 && time(NULL) > slot->expires) {
        /* Ленивое удаление: ключ истёк */
        free(slot->key);
        free(slot->value);
        slot->key = NULL;
        slot->value = NULL;
        slot->occupied = 2;
        store->size--;
        return NULL;
    }
    return slot->value;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
