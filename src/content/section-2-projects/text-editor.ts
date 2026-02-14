import type { Chapter } from '../types'

export default {
  id: 'text-editor',
  title: 'Текстовый редактор',
  description: 'Минимальный текстовый редактор в терминале',
  blocks: [
    {
      type: 'prose',
      markdown: `# Текстовый редактор в терминале

В этом проекте мы создадим минимальный текстовый редактор, работающий прямо в терминале, — по духу похожий на \`nano\` или \`kilo\`. Это один из лучших проектов для изучения C, потому что он затрагивает:

- Работу с терминалом в «сыром» режиме (raw mode)
- Управление экраном через ANSI escape-последовательности
- Динамическую работу с памятью (расширяемые буферы)
- Файловый ввод-вывод
- Обработку клавиатурных событий`,
    },
    {
      type: 'prose',
      markdown: `## Архитектура

Наш редактор состоит из нескольких модулей:

1. **Терминал** — переключение в raw mode, чтение нажатий клавиш
2. **Буфер** — хранение текста в виде массива строк
3. **Рендеринг** — отрисовка содержимого на экране
4. **Файловый ввод-вывод** — открытие и сохранение файлов
5. **Главный цикл** — обработка событий и команд

Текст хранится как динамический массив строк, где каждая строка — отдельный буфер переменной длины.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Raw mode',
      markdown:
        'По умолчанию терминал работает в каноническом режиме: ввод буферизуется по строкам, а специальные клавиши (Ctrl+C, Ctrl+Z) обрабатываются ядром. В сыром режиме (raw mode) каждое нажатие клавиши передаётся напрямую программе, а эхо-вывод отключается. Это необходимо для интерактивного редактора.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <termios.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>

static struct termios orig_termios;

static void disable_raw_mode(void)
{
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &orig_termios);
}

static void enable_raw_mode(void)
{
    tcgetattr(STDIN_FILENO, &orig_termios);
    atexit(disable_raw_mode);

    struct termios raw = orig_termios;
    /* Отключаем: эхо, канонический режим, сигналы, XON/XOFF */
    raw.c_iflag &= ~(BRKINT | ICRNL | INPCK | ISTRIP | IXON);
    raw.c_oflag &= ~(OPOST);
    raw.c_cflag |= (CS8);
    raw.c_lflag &= ~(ECHO | ICANON | IEXTEN | ISIG);
    raw.c_cc[VMIN] = 0;
    raw.c_cc[VTIME] = 1;  /* таймаут 100 мс */

    tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw);
}`,
      filename: 'editor.c',
    },
    {
      type: 'prose',
      markdown: `## Структуры данных

Каждая строка текста хранится в структуре \`EditorRow\`, содержащей символы и длину. Состояние редактора объединено в глобальную структуру \`EditorState\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <string.h>

typedef struct {
    char *chars;
    size_t len;
    size_t cap;
} EditorRow;

typedef struct {
    int cx, cy;            /* позиция курсора */
    int row_offset;        /* вертикальная прокрутка */
    int col_offset;        /* горизонтальная прокрутка */
    int screen_rows;
    int screen_cols;
    EditorRow *rows;
    int num_rows;
    int num_rows_cap;
    char *filename;
    int dirty;             /* были ли изменения */
    char status_msg[80];
} EditorState;

static EditorState E;

static void editor_row_init(EditorRow *row, const char *s, size_t len)
{
    row->cap = len + 1;
    row->chars = malloc(row->cap);
    memcpy(row->chars, s, len);
    row->chars[len] = '\\0';
    row->len = len;
}

static void editor_insert_row(int at, const char *s, size_t len)
{
    if (E.num_rows >= E.num_rows_cap) {
        E.num_rows_cap = E.num_rows_cap ? E.num_rows_cap * 2 : 8;
        E.rows = realloc(E.rows, sizeof(EditorRow) * (size_t)E.num_rows_cap);
    }
    /* Сдвигаем строки ниже точки вставки */
    memmove(&E.rows[at + 1], &E.rows[at],
            sizeof(EditorRow) * (size_t)(E.num_rows - at));
    editor_row_init(&E.rows[at], s, len);
    E.num_rows++;
    E.dirty = 1;
}`,
      filename: 'editor.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Чтение нажатия клавиши с обработкой escape-последовательностей */

enum EditorKey {
    ARROW_LEFT = 1000,
    ARROW_RIGHT,
    ARROW_UP,
    ARROW_DOWN,
    HOME_KEY,
    END_KEY,
    PAGE_UP,
    PAGE_DOWN,
    DEL_KEY
};

static int editor_read_key(void)
{
    char c;
    int nread;
    while ((nread = (int)read(STDIN_FILENO, &c, 1)) != 1) {
        if (nread == -1 && errno != EAGAIN) {
            perror("read");
            exit(1);
        }
    }

    if (c == '\\x1b') {
        char seq[3];
        if (read(STDIN_FILENO, &seq[0], 1) != 1) return '\\x1b';
        if (read(STDIN_FILENO, &seq[1], 1) != 1) return '\\x1b';

        if (seq[0] == '[') {
            switch (seq[1]) {
            case 'A': return ARROW_UP;
            case 'B': return ARROW_DOWN;
            case 'C': return ARROW_RIGHT;
            case 'D': return ARROW_LEFT;
            case 'H': return HOME_KEY;
            case 'F': return END_KEY;
            }
        }
        return '\\x1b';
    }
    return c;
}`,
      filename: 'editor.c',
    },
    {
      type: 'prose',
      markdown: `## Отрисовка экрана

Для обновления экрана мы используем ANSI escape-коды. Ключевая идея — собрать весь вывод в буфер и записать его одним вызовом \`write()\`, чтобы избежать мерцания.

Основные escape-коды:
- \`\\x1b[2J\` — очистить экран
- \`\\x1b[H\` — переместить курсор в начало
- \`\\x1b[K\` — очистить строку от курсора до конца
- \`\\x1b[?25l\` / \`\\x1b[?25h\` — скрыть/показать курсор`,
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Простой буфер для накопления вывода */
typedef struct {
    char *buf;
    size_t len;
    size_t cap;
} AppendBuf;

#define ABUF_INIT {NULL, 0, 0}

static void abuf_append(AppendBuf *ab, const char *s, size_t n)
{
    if (ab->len + n > ab->cap) {
        ab->cap = (ab->len + n) * 2;
        ab->buf = realloc(ab->buf, ab->cap);
    }
    memcpy(ab->buf + ab->len, s, n);
    ab->len += n;
}

static void abuf_free(AppendBuf *ab) { free(ab->buf); }

static void editor_refresh_screen(void)
{
    AppendBuf ab = ABUF_INIT;

    abuf_append(&ab, "\\x1b[?25l", 6);   /* скрыть курсор */
    abuf_append(&ab, "\\x1b[H", 3);      /* курсор в начало */

    for (int y = 0; y < E.screen_rows; y++) {
        int filerow = y + E.row_offset;
        if (filerow < E.num_rows) {
            EditorRow *row = &E.rows[filerow];
            int len = (int)row->len - E.col_offset;
            if (len < 0) len = 0;
            if (len > E.screen_cols) len = E.screen_cols;
            abuf_append(&ab, row->chars + E.col_offset, (size_t)len);
        } else {
            abuf_append(&ab, "~", 1);
        }
        abuf_append(&ab, "\\x1b[K", 3);  /* очистить остаток строки */
        abuf_append(&ab, "\\r\\n", 2);
    }

    /* Позиционируем курсор */
    char buf[32];
    int clen = snprintf(buf, sizeof(buf), "\\x1b[%d;%dH",
                        E.cy - E.row_offset + 1,
                        E.cx - E.col_offset + 1);
    abuf_append(&ab, buf, (size_t)clen);
    abuf_append(&ab, "\\x1b[?25h", 6);   /* показать курсор */

    write(STDOUT_FILENO, ab.buf, ab.len);
    abuf_free(&ab);
}`,
      filename: 'editor.c',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Двойная буферизация',
      markdown:
        'Техника накопления вывода в буфере перед записью — это аналог двойной буферизации в графике. Без неё вы увидите мерцание: каждый `write()` вызывает обновление терминала, и промежуточные состояния становятся заметными.',
    },
    {
      type: 'code',
      language: 'c',
      code: `static void editor_open(const char *filename)
{
    FILE *fp = fopen(filename, "r");
    if (!fp) {
        perror("fopen");
        return;
    }
    E.filename = strdup(filename);

    char *line = NULL;
    size_t linecap = 0;
    ssize_t linelen;
    while ((linelen = getline(&line, &linecap, fp)) != -1) {
        /* Убираем перевод строки */
        while (linelen > 0 &&
               (line[linelen - 1] == '\\n' || line[linelen - 1] == '\\r'))
            linelen--;
        editor_insert_row(E.num_rows, line, (size_t)linelen);
    }
    free(line);
    fclose(fp);
    E.dirty = 0;
}

static void editor_save(void)
{
    if (!E.filename) return;
    FILE *fp = fopen(E.filename, "w");
    if (!fp) {
        snprintf(E.status_msg, sizeof(E.status_msg),
                 "Ошибка сохранения: %s", strerror(errno));
        return;
    }
    for (int i = 0; i < E.num_rows; i++) {
        fwrite(E.rows[i].chars, 1, E.rows[i].len, fp);
        fwrite("\\n", 1, 1, fp);
    }
    fclose(fp);
    E.dirty = 0;
    snprintf(E.status_msg, sizeof(E.status_msg),
             "Сохранено: %d строк", E.num_rows);
}`,
      filename: 'editor.c',
    },
    {
      type: 'exercise',
      title: 'Реализуйте вставку и удаление символов',
      description:
        'Реализуйте функции `editor_row_insert_char()` и `editor_row_delete_char()`, которые вставляют или удаляют символ в заданной позиции строки. При вставке строка должна расширяться (через `realloc`), при удалении — сдвигать оставшиеся символы влево.',
      hints: [
        'При вставке используйте memmove для сдвига символов вправо',
        'Не забудьте обновить поля len и при необходимости cap',
        'При удалении достаточно сдвинуть символы на одну позицию влево через memmove',
        'Всегда проверяйте, что позиция находится в допустимом диапазоне',
      ],
      solution: `static void editor_row_insert_char(EditorRow *row, int at, char c)
{
    if (at < 0 || at > (int)row->len)
        at = (int)row->len;
    if (row->len + 2 > row->cap) {
        row->cap = (row->len + 2) * 2;
        row->chars = realloc(row->chars, row->cap);
    }
    memmove(&row->chars[at + 1], &row->chars[at], row->len - (size_t)at + 1);
    row->chars[at] = c;
    row->len++;
    E.dirty = 1;
}

static void editor_row_delete_char(EditorRow *row, int at)
{
    if (at < 0 || at >= (int)row->len) return;
    memmove(&row->chars[at], &row->chars[at + 1],
            row->len - (size_t)at);
    row->len--;
    E.dirty = 1;
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Добавьте поиск по тексту',
      description:
        'Реализуйте инкрементальный поиск по тексту (Ctrl+F). При каждом вводе символа в строку поиска редактор должен находить и подсвечивать первое совпадение. Enter — перейти к следующему совпадению, Escape — выйти из режима поиска.',
      hints: [
        'Используйте strstr() для поиска подстроки в каждой строке',
        'Сохраняйте позицию последнего совпадения, чтобы при Enter искать дальше',
        'Перед поиском запомните позицию курсора, чтобы восстановить её при Escape',
      ],
      solution: `static void editor_find(void)
{
    char query[256] = "";
    int qlen = 0;
    int saved_cx = E.cx, saved_cy = E.cy;
    int last_match_row = -1;

    while (1) {
        snprintf(E.status_msg, sizeof(E.status_msg),
                 "Поиск: %s (Enter/Esc)", query);
        editor_refresh_screen();

        int c = editor_read_key();
        if (c == '\\r' || c == '\\n') {
            /* Искать следующее совпадение */
            last_match_row++;
        } else if (c == '\\x1b') {
            E.cx = saved_cx;
            E.cy = saved_cy;
            E.status_msg[0] = '\\0';
            return;
        } else if (c == 127) {
            if (qlen > 0) query[--qlen] = '\\0';
            last_match_row = -1;
        } else if (qlen < 255) {
            query[qlen++] = (char)c;
            query[qlen] = '\\0';
            last_match_row = -1;
        }

        for (int i = last_match_row + 1; i < E.num_rows; i++) {
            char *match = strstr(E.rows[i].chars, query);
            if (match) {
                E.cy = i;
                E.cx = (int)(match - E.rows[i].chars);
                last_match_row = i;
                break;
            }
        }
    }
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
