import type { Chapter } from '../types'

export default {
  id: 'editor-ide',
  title: 'Настройка редактора/IDE',
  description: 'Настройка VS Code, CLion, Vim/Neovim для разработки на C с clangd',
  blocks: [
    {
      type: 'prose',
      markdown: `# Настройка редактора/IDE

Правильно настроенный редактор значительно повышает продуктивность: автодополнение, навигация по коду, подсветка ошибок в реальном времени и встроенная отладка. В этой главе мы настроим три популярных варианта для разработки на C.`,
    },
    {
      type: 'prose',
      markdown: `## VS Code — универсальный выбор

Visual Studio Code с расширением **clangd** — отличный бесплатный вариант для разработки на C.

### Шаг 1: Установите расширения

Откройте панель расширений (Ctrl+Shift+X) и установите:
- **clangd** (llvm-vs-code-extensions.vscode-clangd) — language server
- **CodeLLDB** или **C/C++ (ms)** — для отладки

### Шаг 2: Настройте проект`,
    },
    {
      type: 'code',
      language: 'json',
      code: `{
    "clangd.arguments": [
        "--background-index",
        "--clang-tidy",
        "--header-insertion=iwyu",
        "--completion-style=detailed",
        "--function-arg-placeholders"
    ],
    "clangd.fallbackFlags": [
        "-std=c17",
        "-Wall",
        "-Wextra"
    ],
    "editor.formatOnSave": true,
    "files.associations": {
        "*.h": "c"
    }
}`,
      filename: '.vscode/settings.json',
    },
    {
      type: 'prose',
      markdown: `### Шаг 3: Генерация compile_commands.json

clangd нужен файл \`compile_commands.json\` для корректного анализа кода:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Для CMake-проектов
cmake -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
ln -s build/compile_commands.json .

# Для Make-проектов (через утилиту bear)
sudo apt install bear   # Ubuntu
bear -- make            # Генерирует compile_commands.json

# Для простых проектов — создайте вручную
cat > compile_commands.json << 'EOF'
[
  {
    "directory": "/home/user/project",
    "command": "gcc -std=c17 -Wall -Iinclude -c src/main.c",
    "file": "src/main.c"
  }
]
EOF`,
      filename: 'generate_compile_commands.sh',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'clangd vs C/C++ (Microsoft)',
      markdown: 'Расширение Microsoft **C/C++** (ms-vscode.cpptools) использует свой движок IntelliSense. Расширение **clangd** использует LLVM и обычно даёт более точные результаты для C. Они конфликтуют друг с другом — используйте одно из двух. Для C рекомендуется clangd.',
    },
    {
      type: 'prose',
      markdown: `### Шаг 4: Настройка отладки

Создайте файл конфигурации для запуска и отладки:`,
    },
    {
      type: 'code',
      language: 'json',
      code: `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug myapp",
            "type": "cppdbg",
            "request": "launch",
            "program": "\${workspaceFolder}/build/myapp",
            "args": [],
            "cwd": "\${workspaceFolder}",
            "environment": [],
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "text": "-enable-pretty-printing"
                }
            ],
            "preLaunchTask": "build",
            "stopAtEntry": false
        }
    ]
}`,
      filename: '.vscode/launch.json',
    },
    {
      type: 'prose',
      markdown: `## Vim/Neovim

Для Vim и Neovim clangd подключается через LSP-клиент:`,
    },
    {
      type: 'code',
      language: 'lua',
      code: `-- Neovim: конфигурация clangd через nvim-lspconfig
-- ~/.config/nvim/lua/lsp.lua

local lspconfig = require('lspconfig')

lspconfig.clangd.setup({
    cmd = {
        'clangd',
        '--background-index',
        '--clang-tidy',
        '--header-insertion=iwyu',
        '--completion-style=detailed',
    },
    filetypes = { 'c', 'h' },
    root_dir = lspconfig.util.root_pattern(
        'compile_commands.json',
        'CMakeLists.txt',
        'Makefile',
        '.git'
    ),
    on_attach = function(client, bufnr)
        local opts = { buffer = bufnr }
        vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
        vim.keymap.set('n', 'K', vim.lsp.buf.hover, opts)
        vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename, opts)
        vim.keymap.set('n', '<leader>ca', vim.lsp.buf.code_action, opts)
        vim.keymap.set('n', 'gr', vim.lsp.buf.references, opts)
    end,
})`,
      filename: 'nvim_lsp.lua',
    },
    {
      type: 'prose',
      markdown: `## CLion

JetBrains CLion — полнофункциональная IDE с встроенной поддержкой C:

- Автоматически читает \`CMakeLists.txt\`
- Встроенный отладчик (GDB/LLDB)
- Рефакторинг, навигация, анализ кода
- Интеграция с Valgrind и санитайзерами

CLion — платный инструмент, но предоставляет бесплатные лицензии для студентов и open source проектов.`,
    },
    {
      type: 'note',
      variant: 'info',
      title: 'EditorConfig',
      markdown: `Добавьте в проект файл \`.editorconfig\` для единообразного форматирования у всех разработчиков:

\`\`\`ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{c,h}]
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab
\`\`\``,
    },
    {
      type: 'quiz',
      question: 'Для чего нужен файл compile_commands.json?',
      options: [
        'Для запуска компиляции из редактора',
        'Для описания флагов компиляции каждого файла, необходимых clangd для анализа',
        'Для хранения истории сборок',
        'Для настройки форматирования кода',
      ],
      correctIndex: 1,
      explanation:
        'compile_commands.json — это файл, содержащий команды компиляции для каждого исходного файла проекта. Language server (clangd) использует его, чтобы знать, с какими флагами, путями включения и определениями компилируется каждый файл, что необходимо для корректного анализа.',
    },
    {
      type: 'exercise',
      title: 'Настройте VS Code для проекта',
      description:
        'Создайте проект с файлами src/main.c, src/utils.c, include/utils.h и CMakeLists.txt. Настройте VS Code с clangd: сгенерируйте compile_commands.json, создайте launch.json для отладки и tasks.json для сборки.',
      hints: [
        'Используйте cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON',
        'Создайте символическую ссылку на compile_commands.json в корне проекта',
        'В tasks.json используйте cmake --build build для сборки',
      ],
      solution: `# CMakeLists.txt
# cmake_minimum_required(VERSION 3.20)
# project(demo LANGUAGES C)
# set(CMAKE_C_STANDARD 17)
# add_compile_options(-Wall -Wextra)
# add_executable(demo src/main.c src/utils.c)
# target_include_directories(demo PRIVATE include)

# Генерация compile_commands.json
cmake -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
ln -s build/compile_commands.json .

# .vscode/tasks.json
# {
#   "version": "2.0.0",
#   "tasks": [{
#     "label": "build",
#     "type": "shell",
#     "command": "cmake --build build",
#     "group": { "kind": "build", "isDefault": true }
#   }]
# }

# .vscode/launch.json
# {
#   "version": "0.2.0",
#   "configurations": [{
#     "name": "Debug",
#     "type": "cppdbg",
#     "request": "launch",
#     "program": "\${workspaceFolder}/build/demo",
#     "MIMode": "gdb",
#     "preLaunchTask": "build"
#   }]
# }`,
      solutionLanguage: 'bash',
    },
  ],
} satisfies Chapter
