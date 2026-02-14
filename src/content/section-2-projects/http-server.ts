import type { Chapter } from '../types'

export default {
  id: 'http-server',
  title: 'HTTP-сервер',
  description: 'Простой HTTP/1.1 сервер с сокетами',
  blocks: [
    {
      type: 'prose',
      markdown: `# Простой HTTP-сервер

В этом проекте мы напишем HTTP/1.1 сервер с нуля, используя POSIX-сокеты. Сервер будет обслуживать статические файлы и обрабатывать базовые HTTP-запросы. Это отличный проект для понимания:

- Сетевого программирования на уровне сокетов
- Протокола HTTP (формат запросов и ответов)
- Многопоточной обработки соединений
- Файлового ввода-вывода и определения MIME-типов`,
    },
    {
      type: 'prose',
      markdown: `## Протокол HTTP/1.1

HTTP — текстовый протокол. Клиент отправляет запрос, сервер возвращает ответ. Запрос выглядит так:

\`\`\`
GET /index.html HTTP/1.1\\r\\n
Host: localhost:8080\\r\\n
Connection: close\\r\\n
\\r\\n
\`\`\`

Ответ сервера:

\`\`\`
HTTP/1.1 200 OK\\r\\n
Content-Type: text/html\\r\\n
Content-Length: 45\\r\\n
\\r\\n
<html><body><h1>Hello!</h1></body></html>
\`\`\`

Каждая строка заголовка заканчивается \`\\r\\n\`, а тело отделено от заголовков пустой строкой \`\\r\\n\\r\\n\`.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Сокеты Беркли',
      markdown:
        'API сокетов (Berkeley sockets) появился в BSD Unix в 1983 году и с тех пор стал стандартом де-факто для сетевого программирования. Даже современные высокоуровневые фреймворки в конечном счёте вызывают те же системные вызовы: `socket()`, `bind()`, `listen()`, `accept()`.',
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>

#define PORT 8080
#define BUFFER_SIZE 8192
#define WEBROOT "./www"

/* Создание, привязка и начало прослушивания серверного сокета */
static int server_init(int port)
{
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket");
        exit(1);
    }

    /* Разрешаем повторное использование адреса */
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {
        .sin_family = AF_INET,
        .sin_addr.s_addr = INADDR_ANY,
        .sin_port = htons((uint16_t)port),
    };

    if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        exit(1);
    }

    if (listen(server_fd, 128) < 0) {
        perror("listen");
        exit(1);
    }

    printf("Сервер запущен на порту %d\\n", port);
    return server_fd;
}`,
      filename: 'httpd.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Парсинг строки запроса: "GET /path HTTP/1.1" */
typedef struct {
    char method[8];
    char path[256];
    char version[16];
} HttpRequest;

static int parse_request(const char *raw, HttpRequest *req)
{
    /* Читаем первую строку запроса */
    int n = sscanf(raw, "%7s %255s %15s", req->method, req->path, req->version);
    if (n != 3) return -1;

    /* Защита от обхода каталогов (path traversal) */
    if (strstr(req->path, "..") != NULL) {
        fprintf(stderr, "Попытка обхода каталогов: %s\\n", req->path);
        return -1;
    }

    return 0;
}

/* Определение MIME-типа по расширению файла */
static const char *get_mime_type(const char *path)
{
    const char *ext = strrchr(path, '.');
    if (!ext) return "application/octet-stream";
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".css") == 0)  return "text/css";
    if (strcmp(ext, ".js") == 0)   return "application/javascript";
    if (strcmp(ext, ".png") == 0)  return "image/png";
    if (strcmp(ext, ".jpg") == 0)  return "image/jpeg";
    if (strcmp(ext, ".gif") == 0)  return "image/gif";
    if (strcmp(ext, ".txt") == 0)  return "text/plain";
    return "application/octet-stream";
}`,
      filename: 'httpd.c',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Безопасность: обход каталогов',
      markdown:
        'Если сервер не проверяет путь, злоумышленник может запросить `GET /../../../etc/passwd` и прочитать произвольные файлы. Всегда фильтруйте `..` и нормализуйте пути. В production-серверах используется `realpath()` и проверка, что результат начинается с корня webroot.',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Отправка HTTP-ответа с файлом или ошибкой */
static void send_response(int client_fd, int status, const char *status_text,
                          const char *content_type, const char *body,
                          size_t body_len)
{
    char header[512];
    int hlen = snprintf(header, sizeof(header),
        "HTTP/1.1 %d %s\\r\\n"
        "Content-Type: %s\\r\\n"
        "Content-Length: %zu\\r\\n"
        "Connection: close\\r\\n"
        "\\r\\n",
        status, status_text, content_type, body_len);

    write(client_fd, header, (size_t)hlen);
    if (body && body_len > 0)
        write(client_fd, body, body_len);
}

static void serve_file(int client_fd, const char *path)
{
    char filepath[512];
    snprintf(filepath, sizeof(filepath), "%s%s",
             WEBROOT, strcmp(path, "/") == 0 ? "/index.html" : path);

    FILE *fp = fopen(filepath, "rb");
    if (!fp) {
        const char *msg = "<h1>404 Not Found</h1>";
        send_response(client_fd, 404, "Not Found",
                      "text/html", msg, strlen(msg));
        return;
    }

    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    char *buf = malloc((size_t)size);
    fread(buf, 1, (size_t)size, fp);
    fclose(fp);

    send_response(client_fd, 200, "OK",
                  get_mime_type(filepath), buf, (size_t)size);
    free(buf);
}`,
      filename: 'httpd.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Обработка клиентского соединения (в отдельном потоке) */
static void *handle_client(void *arg)
{
    int client_fd = *(int *)arg;
    free(arg);

    char buffer[BUFFER_SIZE];
    ssize_t bytes = read(client_fd, buffer, sizeof(buffer) - 1);
    if (bytes <= 0) {
        close(client_fd);
        return NULL;
    }
    buffer[bytes] = '\\0';

    HttpRequest req;
    if (parse_request(buffer, &req) < 0) {
        const char *msg = "<h1>400 Bad Request</h1>";
        send_response(client_fd, 400, "Bad Request",
                      "text/html", msg, strlen(msg));
    } else {
        printf("%s %s %s\\n", req.method, req.path, req.version);
        serve_file(client_fd, req.path);
    }

    close(client_fd);
    return NULL;
}

int main(void)
{
    int server_fd = server_init(PORT);

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);
        int client_fd = accept(server_fd,
                               (struct sockaddr *)&client_addr, &addr_len);
        if (client_fd < 0) {
            perror("accept");
            continue;
        }

        /* Создаём поток для обработки соединения */
        int *fd_ptr = malloc(sizeof(int));
        *fd_ptr = client_fd;

        pthread_t thread;
        pthread_create(&thread, NULL, handle_client, fd_ptr);
        pthread_detach(thread);
    }

    close(server_fd);
    return 0;
}`,
      filename: 'httpd.c',
    },
    {
      type: 'output',
      content: `Сервер запущен на порту 8080
GET / HTTP/1.1
GET /style.css HTTP/1.1
GET /favicon.ico HTTP/1.1`,
      prompt: '$ gcc -Wall -Wextra -pthread -o httpd httpd.c && ./httpd',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Поток на соединение',
      markdown:
        'Модель «поток на соединение» проста, но не масштабируется: при тысячах одновременных соединений потоки потребляют слишком много памяти. Реальные серверы (nginx, Node.js) используют event loop с `epoll` (Linux) или `kqueue` (macOS). Реализация event loop — отличное продолжение этого проекта.',
    },
    {
      type: 'exercise',
      title: 'Добавьте логирование с временными метками',
      description:
        'Добавьте в сервер подробное логирование: для каждого запроса выводите временную метку, IP-адрес клиента, метод, путь, код ответа и размер тела ответа. Формат: `[2024-03-15 14:30:25] 127.0.0.1 GET /index.html 200 1234`.',
      hints: [
        'Используйте time() и strftime() для форматирования времени',
        'IP-адрес клиента можно получить из структуры sockaddr_in через inet_ntoa()',
        'Передайте адрес клиента в функцию-обработчик вместе с файловым дескриптором',
      ],
      solution: `#include <time.h>

typedef struct {
    int client_fd;
    struct sockaddr_in addr;
} ClientInfo;

static void log_request(const struct sockaddr_in *addr,
                        const HttpRequest *req, int status, size_t size)
{
    time_t now = time(NULL);
    char timebuf[64];
    strftime(timebuf, sizeof(timebuf), "%Y-%m-%d %H:%M:%S",
             localtime(&now));
    printf("[%s] %s %s %s %d %zu\\n",
           timebuf, inet_ntoa(addr->sin_addr),
           req->method, req->path, status, size);
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Реализуйте пул потоков',
      description:
        'Вместо создания нового потока на каждое соединение, реализуйте пул потоков фиксированного размера. Используйте очередь заданий, защищённую мьютексом, и условную переменную для уведомления рабочих потоков.',
      hints: [
        'Создайте структуру ThreadPool с массивом pthread_t, очередью int (дескрипторов), мьютексом и condvar',
        'Рабочие потоки в бесконечном цикле: lock → while(queue_empty) cond_wait → dequeue → unlock → handle',
        'Главный поток: accept → lock → enqueue → cond_signal → unlock',
      ],
      solution: `#define POOL_SIZE 8
#define QUEUE_CAP 256

typedef struct {
    pthread_t workers[POOL_SIZE];
    int queue[QUEUE_CAP];
    int head, tail, count;
    pthread_mutex_t mutex;
    pthread_cond_t cond;
} ThreadPool;

static void pool_init(ThreadPool *pool, void *(*worker)(void *))
{
    pool->head = pool->tail = pool->count = 0;
    pthread_mutex_init(&pool->mutex, NULL);
    pthread_cond_init(&pool->cond, NULL);
    for (int i = 0; i < POOL_SIZE; i++)
        pthread_create(&pool->workers[i], NULL, worker, pool);
}

static void pool_submit(ThreadPool *pool, int fd)
{
    pthread_mutex_lock(&pool->mutex);
    pool->queue[pool->tail] = fd;
    pool->tail = (pool->tail + 1) % QUEUE_CAP;
    pool->count++;
    pthread_cond_signal(&pool->cond);
    pthread_mutex_unlock(&pool->mutex);
}

static int pool_take(ThreadPool *pool)
{
    pthread_mutex_lock(&pool->mutex);
    while (pool->count == 0)
        pthread_cond_wait(&pool->cond, &pool->mutex);
    int fd = pool->queue[pool->head];
    pool->head = (pool->head + 1) % QUEUE_CAP;
    pool->count--;
    pthread_mutex_unlock(&pool->mutex);
    return fd;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
