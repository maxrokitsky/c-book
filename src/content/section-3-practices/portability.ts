import type { Chapter } from '../types'

export default {
  id: 'portability',
  title: 'Портируемость',
  description: 'Написание переносимого кода на C для разных платформ и компиляторов',
  blocks: [
    {
      type: 'prose',
      markdown: `# Портируемость

Одно из главных достоинств C — портируемость: один и тот же код можно скомпилировать для Linux, Windows, macOS, встраиваемых систем и даже мейнфреймов. Но портируемость не даётся автоматически — нужно осознанно избегать платформо-зависимого кода.

В этой главе мы рассмотрим типичные проблемы портируемости и способы их решения.`,
    },
    {
      type: 'prose',
      markdown: `## Размеры типов

Размеры базовых типов (\`int\`, \`long\`, \`size_t\`) различаются между платформами:

| Тип | Linux x86_64 | Windows x86_64 | 32-bit |
|-----|-------------|----------------|--------|
| \`int\` | 4 байта | 4 байта | 4 байта |
| \`long\` | **8** байт | **4** байта | 4 байта |
| \`size_t\` | 8 байт | 8 байт | 4 байта |
| \`void *\` | 8 байт | 8 байт | 4 байта |

Используйте типы фиксированного размера из \`<stdint.h>\`, когда размер важен:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdint.h>
#include <inttypes.h>

/* Плохо: размер long различается между Linux и Windows */
long timestamp;

/* Хорошо: всегда 64 бита */
int64_t timestamp;

/* Плохо: %ld не работает для int64_t на Windows */
printf("%ld\\n", timestamp);

/* Хорошо: макросы из <inttypes.h> */
printf("%" PRId64 "\\n", timestamp);

/* Типы фиксированного размера */
uint8_t  byte_val;     /* всегда 1 байт  */
int16_t  short_val;    /* всегда 2 байта */
int32_t  int_val;      /* всегда 4 байта */
uint64_t big_val;      /* всегда 8 байт  */
size_t   array_size;   /* для размеров и индексов */`,
      filename: 'portable_types.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Не делайте предположений о размерах',
      markdown: 'Никогда не записывайте `sizeof(int) == 4` как допущение. Используйте `sizeof` всегда, когда работаете с размерами типов. Для бинарных форматов файлов и сетевых протоколов используйте типы фиксированного размера из `<stdint.h>`.',
    },
    {
      type: 'prose',
      markdown: `## Порядок байт (endianness)

Разные архитектуры хранят многобайтовые числа по-разному:
- **Little-endian** (x86, ARM по умолчанию): младший байт первым
- **Big-endian** (сетевой порядок, SPARC, PowerPC): старший байт первым

Это критично при работе с бинарными файлами и сетевыми протоколами:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdint.h>
#include <arpa/inet.h>  /* htonl, ntohl — POSIX */

/* Преобразование в сетевой порядок байт (big-endian) */
uint32_t host_value = 0x12345678;
uint32_t network_value = htonl(host_value);

/* Обратное преобразование */
uint32_t restored = ntohl(network_value);

/* Ручное преобразование (если нет arpa/inet.h) */
uint32_t to_big_endian(uint32_t val)
{
    return ((val >> 24) & 0xFF)
         | ((val >>  8) & 0xFF00)
         | ((val <<  8) & 0xFF0000)
         | ((val << 24) & 0xFF000000);
}`,
      filename: 'endianness.c',
    },
    {
      type: 'prose',
      markdown: `## Условная компиляция

Для платформо-зависимого кода используйте препроцессор:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stddef.h>

/* Определение платформы */
#if defined(_WIN32) || defined(_WIN64)
    #define PLATFORM_WINDOWS
#elif defined(__linux__)
    #define PLATFORM_LINUX
#elif defined(__APPLE__) && defined(__MACH__)
    #define PLATFORM_MACOS
#else
    #error "Unsupported platform"
#endif

/* Платформо-зависимый код за абстракцией */
#ifdef PLATFORM_WINDOWS
    #include <windows.h>
    void platform_sleep(unsigned int ms)
    {
        Sleep(ms);
    }
#else
    #include <unistd.h>
    void platform_sleep(unsigned int ms)
    {
        usleep(ms * 1000u);
    }
#endif

/* Определение компилятора */
#if defined(__GNUC__)
    #define UNUSED __attribute__((unused))
    #define NORETURN __attribute__((noreturn))
#elif defined(_MSC_VER)
    #define UNUSED
    #define NORETURN __declspec(noreturn)
#else
    #define UNUSED
    #define NORETURN
#endif`,
      filename: 'platform.h',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Изолируйте платформо-зависимый код',
      markdown: 'Вместо разбрасывания `#ifdef` по всему коду, вынесите платформо-зависимый код в отдельные файлы (`platform_linux.c`, `platform_win32.c`) за общим интерфейсом (`platform.h`). Система сборки выберет нужный файл. Это намного чище и проще в поддержке.',
    },
    {
      type: 'prose',
      markdown: `## Выравнивание и упаковка структур

Компиляторы добавляют выравнивание (padding) в структуры. Порядок полей влияет на размер:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdint.h>

/* Плохой порядок: 24 байта (из-за паддинга) */
struct BadLayout {
    char     a;    /* 1 + 7 padding */
    double   b;    /* 8 */
    char     c;    /* 1 + 7 padding */
};

/* Хороший порядок: 16 байт */
struct GoodLayout {
    double   b;    /* 8 */
    char     a;    /* 1 */
    char     c;    /* 1 + 6 padding */
};

int main(void)
{
    printf("Bad:  %zu\\n", sizeof(struct BadLayout));   /* 24 */
    printf("Good: %zu\\n", sizeof(struct GoodLayout));  /* 16 */
    return 0;
}`,
      filename: 'struct_padding.c',
    },
    {
      type: 'quiz',
      question: 'Почему тип long имеет разный размер на Linux и Windows (обе 64-bit)?',
      options: [
        'Это баг в Windows-компиляторе',
        'Linux использует LP64 модель (long = 64 bit), Windows — LLP64 (long = 32 bit)',
        'Размер long определяется аппаратурой, а не ОС',
        'На Windows long всегда 64-bit, если использовать MSVC',
      ],
      correctIndex: 1,
      explanation:
        'Linux/macOS используют модель данных LP64, где long = 64 бита. Windows использует модель LLP64, где long = 32 бита (только long long = 64 бита). Это историческое решение для обратной совместимости. Поэтому для переносимого кода используйте int64_t вместо long.',
    },
    {
      type: 'exercise',
      title: 'Напишите переносимую функцию чтения бинарного файла',
      description:
        'Напишите функцию, которая читает структуру заголовка бинарного файла (magic: 4 байта, version: 2 байта, data_size: 4 байта) переносимым образом. Учтите порядок байт (файл в big-endian) и выравнивание.',
      hints: [
        'Используйте типы фиксированного размера из <stdint.h>',
        'Не читайте структуру целиком через fread — это непереносимо из-за паддинга',
        'Конвертируйте из big-endian в хостовый порядок',
      ],
      solution: `#include <stdio.h>
#include <stdint.h>
#include <string.h>

typedef struct {
    uint8_t  magic[4];
    uint16_t version;
    uint32_t data_size;
} FileHeader;

/* Чтение 16-bit big-endian числа */
static uint16_t read_be16(const uint8_t *p)
{
    return (uint16_t)((p[0] << 8) | p[1]);
}

/* Чтение 32-bit big-endian числа */
static uint32_t read_be32(const uint8_t *p)
{
    return ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16)
         | ((uint32_t)p[2] <<  8) |  (uint32_t)p[3];
}

int read_header(FILE *f, FileHeader *hdr)
{
    uint8_t raw[10]; /* 4 + 2 + 4 = 10 байт на диске */
    if (fread(raw, 1, sizeof(raw), f) != sizeof(raw))
        return -1;

    memcpy(hdr->magic, raw, 4);
    hdr->version   = read_be16(raw + 4);
    hdr->data_size = read_be32(raw + 6);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
