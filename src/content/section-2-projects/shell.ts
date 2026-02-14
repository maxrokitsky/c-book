import type { Chapter } from '../types'

export default {
  id: 'shell',
  title: 'Unix-шелл',
  description: 'Интерпретатор команд с пайпами и перенаправлениями',
  blocks: [
    {
      type: 'prose',
      markdown: `# Unix-шелл

Написание собственного шелла — один из лучших способов понять, как работает Unix. Шелл — это программа, которая читает команды от пользователя и выполняет их, создавая дочерние процессы. Наш шелл будет поддерживать:

- Запуск внешних программ (\`ls\`, \`cat\`, \`gcc\` и т.д.)
- Встроенные команды (\`cd\`, \`exit\`, \`pwd\`)
- Пайпы: \`ls | grep .c | wc -l\`
- Перенаправление ввода-вывода: \`sort < input.txt > output.txt\`
- Фоновое выполнение: \`sleep 10 &\`

Этот проект научит вас работать с ключевыми системными вызовами: \`fork()\`, \`exec()\`, \`pipe()\`, \`dup2()\`, \`waitpid()\`.`,
    },
    {
      type: 'prose',
      markdown: `## Как работает шелл

Основной цикл шелла прост:

1. Вывести приглашение (prompt)
2. Прочитать строку ввода
3. Разобрать строку на команды, аргументы, пайпы и перенаправления
4. Для каждой команды: \`fork()\` — создать дочерний процесс, \`exec()\` — заменить его образ нужной программой
5. Ожидать завершения дочерних процессов (\`waitpid()\`)
6. Перейти к шагу 1

Ключевая идея Unix: \`fork()\` создаёт копию текущего процесса, а \`exec()\` заменяет эту копию другой программой. Разделение на два вызова даёт гибкость — между \`fork()\` и \`exec()\` можно настроить перенаправления и пайпы.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'fork() + exec()',
      markdown:
        'Сочетание `fork()` и `exec()` — краеугольный камень Unix. `fork()` создаёт точную копию процесса (включая все файловые дескрипторы). `exec()` заменяет текущий образ процесса новой программой. Это позволяет дочернему процессу унаследовать настроенные перенаправления от родителя.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <errno.h>

#define MAX_ARGS 64
#define MAX_PIPES 16
#define MAX_LINE 1024

typedef struct {
    char *args[MAX_ARGS];
    int argc;
    char *infile;     /* перенаправление stdin (<) */
    char *outfile;    /* перенаправление stdout (>) */
    int append;       /* >> вместо > */
    int background;   /* & в конце */
} Command;

/* Разбор одной команды (без пайпов) */
static int parse_command(char *input, Command *cmd)
{
    memset(cmd, 0, sizeof(Command));
    char *tok = strtok(input, " \\t\\n");
    while (tok) {
        if (strcmp(tok, "<") == 0) {
            tok = strtok(NULL, " \\t\\n");
            if (!tok) {
                fprintf(stderr, "mysh: ожидалось имя файла после '<'\\n");
                return -1;
            }
            cmd->infile = tok;
        } else if (strcmp(tok, ">") == 0) {
            tok = strtok(NULL, " \\t\\n");
            if (!tok) {
                fprintf(stderr, "mysh: ожидалось имя файла после '>'\\n");
                return -1;
            }
            cmd->outfile = tok;
            cmd->append = 0;
        } else if (strcmp(tok, ">>") == 0) {
            tok = strtok(NULL, " \\t\\n");
            if (!tok) {
                fprintf(stderr, "mysh: ожидалось имя файла после '>>'\\n");
                return -1;
            }
            cmd->outfile = tok;
            cmd->append = 1;
        } else if (strcmp(tok, "&") == 0) {
            cmd->background = 1;
        } else {
            if (cmd->argc >= MAX_ARGS - 1) break;
            cmd->args[cmd->argc++] = tok;
        }
        tok = strtok(NULL, " \\t\\n");
    }
    cmd->args[cmd->argc] = NULL;
    return cmd->argc > 0 ? 0 : -1;
}`,
      filename: 'mysh.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Встроенные команды */
static int builtin_cd(Command *cmd)
{
    const char *dir = cmd->argc > 1 ? cmd->args[1] : getenv("HOME");
    if (chdir(dir) != 0)
        perror("cd");
    return 1;
}

static int builtin_pwd(void)
{
    char cwd[1024];
    if (getcwd(cwd, sizeof(cwd)))
        printf("%s\\n", cwd);
    else
        perror("pwd");
    return 1;
}

/* Возвращает 1, если команда встроенная (обработана), 0 — если нет */
static int try_builtin(Command *cmd)
{
    if (strcmp(cmd->args[0], "cd") == 0) return builtin_cd(cmd);
    if (strcmp(cmd->args[0], "pwd") == 0) return builtin_pwd();
    if (strcmp(cmd->args[0], "exit") == 0) exit(0);
    return 0;
}`,
      filename: 'mysh.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Запуск одной команды с перенаправлениями */
static void exec_command(Command *cmd)
{
    if (cmd->infile) {
        int fd = open(cmd->infile, O_RDONLY);
        if (fd < 0) {
            perror(cmd->infile);
            exit(1);
        }
        dup2(fd, STDIN_FILENO);
        close(fd);
    }

    if (cmd->outfile) {
        int flags = O_WRONLY | O_CREAT;
        flags |= cmd->append ? O_APPEND : O_TRUNC;
        int fd = open(cmd->outfile, flags, 0644);
        if (fd < 0) {
            perror(cmd->outfile);
            exit(1);
        }
        dup2(fd, STDOUT_FILENO);
        close(fd);
    }

    execvp(cmd->args[0], cmd->args);
    fprintf(stderr, "mysh: %s: %s\\n", cmd->args[0], strerror(errno));
    exit(127);
}

/* Запуск одной команды без пайпов */
static void run_single(Command *cmd)
{
    if (try_builtin(cmd)) return;

    pid_t pid = fork();
    if (pid == 0) {
        exec_command(cmd);
    } else if (pid > 0) {
        if (!cmd->background)
            waitpid(pid, NULL, 0);
        else
            printf("[%d]\\n", pid);
    } else {
        perror("fork");
    }
}`,
      filename: 'mysh.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Запуск конвейера (pipeline): cmd1 | cmd2 | cmd3 */
static void run_pipeline(char *line)
{
    /* Разбиваем по символу '|' */
    char *segments[MAX_PIPES];
    int num_cmds = 0;
    char *seg = strtok(line, "|");
    while (seg && num_cmds < MAX_PIPES) {
        segments[num_cmds++] = seg;
        seg = strtok(NULL, "|");
    }

    if (num_cmds == 1) {
        Command cmd;
        if (parse_command(segments[0], &cmd) == 0)
            run_single(&cmd);
        return;
    }

    int prev_fd = -1;  /* файловый дескриптор чтения предыдущего пайпа */
    pid_t pids[MAX_PIPES];

    for (int i = 0; i < num_cmds; i++) {
        Command cmd;
        if (parse_command(segments[i], &cmd) != 0) break;

        int pipefd[2] = {-1, -1};
        if (i < num_cmds - 1) {
            if (pipe(pipefd) < 0) {
                perror("pipe");
                break;
            }
        }

        pid_t pid = fork();
        if (pid == 0) {
            /* Дочерний процесс: настраиваем stdin и stdout */
            if (prev_fd != -1) {
                dup2(prev_fd, STDIN_FILENO);
                close(prev_fd);
            }
            if (pipefd[1] != -1) {
                dup2(pipefd[1], STDOUT_FILENO);
                close(pipefd[1]);
            }
            if (pipefd[0] != -1) close(pipefd[0]);
            exec_command(&cmd);
        }
        pids[i] = pid;

        if (prev_fd != -1) close(prev_fd);
        if (pipefd[1] != -1) close(pipefd[1]);
        prev_fd = pipefd[0];
    }

    /* Ожидаем завершения всех процессов конвейера */
    for (int i = 0; i < num_cmds; i++)
        waitpid(pids[i], NULL, 0);
}`,
      filename: 'mysh.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `int main(void)
{
    char line[MAX_LINE];

    while (1) {
        printf("mysh$ ");
        if (!fgets(line, sizeof(line), stdin))
            break;

        /* Пустая строка — пропускаем */
        if (line[0] == '\\n') continue;

        /* Конвейеры требуют работы с оригинальной строкой */
        run_pipeline(line);
    }

    printf("\\n");
    return 0;
}`,
      filename: 'mysh.c',
    },
    {
      type: 'output',
      content: `mysh$ echo Hello, World!
Hello, World!
mysh$ ls -la | grep .c
-rw-r--r-- 1 user user 4521 Mar 15 14:30 mysh.c
mysh$ echo test > out.txt
mysh$ cat out.txt
test
mysh$ pwd
/home/user/projects/shell
mysh$ cd /tmp
mysh$ pwd
/tmp
mysh$ exit`,
      prompt: '$ gcc -Wall -Wextra -o mysh mysh.c && ./mysh',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Обработка зомби-процессов',
      markdown:
        'Когда дочерний процесс завершается, а родитель не вызывает `waitpid()`, процесс становится «зомби» — он занимает запись в таблице процессов ядра. Для фоновых процессов (`&`) необходимо обрабатывать сигнал `SIGCHLD` или периодически вызывать `waitpid(-1, NULL, WNOHANG)`.',
    },
    {
      type: 'exercise',
      title: 'Добавьте поддержку переменных окружения',
      description:
        'Реализуйте встроенную команду `export VAR=value`, которая устанавливает переменную окружения, и подстановку `$VAR` в аргументах команд. Например, `export GREETING=hello` затем `echo $GREETING` должно вывести `hello`.',
      hints: [
        'Для установки используйте setenv(name, value, 1)',
        'Перед разбором аргументов пройдите по строке и замените $VAR на результат getenv()',
        'Учтите, что имя переменной может заканчиваться пробелом, /, или концом строки',
      ],
      solution: `static void expand_vars(char *line, size_t max_len)
{
    char buf[MAX_LINE];
    size_t bi = 0;
    for (size_t i = 0; line[i] && bi < max_len - 1; i++) {
        if (line[i] == '$') {
            /* Извлекаем имя переменной */
            char name[256];
            size_t ni = 0;
            i++;
            while (line[i] && (isalnum(line[i]) || line[i] == '_')
                   && ni < sizeof(name) - 1) {
                name[ni++] = line[i++];
            }
            name[ni] = '\\0';
            i--;  /* strtok вернёт следующий символ */

            const char *val = getenv(name);
            if (val) {
                size_t vlen = strlen(val);
                if (bi + vlen < max_len) {
                    memcpy(buf + bi, val, vlen);
                    bi += vlen;
                }
            }
        } else {
            buf[bi++] = line[i];
        }
    }
    buf[bi] = '\\0';
    strncpy(line, buf, max_len);
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Реализуйте обработку сигнала SIGCHLD',
      description:
        'Добавьте обработчик сигнала `SIGCHLD` для корректного сбора статуса завершённых фоновых процессов. При завершении фонового процесса шелл должен вывести сообщение вида `[PID] завершён`.',
      hints: [
        'Используйте sigaction() для установки обработчика SIGCHLD',
        'В обработчике вызывайте waitpid(-1, &status, WNOHANG) в цикле',
        'Обработчик сигнала не должен вызывать printf — используйте write()',
      ],
      solution: `#include <signal.h>

static void sigchld_handler(int sig)
{
    (void)sig;
    int status;
    pid_t pid;
    while ((pid = waitpid(-1, &status, WNOHANG)) > 0) {
        /* Безопасная запись в обработчике сигнала */
        char msg[64];
        int len = snprintf(msg, sizeof(msg),
                           "\\n[%d] завершён\\n", pid);
        write(STDOUT_FILENO, msg, (size_t)len);
    }
}

/* В main() перед основным циклом: */
static void setup_signals(void)
{
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;
    sigaction(SIGCHLD, &sa, NULL);
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
