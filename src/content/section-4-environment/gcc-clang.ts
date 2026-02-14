import type { Chapter } from '../types'

export default {
  id: 'gcc-clang',
  title: 'Установка GCC/Clang',
  description: 'Установка и настройка компиляторов GCC и Clang на разных платформах',
  blocks: [
    {
      type: 'prose',
      markdown: `# Установка GCC/Clang

Перед тем как писать код на C, необходимо установить компилятор. В этой главе мы рассмотрим установку двух основных компиляторов — **GCC** и **Clang** — на Linux, macOS и Windows.`,
    },
    {
      type: 'prose',
      markdown: `## Linux

На большинстве дистрибутивов Linux GCC доступен в стандартных репозиториях:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Ubuntu / Debian
sudo apt update
sudo apt install build-essential    # GCC, make, libc-dev
sudo apt install clang              # Clang (опционально)

# Fedora / RHEL
sudo dnf groupinstall "Development Tools"
sudo dnf install clang

# Arch Linux
sudo pacman -S base-devel
sudo pacman -S clang

# Проверка
gcc --version
clang --version
make --version`,
      filename: 'install_linux.sh',
    },
    {
      type: 'output',
      content: `gcc (Ubuntu 13.2.0-23ubuntu4) 13.2.0
Copyright (C) 2023 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.`,
      prompt: '$ gcc --version',
    },
    {
      type: 'prose',
      markdown: `## macOS

На macOS компилятор Clang устанавливается вместе с **Command Line Tools**. Команда \`gcc\` на macOS — это на самом деле обёртка над Clang:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Установка Command Line Tools (Clang + Make + Git)
xcode-select --install

# Проверка (gcc на macOS — это Clang)
gcc --version    # Apple clang version ...
clang --version

# Для настоящего GCC используйте Homebrew
brew install gcc
# GCC устанавливается как gcc-13, gcc-14 (не замещает системный clang)
gcc-14 --version`,
      filename: 'install_macos.sh',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'gcc на macOS — это Clang',
      markdown: 'Apple поставляет Clang под именем `gcc`. Команда `gcc --version` на macOS покажет `Apple clang version ...`. Это нормально — Clang полностью совместим с флагами GCC для большинства задач. Если вам нужен именно GCC, установите его через Homebrew (`brew install gcc`).',
    },
    {
      type: 'prose',
      markdown: `## Windows

На Windows есть несколько вариантов:

### Вариант 1: MSYS2 (рекомендуемый)

MSYS2 предоставляет полноценное Unix-окружение с пакетным менеджером:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Скачайте и установите MSYS2 с https://www.msys2.org/
# Затем в терминале MSYS2 UCRT64:

# Обновление пакетов
pacman -Syu

# Установка GCC
pacman -S mingw-w64-ucrt-x86_64-gcc

# Установка Clang
pacman -S mingw-w64-ucrt-x86_64-clang

# Утилиты сборки
pacman -S mingw-w64-ucrt-x86_64-cmake
pacman -S mingw-w64-ucrt-x86_64-ninja
pacman -S make

# Добавьте в PATH: C:\\msys64\\ucrt64\\bin`,
      filename: 'install_windows.sh',
    },
    {
      type: 'prose',
      markdown: `### Вариант 2: WSL (Windows Subsystem for Linux)

WSL позволяет запускать полноценный Linux прямо в Windows:

\`\`\`powershell
# В PowerShell (от администратора)
wsl --install

# После перезагрузки — в терминале Ubuntu:
sudo apt install build-essential gdb
\`\`\`

WSL — отличный выбор, если вы хотите использовать Linux-инструменты без виртуальной машины.`,
    },
    {
      type: 'prose',
      markdown: `## Важные флаги компилятора

После установки полезно знать ключевые флаги:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Стандарт языка
gcc -std=c17 main.c         # C17 (рекомендуемый)
gcc -std=c23 main.c         # C23 (новейший)

# Предупреждения
gcc -Wall -Wextra -Wpedantic main.c

# Оптимизация
gcc -O0 main.c              # Без оптимизации (для отладки)
gcc -O2 main.c              # Оптимизация для продакшена
gcc -Os main.c              # Оптимизация размера

# Отладочная информация
gcc -g main.c               # Информация для GDB/LLDB
gcc -g -O0 main.c           # Идеально для отладки

# Санитайзеры
gcc -fsanitize=address,undefined -g main.c

# Всё вместе (типичная команда для разработки)
gcc -Wall -Wextra -Wpedantic -std=c17 -g -O0 \\
    -fsanitize=address,undefined -o main main.c`,
      filename: 'compiler_flags.sh',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Используйте и GCC, и Clang',
      markdown: 'Компилируйте свой код обоими компиляторами. GCC и Clang имеют разные наборы предупреждений и по-разному обрабатывают некоторые конструкции. То, что пропустит GCC, может поймать Clang, и наоборот. Также сообщения об ошибках Clang часто более информативны.',
    },
    {
      type: 'quiz',
      question: 'Что такое gcc на macOS по умолчанию (без Homebrew)?',
      options: [
        'Настоящий GNU GCC',
        'Обёртка над Apple Clang',
        'Интерпретатор C',
        'Эмулятор GCC',
      ],
      correctIndex: 1,
      explanation:
        'На macOS команда gcc — это символическая ссылка на Apple Clang. Apple не поставляет настоящий GCC. Для использования GNU GCC на macOS необходимо установить его через Homebrew (brew install gcc).',
    },
    {
      type: 'exercise',
      title: 'Проверьте поддержку стандартов',
      description:
        'Напишите программу, которая использует возможности C17 (например, _Static_assert без сообщения, как в C23, или атрибут [[nodiscard]] из C23). Скомпилируйте её с разными стандартами (-std=c11, -std=c17, -std=c23) и посмотрите, какие конструкции поддерживаются.',
      hints: [
        '_Static_assert(expr, "msg") доступен в C11+',
        '_Static_assert(expr) без сообщения — C23',
        'Попробуйте typeof (C23) и constexpr (C23)',
      ],
      solution: `#include <stdio.h>
#include <limits.h>

/* C11: _Static_assert с сообщением */
_Static_assert(sizeof(int) >= 4, "int must be at least 4 bytes");

/* C23: _Static_assert без сообщения */
/* _Static_assert(sizeof(long long) >= 8); */

/* C23: typeof */
/* typeof(42) x = 42; */

int main(void)
{
    printf("sizeof(int)       = %zu\\n", sizeof(int));
    printf("sizeof(long)      = %zu\\n", sizeof(long));
    printf("sizeof(long long) = %zu\\n", sizeof(long long));
    printf("sizeof(void *)    = %zu\\n", sizeof(void *));
    printf("INT_MAX           = %d\\n", INT_MAX);
    return 0;
}

/* Компиляция:
 * gcc -std=c11 -Wall -o test test.c  # _Static_assert с msg OK
 * gcc -std=c17 -Wall -o test test.c  # то же
 * gcc -std=c23 -Wall -o test test.c  # + typeof, constexpr
 */`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
