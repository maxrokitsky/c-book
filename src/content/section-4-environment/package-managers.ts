import type { Chapter } from '../types'

export default {
  id: 'package-managers',
  title: 'Менеджеры пакетов',
  description: 'Управление зависимостями в C-проектах: vcpkg, Conan, системные пакеты',
  blocks: [
    {
      type: 'prose',
      markdown: `# Менеджеры пакетов

В отличие от Python (pip), JavaScript (npm) или Rust (cargo), в C нет единого стандартного менеджера пакетов. Исторически зависимости управлялись через системные пакетные менеджеры или включались в проект вручную (vendoring).

Сегодня появились специализированные инструменты: **vcpkg**, **Conan** и **CMake FetchContent**, которые значительно упрощают управление зависимостями.`,
    },
    {
      type: 'prose',
      markdown: `## Системные пакетные менеджеры

Самый простой способ установить библиотеку — через пакетный менеджер ОС:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Ubuntu / Debian
sudo apt install libcurl4-openssl-dev  # curl
sudo apt install libsqlite3-dev        # SQLite
sudo apt install libjson-c-dev         # json-c
sudo apt install zlib1g-dev            # zlib

# Fedora
sudo dnf install libcurl-devel sqlite-devel

# macOS (Homebrew)
brew install curl sqlite json-c

# Поиск пакетов
apt search libssl
pkg-config --cflags --libs openssl`,
      filename: 'system_packages.sh',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'pkg-config',
      markdown: '`pkg-config` — стандартная утилита для получения флагов компиляции и линковки установленных библиотек. Вместо запоминания путей используйте: `gcc $(pkg-config --cflags --libs libcurl) -o app app.c`. CMake интегрируется с pkg-config через модуль `PkgConfig`.',
    },
    {
      type: 'prose',
      markdown: `## vcpkg

**vcpkg** — менеджер пакетов от Microsoft для C/C++. Поддерживает более 2000 библиотек и интегрируется с CMake:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Установка vcpkg
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh   # Linux/macOS
# bootstrap-vcpkg.bat  # Windows

# Установка библиотек
./vcpkg install curl
./vcpkg install sqlite3
./vcpkg install cjson

# Использование с CMake
cmake -B build \\
  -DCMAKE_TOOLCHAIN_FILE=/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake

# В CMakeLists.txt:
# find_package(CURL REQUIRED)
# target_link_libraries(myapp PRIVATE CURL::libcurl)`,
      filename: 'vcpkg_setup.sh',
    },
    {
      type: 'code',
      language: 'json',
      code: `{
    "name": "myapp",
    "version": "1.0.0",
    "dependencies": [
        "curl",
        "sqlite3",
        {
            "name": "cjson",
            "version>=": "1.7.15"
        }
    ]
}`,
      filename: 'vcpkg.json',
    },
    {
      type: 'prose',
      markdown: `## Conan

**Conan** — децентрализованный менеджер пакетов для C/C++, написанный на Python:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Установка
pip install conan

# Создание профиля
conan profile detect

# Установка зависимостей
conan install . --output-folder=build --build=missing`,
      filename: 'conan_setup.sh',
    },
    {
      type: 'code',
      language: 'python',
      code: `# conanfile.py
from conan import ConanFile
from conan.tools.cmake import cmake_layout

class MyAppRecipe(ConanFile):
    name = "myapp"
    version = "1.0.0"
    settings = "os", "compiler", "build_type", "arch"
    generators = "CMakeToolchain", "CMakeDeps"

    def requirements(self):
        self.requires("zlib/1.3")
        self.requires("openssl/3.2.0")
        self.requires("libcurl/8.5.0")

    def layout(self):
        cmake_layout(self)`,
      filename: 'conanfile.py',
    },
    {
      type: 'prose',
      markdown: `## CMake FetchContent

Для небольших зависимостей CMake предлагает встроенный механизм \`FetchContent\` — скачивание и сборка зависимости прямо при конфигурации:`,
    },
    {
      type: 'code',
      language: 'cmake',
      code: `cmake_minimum_required(VERSION 3.20)
project(myapp LANGUAGES C)

include(FetchContent)

# Скачивание cJSON из GitHub
FetchContent_Declare(
    cjson
    GIT_REPOSITORY https://github.com/DaveGamble/cJSON.git
    GIT_TAG        v1.7.17
)
FetchContent_MakeAvailable(cjson)

add_executable(myapp src/main.c)
target_link_libraries(myapp PRIVATE cjson)`,
      filename: 'CMakeLists.txt',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Какой подход выбрать?',
      markdown: `- **Системные пакеты** — просто для распространённых библиотек (zlib, openssl, curl). Минус: разные версии на разных системах.
- **vcpkg** — хорош для кроссплатформенных проектов и интеграции с CMake. Большой каталог пакетов.
- **Conan** — мощный и гибкий, хорош для сложных зависимостей и CI.
- **FetchContent** — для маленьких зависимостей без внешних инструментов.
- **Vendoring** (копирование исходников) — для single-header библиотек (stb, cJSON).`,
    },
    {
      type: 'quiz',
      question: 'Что делает утилита pkg-config?',
      options: [
        'Устанавливает пакеты из интернета',
        'Возвращает флаги компиляции и линковки для установленных библиотек',
        'Компилирует зависимости из исходного кода',
        'Управляет версиями библиотек',
      ],
      correctIndex: 1,
      explanation:
        'pkg-config — утилита, которая по имени библиотеки выдаёт необходимые флаги компилятора (-I для заголовков) и линковщика (-L, -l). Это избавляет от необходимости вручную указывать пути. Например: gcc $(pkg-config --cflags --libs zlib) -o app app.c.',
    },
    {
      type: 'exercise',
      title: 'Подключите стороннюю библиотеку',
      description:
        'Создайте CMake-проект, который использует библиотеку cJSON через FetchContent. Напишите программу, которая создаёт JSON-объект с полями "name" и "version", преобразует его в строку и выводит на экран.',
      hints: [
        'Используйте FetchContent_Declare и FetchContent_MakeAvailable',
        'Функции cJSON: cJSON_CreateObject(), cJSON_AddStringToObject(), cJSON_Print()',
        'Не забудьте освободить память: cJSON_Delete(), cJSON_free()',
      ],
      solution: `/* CMakeLists.txt:
cmake_minimum_required(VERSION 3.20)
project(json_demo LANGUAGES C)
include(FetchContent)
FetchContent_Declare(cjson
    GIT_REPOSITORY https://github.com/DaveGamble/cJSON.git
    GIT_TAG v1.7.17)
FetchContent_MakeAvailable(cjson)
add_executable(json_demo main.c)
target_link_libraries(json_demo PRIVATE cjson)
*/

/* main.c */
#include <stdio.h>
#include <cJSON.h>

int main(void)
{
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "name", "myapp");
    cJSON_AddStringToObject(root, "version", "1.0.0");

    char *json_str = cJSON_Print(root);
    printf("%s\\n", json_str);

    cJSON_free(json_str);
    cJSON_Delete(root);
    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
