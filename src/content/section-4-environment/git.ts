import type { Chapter } from '../types'

export default {
  id: 'git',
  title: 'Git',
  description: 'Основы Git для C-проектов: версионирование, ветвление, .gitignore',
  blocks: [
    {
      type: 'prose',
      markdown: `# Git

**Git** — распределённая система контроля версий, ставшая стандартом в разработке ПО. Знание Git необходимо для работы с любым проектом — от личных утилит до ядра Linux (которое и послужило причиной создания Git Линусом Торвальдсом в 2005 году).

В этой главе мы рассмотрим основы Git в контексте C-проектов.`,
    },
    {
      type: 'prose',
      markdown: `## Инициализация и первый коммит`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Инициализация нового репозитория
git init myproject
cd myproject

# Настройка (если ещё не настроено глобально)
git config user.name "Ваше Имя"
git config user.email "email@example.com"

# Создание файлов
mkdir -p src include
cat > src/main.c << 'EOF'
#include <stdio.h>

int main(void)
{
    printf("Hello, Git!\\n");
    return 0;
}
EOF

# Первый коммит
git add src/main.c
git commit -m "Initial commit: add main.c"`,
      filename: 'git_init.sh',
    },
    {
      type: 'prose',
      markdown: `## .gitignore для C-проектов

Файл \`.gitignore\` исключает из отслеживания артефакты сборки, временные файлы и системные каталоги:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Артефакты компиляции
*.o
*.d
*.a
*.so
*.dylib
*.dll
*.exe

# Каталоги сборки
build/
out/
cmake-build-*/

# Файлы IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Отладочная информация
*.dSYM/
core
vgcore.*

# Покрытие кода
*.gcno
*.gcda
*.gcov
coverage/

# Файлы системы
.DS_Store
Thumbs.db

# Сгенерированная документация
docs/html/
docs/latex/`,
      filename: '.gitignore',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Не коммитьте бинарные файлы',
      markdown: 'Git плохо работает с бинарными файлами — каждая версия хранится целиком, а не как дифф. Никогда не коммитьте скомпилированные бинарники, объектные файлы, библиотеки (.a, .so) и артефакты сборки. Они должны быть в `.gitignore`.',
    },
    {
      type: 'prose',
      markdown: `## Основные команды

Типичный рабочий процесс с Git:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Просмотр состояния
git status

# Просмотр изменений
git diff                      # Неиндексированные изменения
git diff --staged             # Индексированные изменения

# Индексирование и коммит
git add src/parser.c          # Добавить конкретный файл
git add src/                  # Добавить каталог
git add -p                    # Интерактивное добавление (по частям)
git commit -m "Add parser module"

# История
git log --oneline --graph     # Компактный граф
git log --oneline -10         # Последние 10 коммитов
git show abc1234              # Детали коммита

# Ветвление
git branch feature-parser     # Создать ветку
git checkout feature-parser   # Переключиться
git checkout -b fix-memory    # Создать и переключиться

# Слияние
git checkout main
git merge feature-parser      # Слить ветку в main

# Откат
git checkout -- src/main.c    # Отменить изменения файла
git reset HEAD src/main.c     # Убрать из индекса`,
      filename: 'git_workflow.sh',
    },
    {
      type: 'prose',
      markdown: `## Работа с удалённым репозиторием`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Клонирование
git clone https://github.com/user/project.git

# Добавление удалённого репозитория
git remote add origin https://github.com/user/project.git

# Отправка изменений
git push origin main
git push -u origin feature-branch  # -u запоминает связь

# Получение изменений
git fetch origin               # Скачать без слияния
git pull origin main           # Скачать и слить

# Форк и upstream
git remote add upstream https://github.com/original/project.git
git fetch upstream
git merge upstream/main        # Синхронизация с оригиналом`,
      filename: 'git_remote.sh',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Пишите хорошие коммиты',
      markdown: `Хороший коммит:
- **Атомарный** — одно логическое изменение
- **Сообщение в повелительном наклонении** — «Add parser», а не «Added parser»
- **Первая строка < 72 символа** — краткое описание
- **Тело через пустую строку** — подробности, причины, ссылки на issues

Пример:
\`\`\`
Fix buffer overflow in json_parse_string()

The input length was not validated before copying to the
internal buffer. Added bounds check and return error code
when input exceeds MAX_STRING_LEN.

Fixes #42
\`\`\``,
    },
    {
      type: 'quiz',
      question: 'Какие файлы НЕ должны коммититься в C-проект?',
      options: [
        'Заголовочные файлы (.h)',
        'Объектные файлы (.o) и бинарники',
        'Файлы системы сборки (CMakeLists.txt, Makefile)',
        'Файлы тестов',
      ],
      correctIndex: 1,
      explanation:
        'Объектные файлы (.o), бинарники и другие артефакты сборки не должны коммититься в репозиторий. Они генерируются из исходного кода и специфичны для платформы. Всё, что можно воспроизвести из исходников, должно быть в .gitignore.',
    },
    {
      type: 'exercise',
      title: 'Создайте репозиторий с ветвлением',
      description:
        'Создайте Git-репозиторий для C-проекта. Сделайте начальный коммит с main.c. Создайте ветку feature, добавьте в ней файл utils.c, закоммитьте. Вернитесь в main и слейте ветку feature. Убедитесь, что utils.c появился в main.',
      hints: [
        'git checkout -b feature для создания ветки',
        'git checkout main для возврата',
        'git merge feature для слияния',
      ],
      solution: `# Инициализация
mkdir demo && cd demo
git init

# Начальный коммит
cat > main.c << 'EOF'
#include <stdio.h>
int main(void) {
    printf("Hello\\n");
    return 0;
}
EOF
git add main.c
git commit -m "Initial commit: add main.c"

# Ветка feature
git checkout -b feature
cat > utils.c << 'EOF'
#include <string.h>
size_t safe_strlen(const char *s) {
    return s ? strlen(s) : 0;
}
EOF
git add utils.c
git commit -m "Add utils.c with safe_strlen()"

# Слияние в main
git checkout main
git merge feature

# Проверка
git log --oneline --graph
ls  # main.c utils.c`,
      solutionLanguage: 'bash',
    },
  ],
} satisfies Chapter
