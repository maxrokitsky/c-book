import type { Chapter } from '../types'

export default {
  id: 'build-systems',
  title: 'Системы сборки',
  description: 'Make, CMake, Meson — автоматизация компиляции и сборки проектов',
  blocks: [
    {
      type: 'prose',
      markdown: `# Системы сборки

Ручная компиляция через \`gcc\` подходит для файлов-одиночек, но реальные проекты состоят из десятков и сотен файлов. Системы сборки автоматизируют процесс компиляции, линковки и управления зависимостями.

В этой главе мы рассмотрим три наиболее популярных инструмента: **Make**, **CMake** и **Meson**.`,
    },
    {
      type: 'prose',
      markdown: `## Make

**GNU Make** — классическая утилита сборки, появившаяся в 1976 году. \`Makefile\` описывает правила (rules): какие файлы от каких зависят и как их получить.

Основная идея Make — **инкрементальная сборка**: перекомпилируются только те файлы, которые изменились.`,
    },
    {
      type: 'code',
      language: 'makefile',
      code: `CC       = gcc
CFLAGS   = -Wall -Wextra -std=c17 -g
SRC      = $(wildcard src/*.c)
OBJ      = $(SRC:src/%.c=build/%.o)
TARGET   = build/myapp

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJ)
\t$(CC) $(CFLAGS) -o $@ $^

build/%.o: src/%.c | build
\t$(CC) $(CFLAGS) -c $< -o $@

build:
\tmkdir -p build

clean:
\trm -rf build`,
      filename: 'Makefile',
    },
    {
      type: 'output',
      content: `gcc -Wall -Wextra -std=c17 -g -c src/main.c -o build/main.o
gcc -Wall -Wextra -std=c17 -g -c src/utils.c -o build/utils.o
gcc -Wall -Wextra -std=c17 -g -o build/myapp build/main.o build/utils.o`,
      prompt: '$ make',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Табуляция в Makefile',
      markdown: 'Команды в правилах Makefile **обязательно** должны начинаться с символа табуляции (Tab), а не пробелов. Это одна из самых частых ошибок при работе с Make. Убедитесь, что ваш редактор не заменяет табуляции на пробелы в Makefile.',
    },
    {
      type: 'prose',
      markdown: `## CMake

**CMake** — кроссплатформенный мета-генератор систем сборки. Он не компилирует код сам, а генерирует файлы для Make, Ninja, Visual Studio и других инструментов.

CMake стал стандартом де-факто для C/C++ проектов благодаря переносимости и мощной системе поиска зависимостей.`,
    },
    {
      type: 'code',
      language: 'cmake',
      code: `cmake_minimum_required(VERSION 3.20)
project(myapp LANGUAGES C VERSION 1.0.0)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Предупреждения компилятора
add_compile_options(-Wall -Wextra -Wpedantic)

# Библиотека
add_library(mylib
    src/buffer.c
    src/parser.c
)
target_include_directories(mylib
    PUBLIC  include
    PRIVATE src
)

# Исполняемый файл
add_executable(myapp src/main.c)
target_link_libraries(myapp PRIVATE mylib)

# Тесты
enable_testing()
add_executable(test_buffer tests/test_buffer.c)
target_link_libraries(test_buffer PRIVATE mylib)
add_test(NAME test_buffer COMMAND test_buffer)`,
      filename: 'CMakeLists.txt',
    },
    {
      type: 'output',
      content: `-- The C compiler identification is GNU 13.2.0
-- Detecting C compiler ABI info - done
-- Configuring done (0.3s)
-- Generating done (0.1s)
-- Build files have been written to: /home/user/myapp/build
[1/4] Building C object CMakeFiles/mylib.dir/src/buffer.c.o
[2/4] Building C object CMakeFiles/mylib.dir/src/parser.c.o
[3/4] Linking C static library libmylib.a
[4/4] Building C object CMakeFiles/myapp.dir/src/main.c.o
[5/5] Linking C executable myapp`,
      prompt: '$ cmake -B build -G Ninja && cmake --build build',
    },
    {
      type: 'prose',
      markdown: `## Meson

**Meson** — современная система сборки, написанная на Python. Она отличается простым синтаксисом, быстрой работой (использует Ninja по умолчанию) и удобным управлением зависимостями через **WrapDB**.

Meson набирает популярность в проектах GNOME, systemd, QEMU и многих других.`,
    },
    {
      type: 'code',
      language: 'meson',
      code: `project('myapp', 'c',
  version : '1.0.0',
  default_options : [
    'c_std=c17',
    'warning_level=3',
  ]
)

# Библиотека
mylib = library('mylib',
  'src/buffer.c',
  'src/parser.c',
  include_directories : include_directories('include'),
)

# Исполняемый файл
executable('myapp',
  'src/main.c',
  link_with : mylib,
  include_directories : include_directories('include'),
)

# Тесты
test_buffer = executable('test_buffer',
  'tests/test_buffer.c',
  link_with : mylib,
  include_directories : include_directories('include'),
)
test('buffer tests', test_buffer)`,
      filename: 'meson.build',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Какую систему выбрать?',
      markdown: `- **Make** — подходит для простых проектов, скриптов сборки, Unix-систем. Быстро начать, но сложно масштабировать.
- **CMake** — стандарт индустрии. Выбирайте, если нужна кроссплатформенность и интеграция с IDE (CLion, VS Code).
- **Meson** — современная альтернатива с чистым синтаксисом. Отличный выбор для новых проектов.`,
    },
    {
      type: 'quiz',
      question: 'Что генерирует CMake?',
      options: [
        'Исполняемые файлы напрямую',
        'Файлы сборки для других инструментов (Make, Ninja, etc.)',
        'Только документацию проекта',
        'Пакеты для менеджеров пакетов',
      ],
      correctIndex: 1,
      explanation:
        'CMake — это мета-генератор. Он не компилирует код напрямую, а генерирует файлы для «родных» систем сборки: Makefile для GNU Make, build.ninja для Ninja, проекты для Visual Studio и т.д.',
    },
    {
      type: 'exercise',
      title: 'Напишите Makefile',
      description:
        'Напишите Makefile для проекта со следующей структурой: src/main.c, src/math.c, include/math.h. Makefile должен поддерживать инкрементальную сборку, автоматическую генерацию зависимостей заголовков и цель clean.',
      hints: [
        'Используйте флаг -MMD для автогенерации .d файлов зависимостей',
        'Подключите .d файлы через -include',
        'Не забудьте передать -Iinclude в CFLAGS',
      ],
      solution: `CC       = gcc
CFLAGS   = -Wall -Wextra -std=c17 -Iinclude -MMD -MP
SRC      = src/main.c src/math.c
OBJ      = $(SRC:src/%.c=build/%.o)
DEP      = $(OBJ:.o=.d)
TARGET   = build/calc

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJ)
\t$(CC) $(CFLAGS) -o $@ $^

build/%.o: src/%.c | build
\t$(CC) $(CFLAGS) -c $< -o $@

build:
\tmkdir -p build

clean:
\trm -rf build

-include $(DEP)`,
      solutionLanguage: 'makefile',
    },
  ],
} satisfies Chapter
