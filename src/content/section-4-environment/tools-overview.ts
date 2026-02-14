import type { Chapter } from '../types'

export default {
  id: 'tools-overview',
  title: 'Обзор инструментов',
  description: 'Экосистема инструментов для разработки на C: компиляторы, редакторы, отладчики',
  blocks: [
    {
      type: 'prose',
      markdown: `# Обзор инструментов

Для эффективной разработки на C необходим набор инструментов: компилятор, редактор, отладчик, система сборки и вспомогательные утилиты. В отличие от языков с единой экосистемой (как Rust с cargo или Go с go tool), в мире C каждый инструмент выбирается отдельно.

В этой главе мы дадим обзор основных категорий инструментов и поможем сориентироваться в выборе.`,
    },
    {
      type: 'prose',
      markdown: `## Компиляторы

Компилятор — главный инструмент разработчика на C. Основные варианты:

| Компилятор | Платформы | Особенности |
|-----------|-----------|-------------|
| **GCC** | Linux, macOS, Windows (MinGW) | Стандарт де-факто в Linux, отличные оптимизации |
| **Clang/LLVM** | Linux, macOS, Windows | Отличные сообщения об ошибках, быстрая компиляция |
| **MSVC** | Windows | Нативный компилятор Microsoft, интеграция с Visual Studio |
| **TCC** | Linux, Windows | Ультрабыстрая компиляция, подходит для скриптов |

Для обучения и кроссплатформенной разработки рекомендуем **GCC** или **Clang** — они поддерживают новейшие стандарты C и имеют богатую экосистему.`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Проверка установленных компиляторов
gcc --version
clang --version

# Компиляция с GCC
gcc -Wall -Wextra -std=c17 -o hello hello.c

# Компиляция с Clang (те же флаги)
clang -Wall -Wextra -std=c17 -o hello hello.c

# Кросс-компиляция (пример: Linux -> ARM)
arm-linux-gnueabihf-gcc -o hello_arm hello.c`,
      filename: 'compilers.sh',
    },
    {
      type: 'prose',
      markdown: `## Редакторы и IDE

Выбор редактора — дело вкуса, но важна поддержка C через Language Server Protocol (LSP):

| Инструмент | Тип | LSP | Отладка | Цена |
|-----------|-----|-----|---------|------|
| **VS Code** | Редактор | clangd | GDB/LLDB | Бесплатный |
| **CLion** | IDE | Встроенный | GDB/LLDB | Платный |
| **Vim/Neovim** | Редактор | clangd | GDB (termdebug) | Бесплатный |
| **Emacs** | Редактор | clangd, eglot | GDB (gdb-mi) | Бесплатный |
| **Qt Creator** | IDE | Встроенный | GDB/LLDB | Бесплатный |

**clangd** — рекомендуемый language server для C. Обеспечивает автодополнение, навигацию, рефакторинг и диагностику в реальном времени.`,
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'compile_commands.json',
      markdown: 'Для корректной работы clangd нужен файл `compile_commands.json`, описывающий флаги компиляции каждого файла. CMake генерирует его автоматически: `cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`. Для Make-проектов используйте утилиту `bear` (`bear -- make`).',
    },
    {
      type: 'prose',
      markdown: `## Отладчики

| Инструмент | Описание |
|-----------|----------|
| **GDB** | GNU Debugger — стандарт для Linux, поддержка TUI и Python-скриптов |
| **LLDB** | Отладчик проекта LLVM, стандарт для macOS |
| **rr** | Reverse debugger — запись и воспроизведение выполнения |
| **WinDbg** | Отладчик Windows |

Оба основных отладчика (GDB и LLDB) поддерживаются через интерфейс DAP в VS Code и других редакторах.`,
    },
    {
      type: 'prose',
      markdown: `## Утилиты анализа и качества

| Категория | Инструменты |
|-----------|-------------|
| **Статический анализ** | cppcheck, clang-tidy, PVS-Studio, Coverity |
| **Динамический анализ** | Valgrind (memcheck, helgrind), sanitizers (ASan, UBSan, TSan, MSan) |
| **Форматирование** | clang-format, indent |
| **Покрытие кода** | gcov, lcov |
| **Профилирование** | gprof, perf, Cachegrind |
| **Документация** | Doxygen |`,
    },
    {
      type: 'prose',
      markdown: `## Системы сборки

| Инструмент | Описание |
|-----------|----------|
| **Make** | Классическая утилита, повсеместно доступна |
| **CMake** | Кроссплатформенный генератор систем сборки |
| **Meson** | Современная и быстрая система сборки |
| **Ninja** | Быстрый бэкенд для CMake и Meson |
| **Autotools** | Классическая система (configure/make), встречается в старых проектах |

Подробнее о системах сборки — в отдельной главе.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Минимальный набор для старта',
      markdown: `Чтобы начать разработку на C, достаточно:

1. **Компилятор:** GCC или Clang
2. **Редактор:** VS Code с расширением C/C++ или clangd
3. **Отладчик:** GDB (автоматически доступен в VS Code)
4. **Система сборки:** Make для простых проектов, CMake для серьёзных

Все эти инструменты бесплатны и доступны на Linux, macOS и Windows.`,
    },
    {
      type: 'quiz',
      question: 'Какой Language Server Protocol (LSP) сервер рекомендуется для разработки на C?',
      options: [
        'gopls',
        'clangd',
        'rust-analyzer',
        'pylsp',
      ],
      correctIndex: 1,
      explanation:
        'clangd — это language server для C/C++ от проекта LLVM. Он обеспечивает автодополнение, навигацию по коду, рефакторинг и диагностику. Работает с любым редактором, поддерживающим LSP: VS Code, Vim, Emacs и другими.',
    },
    {
      type: 'exercise',
      title: 'Настройте рабочее окружение',
      description:
        'Установите GCC (или Clang), создайте простой проект с файлом main.c, скомпилируйте его с максимальными предупреждениями (-Wall -Wextra -Wpedantic -std=c17) и запустите. Затем скомпилируйте с отладочной информацией и запустите в GDB, установив точку останова на main.',
      hints: [
        'На Ubuntu: sudo apt install gcc gdb',
        'На macOS: xcode-select --install (устанавливает Clang и LLDB)',
        'Для запуска в GDB: gdb ./program, затем break main, run',
      ],
      solution: `# Установка (Ubuntu/Debian)
sudo apt update
sudo apt install gcc gdb

# Создание проекта
mkdir myproject && cd myproject

cat > main.c << 'EOF'
#include <stdio.h>

int main(void)
{
    int x = 42;
    printf("x = %d\\n", x);
    return 0;
}
EOF

# Компиляция с предупреждениями
gcc -Wall -Wextra -Wpedantic -std=c17 -o main main.c

# Запуск
./main

# Компиляция для отладки
gcc -Wall -Wextra -std=c17 -g -O0 -o main_debug main.c

# Запуск в GDB
# gdb ./main_debug
# (gdb) break main
# (gdb) run
# (gdb) print x
# (gdb) next
# (gdb) quit`,
      solutionLanguage: 'bash',
    },
  ],
} satisfies Chapter
