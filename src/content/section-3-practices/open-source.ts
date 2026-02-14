import type { Chapter } from '../types'

export default {
  id: 'open-source',
  title: 'Open Source',
  description: 'Участие в открытых проектах на C, лицензии и контрибьюция',
  blocks: [
    {
      type: 'prose',
      markdown: `# Open Source

Огромная часть инфраструктуры мира построена на open source проектах на C: ядро Linux, cURL, SQLite, OpenSSL, Git, Python (CPython) и тысячи других. Участие в open source — отличный способ улучшить навыки, получить опыт работы с реальным кодом и внести вклад в сообщество.

В этой главе мы рассмотрим, как устроены open source проекты на C, какие лицензии существуют и как начать контрибьютить.`,
    },
    {
      type: 'prose',
      markdown: `## Структура типичного open source проекта

Большинство зрелых проектов на C имеют схожую организацию:

\`\`\`
project/
├── src/               # Исходный код
├── include/           # Публичные заголовки
├── tests/             # Тесты
├── docs/              # Документация
├── examples/          # Примеры использования
├── contrib/           # Вклады сообщества, скрипты
├── CMakeLists.txt     # Система сборки
├── README.md          # Описание проекта
├── LICENSE            # Лицензия
├── CONTRIBUTING.md    # Правила контрибьюции
├── CHANGELOG.md       # История изменений
├── .github/           # CI/CD конфигурация
│   └── workflows/
└── .clang-format      # Стиль форматирования
\`\`\`

Всегда начинайте с чтения \`README.md\` и \`CONTRIBUTING.md\`.`,
    },
    {
      type: 'prose',
      markdown: `## Лицензии

Выбор лицензии — важнейшее решение для open source проекта. Основные варианты:

| Лицензия | Тип | Ключевое свойство |
|----------|-----|-------------------|
| **MIT** | Пермиссивная | Минимум ограничений, можно использовать в проприетарном ПО |
| **BSD 2/3-Clause** | Пермиссивная | Похожа на MIT, различия в деталях |
| **Apache 2.0** | Пермиссивная | Явное предоставление патентных прав |
| **GPL v2/v3** | Копилефт | Производные работы тоже должны быть GPL |
| **LGPL** | Слабый копилефт | Линковка без копилефта, модификации — под LGPL |

Для библиотек чаще используют MIT, BSD или Apache 2.0. Для приложений — GPL.`,
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Лицензионная совместимость',
      markdown: 'Если вы используете сторонние библиотеки, убедитесь, что их лицензии совместимы. Например, код под GPL нельзя линковать с проприетарным кодом. Код под MIT можно использовать практически везде. При сомнениях проконсультируйтесь с юристом.',
    },
    {
      type: 'prose',
      markdown: `## Как начать контрибьютить

### 1. Найдите проект

Хорошие проекты для начала:
- Отмечены тегами \`good-first-issue\` или \`help-wanted\` на GitHub
- Имеют \`CONTRIBUTING.md\` с инструкциями
- Активно развиваются (свежие коммиты, отзывчивые мейнтейнеры)

### 2. Подготовьте окружение

Форкните репозиторий, склонируйте, соберите, запустите тесты:`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Форк и клонирование
git clone https://github.com/YOUR_USERNAME/project.git
cd project
git remote add upstream https://github.com/original/project.git

# Сборка
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
cmake --build .

# Запуск тестов
ctest --output-on-failure

# Создание ветки для изменений
git checkout -b fix-buffer-overflow
# ... вносим изменения ...
git add -p
git commit -m "Fix buffer overflow in parser_read()"
git push origin fix-buffer-overflow
# Открываем Pull Request на GitHub`,
      filename: 'contributing.sh',
    },
    {
      type: 'prose',
      markdown: `## Стиль кода

Каждый проект имеет свой стиль. Соблюдайте его — это уважение к мейнтейнерам и другим контрибьюторам.

Типичные инструменты форматирования:
- **clang-format** — автоматическое форматирование (конфигурация в \`.clang-format\`)
- **EditorConfig** — базовые настройки отступов (\`.editorconfig\`)

Перед отправкой PR всегда:
1. Отформатируйте код (\`clang-format -i file.c\`)
2. Запустите тесты
3. Запустите статический анализ
4. Проверьте, что нет утечек (Valgrind/ASan)`,
    },
    {
      type: 'code',
      language: 'yaml',
      code: `# .clang-format — пример конфигурации в стиле Linux kernel
BasedOnStyle: LLVM
IndentWidth: 8
UseTab: Always
BreakBeforeBraces: Linux
AllowShortIfStatementsOnASingleLine: false
AllowShortFunctionsOnASingleLine: None
ColumnLimit: 80
SortIncludes: true`,
      filename: '.clang-format',
    },
    {
      type: 'prose',
      markdown: `## Написание хороших коммитов и PR

Сообщения коммитов должны быть информативными:

\`\`\`
fix: prevent buffer overflow in json_parse_string()

The function did not check if the input length exceeded
MAX_STRING_LEN before copying. This could lead to a heap
buffer overflow when parsing untrusted input.

Fixes #142
\`\`\`

Хороший Pull Request содержит:
- **Описание проблемы** — что было не так
- **Описание решения** — что и почему изменено
- **Тесты** — новые тесты, подтверждающие исправление
- **Ссылку на issue** — если есть`,
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Начните с малого',
      markdown: 'Не нужно сразу переписывать ядро проекта. Хорошие первые вклады: исправление опечаток в документации, добавление тестов, исправление предупреждений компилятора, улучшение сообщений об ошибках. Это помогает познакомиться с кодовой базой и наладить контакт с мейнтейнерами.',
    },
    {
      type: 'quiz',
      question: 'Какая лицензия позволяет использовать код в проприетарном ПО без раскрытия исходного кода?',
      options: [
        'GPL v3',
        'AGPL v3',
        'MIT',
        'GPL v2',
      ],
      correctIndex: 2,
      explanation:
        'MIT — пермиссивная лицензия, которая позволяет использовать, модифицировать и распространять код (в том числе в проприетарном ПО) при условии сохранения уведомления об авторстве. GPL и AGPL требуют раскрытия исходного кода производных работ.',
    },
    {
      type: 'exercise',
      title: 'Подготовьте проект к публикации',
      description:
        'У вас есть библиотека для работы со строками. Подготовьте её к публикации как open source: напишите минимальный README.md с описанием, инструкцией по сборке и примером использования. Выберите и обоснуйте лицензию.',
      hints: [
        'README должен содержать: что делает библиотека, как собрать, как использовать',
        'Добавьте пример кода прямо в README',
        'Для библиотеки обычно выбирают MIT или Apache 2.0',
      ],
      solution: `# libstr — библиотека строковых утилит для C

Легковесная библиотека для безопасной работы со строками в C17.

## Сборка

\`\`\`bash
mkdir build && cd build
cmake ..
cmake --build .
\`\`\`

## Использование

\`\`\`c
#include <libstr.h>

int main(void)
{
    Str *s = str_from("Hello");
    str_append(s, ", World!");
    printf("%s\\n", str_cstr(s));  /* Hello, World! */
    str_free(s);
    return 0;
}
\`\`\`

## Лицензия

MIT — выбрана для максимальной свободы использования.
Библиотека может быть встроена в любой проект,
включая проприетарный, без ограничений.`,
      solutionLanguage: 'markdown',
    },
  ],
} satisfies Chapter
