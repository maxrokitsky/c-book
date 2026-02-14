import type { Chapter } from '../types'

export default {
  id: 'file-io',
  title: 'Файловый ввод/вывод',
  description: 'fopen, fread, fwrite, fseek, бинарные файлы',
  blocks: [
    {
      type: 'prose',
      markdown: `# Файловый ввод/вывод в C

Работа с файлами — одна из ключевых задач системного программирования. Стандартная библиотека C предоставляет **буферизованный ввод/вывод** через тип \`FILE *\` (определён в \`<stdio.h>\`).

Основной алгоритм работы с файлом:

1. **Открыть** файл с помощью \`fopen\`
2. **Прочитать** или **записать** данные
3. **Закрыть** файл с помощью \`fclose\``,
    },
    {
      type: 'prose',
      markdown: `## Открытие и закрытие файлов

Функция \`fopen\` принимает путь к файлу и режим открытия:

| Режим | Описание |
|-------|----------|
| \`"r"\` | Чтение (файл должен существовать) |
| \`"w"\` | Запись (создаёт файл или обрезает существующий) |
| \`"a"\` | Дозапись в конец файла |
| \`"r+"\` | Чтение и запись (файл должен существовать) |
| \`"w+"\` | Чтение и запись (создаёт или обрезает) |
| \`"rb"\`, \`"wb"\` | Бинарный режим |`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    FILE *fp = fopen("example.txt", "w");
    if (fp == NULL) {
        perror("Ошибка открытия файла");
        return EXIT_FAILURE;
    }

    fprintf(fp, "Привет, файловый мир!\\n");
    fprintf(fp, "Строка номер %d\\n", 2);

    fclose(fp);
    printf("Файл успешно записан.\\n");
    return EXIT_SUCCESS;
}`,
      filename: 'file_write.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Всегда проверяйте fopen',
      markdown:
        'Если файл не удалось открыть, `fopen` возвращает `NULL`. '
        + 'Запись или чтение через нулевой указатель — **неопределённое поведение**, '
        + 'которое обычно приводит к аварийному завершению программы (segfault).',
    },
    {
      type: 'prose',
      markdown: `## Посимвольное и построчное чтение

Для текстовых файлов часто используют \`fgetc\` (чтение по одному символу) и \`fgets\` (чтение строки).`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

/* Чтение файла построчно */
void read_lines(const char *filename) {
    FILE *fp = fopen(filename, "r");
    if (!fp) {
        perror(filename);
        return;
    }

    char line[256];
    int line_num = 1;

    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("%3d | %s", line_num++, line);
    }

    fclose(fp);
}

/* Подсчёт символов посимвольным чтением */
long count_chars(const char *filename) {
    FILE *fp = fopen(filename, "r");
    if (!fp) return -1;

    long count = 0;
    while (fgetc(fp) != EOF) {
        count++;
    }

    fclose(fp);
    return count;
}

int main(void) {
    read_lines("example.txt");
    printf("\\nВсего символов: %ld\\n", count_chars("example.txt"));
    return 0;
}`,
      filename: 'file_read.c',
    },
    {
      type: 'output',
      content: `  1 | Привет, файловый мир!
  2 | Строка номер 2

Всего символов: 40`,
    },
    {
      type: 'prose',
      markdown: `## Бинарные файлы: fread и fwrite

Для работы с бинарными данными (структуры, массивы чисел) используют \`fread\` и \`fwrite\`. Они читают и записывают блоки байтов без интерпретации содержимого.

\`\`\`
size_t fwrite(const void *ptr, size_t size, size_t count, FILE *stream);
size_t fread(void *ptr, size_t size, size_t count, FILE *stream);
\`\`\`

Обе функции возвращают количество **успешно** обработанных элементов.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[32];
    int age;
    double score;
} Student;

void save_students(const char *filename, const Student *students, size_t n) {
    FILE *fp = fopen(filename, "wb");
    if (!fp) { perror("save"); return; }

    size_t written = fwrite(students, sizeof(Student), n, fp);
    if (written != n) {
        fprintf(stderr, "Записано %zu из %zu записей\\n", written, n);
    }
    fclose(fp);
}

size_t load_students(const char *filename, Student *buf, size_t max) {
    FILE *fp = fopen(filename, "rb");
    if (!fp) { perror("load"); return 0; }

    size_t count = fread(buf, sizeof(Student), max, fp);
    fclose(fp);
    return count;
}

int main(void) {
    Student students[] = {
        {"Иванов", 20, 4.5},
        {"Петрова", 22, 4.8},
        {"Сидоров", 21, 3.9},
    };
    size_t n = sizeof(students) / sizeof(students[0]);

    save_students("students.bin", students, n);

    Student loaded[10];
    size_t count = load_students("students.bin", loaded, 10);

    for (size_t i = 0; i < count; i++) {
        printf("%-10s  возраст: %d  балл: %.1f\\n",
               loaded[i].name, loaded[i].age, loaded[i].score);
    }
    return 0;
}`,
      filename: 'binary_io.c',
    },
    {
      type: 'output',
      content: `Иванов      возраст: 20  балл: 4.5
Петрова     возраст: 22  балл: 4.8
Сидоров     возраст: 21  балл: 3.9`,
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Портируемость бинарных файлов',
      markdown:
        'Бинарные файлы, записанные `fwrite`, зависят от платформы: порядок байтов '
        + '(endianness), выравнивание структур и размеры типов могут различаться. '
        + 'Для переносимого формата используйте текстовые форматы (JSON, CSV) '
        + 'или специальные библиотеки сериализации (Protocol Buffers, MessagePack).',
    },
    {
      type: 'prose',
      markdown: `## Позиционирование: fseek и ftell

Функции \`fseek\` и \`ftell\` позволяют перемещаться по файлу и узнавать текущую позицию. Это особенно полезно для бинарных файлов, где нужен произвольный доступ к записям.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    char name[32];
} Record;

/* Чтение N-й записи из бинарного файла (0-based) */
int read_record(const char *filename, int index, Record *out) {
    FILE *fp = fopen(filename, "rb");
    if (!fp) return -1;

    /* Перемещаемся к нужной записи */
    if (fseek(fp, (long)(index * sizeof(Record)), SEEK_SET) != 0) {
        fclose(fp);
        return -1;
    }

    size_t read = fread(out, sizeof(Record), 1, fp);
    fclose(fp);
    return (read == 1) ? 0 : -1;
}

/* Определение размера файла */
long file_size(const char *filename) {
    FILE *fp = fopen(filename, "rb");
    if (!fp) return -1;

    fseek(fp, 0, SEEK_END);    /* Переход в конец файла */
    long size = ftell(fp);      /* Текущая позиция = размер */
    fclose(fp);
    return size;
}

int main(void) {
    printf("Размер файла: %ld байт\\n", file_size("students.bin"));
    return 0;
}`,
      filename: 'fseek_example.c',
    },
    {
      type: 'quiz',
      question: 'Что произойдёт при открытии существующего файла в режиме "w"?',
      options: [
        'Данные будут дописаны в конец файла',
        'Файл будет открыт только для чтения',
        'Содержимое файла будет удалено (файл обрезается до нуля)',
        'fopen вернёт NULL, если файл уже существует',
      ],
      correctIndex: 2,
      explanation:
        'Режим "w" (write) создаёт новый файл или обрезает существующий до нулевой длины. '
        + 'Все предыдущие данные теряются. Для дозаписи используйте режим "a" (append).',
    },
    {
      type: 'exercise',
      title: 'Копирование файла',
      description:
        'Напишите программу, которая принимает два аргумента командной строки '
        + '(исходный и целевой файлы) и копирует содержимое первого во второй. '
        + 'Программа должна работать как с текстовыми, так и с бинарными файлами. '
        + 'Обработайте все возможные ошибки.',
      hints: [
        'Открывайте файлы в бинарном режиме ("rb" и "wb"), чтобы корректно копировать любые данные',
        'Читайте данные блоками в буфер и записывайте прочитанное количество байт',
        'Проверяйте возвращаемые значения fread и fwrite',
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Использование: %s <источник> <назначение>\\n", argv[0]);
        return EXIT_FAILURE;
    }

    FILE *src = fopen(argv[1], "rb");
    if (!src) {
        perror(argv[1]);
        return EXIT_FAILURE;
    }

    FILE *dst = fopen(argv[2], "wb");
    if (!dst) {
        perror(argv[2]);
        fclose(src);
        return EXIT_FAILURE;
    }

    char buf[4096];
    size_t bytes;
    while ((bytes = fread(buf, 1, sizeof(buf), src)) > 0) {
        if (fwrite(buf, 1, bytes, dst) != bytes) {
            perror("Ошибка записи");
            fclose(src);
            fclose(dst);
            return EXIT_FAILURE;
        }
    }

    if (ferror(src)) {
        perror("Ошибка чтения");
    }

    fclose(src);
    fclose(dst);
    printf("Файл скопирован успешно.\\n");
    return EXIT_SUCCESS;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
