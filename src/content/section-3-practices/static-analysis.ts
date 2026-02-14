import type { Chapter } from '../types'

export default {
  id: 'static-analysis',
  title: 'Статический анализ',
  description: 'Инструменты статического анализа кода: предупреждения компилятора, cppcheck, clang-tidy',
  blocks: [
    {
      type: 'prose',
      markdown: `# Статический анализ

Статический анализ — это проверка исходного кода **без его выполнения**. В отличие от тестирования и отладки, статический анализ находит потенциальные ошибки ещё до запуска программы.

Для C это особенно ценно, поскольку многие ошибки (неопределённое поведение, утечки памяти, переполнение буфера) могут не проявляться при обычном тестировании, но приводить к катастрофическим последствиям в продакшене.`,
    },
    {
      type: 'prose',
      markdown: `## Предупреждения компилятора — первый уровень защиты

Компилятор — ваш первый и лучший статический анализатор. Включите максимум предупреждений:

\`\`\`bash
# Минимальный набор — всегда используйте
gcc -Wall -Wextra -Wpedantic -std=c17

# Строгий набор для нового кода
gcc -Wall -Wextra -Wpedantic -Werror -Wshadow -Wconversion \\
    -Wdouble-promotion -Wformat=2 -Wnull-dereference
\`\`\`

Флаг \`-Werror\` превращает предупреждения в ошибки — код не скомпилируется, пока все предупреждения не будут исправлены.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int process(int *data, int count)
{
    int sum = 0;
    for (int i = 0; i <= count; i++) {  /* -Wall: off-by-one? */
        sum += data[i];
    }

    unsigned int x = -1;              /* -Wsign-conversion */
    double d = 3.14f;                 /* -Wdouble-promotion */
    int result = sum;

    if (data = NULL) {                /* -Wall: присваивание в условии */
        return -1;
    }

    return result;                    /* -Wunused-variable: x, d */
}`,
      filename: 'warnings_example.c',
    },
    {
      type: 'output',
      content: `warnings_example.c:6:25: warning: comparison of integers of different signs [-Wsign-compare]
warnings_example.c:10:22: warning: implicit conversion changes signedness [-Wsign-conversion]
warnings_example.c:11:18: warning: implicit conversion from 'float' to 'double' [-Wdouble-promotion]
warnings_example.c:14:14: warning: using the result of an assignment as a condition [-Wassign]
warnings_example.c:10:18: warning: unused variable 'x' [-Wunused-variable]
warnings_example.c:11:12: warning: unused variable 'd' [-Wunused-variable]`,
      prompt: '$ gcc -Wall -Wextra -Wsign-conversion -Wdouble-promotion -c warnings_example.c',
    },
    {
      type: 'prose',
      markdown: `## cppcheck

**cppcheck** — бесплатный кроссплатформенный статический анализатор для C/C++. Он находит ошибки, которые компилятор не замечает: утечки ресурсов, использование после освобождения, деление на ноль и т.д.`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Базовый запуск
cppcheck --enable=all --std=c17 src/

# С подавлением шума и форматированием
cppcheck --enable=warning,style,performance,portability \\
         --suppress=missingIncludeSystem \\
         --std=c17 \\
         --error-exitcode=1 \\
         -I include/ \\
         src/

# Генерация HTML-отчёта
cppcheck --enable=all --xml src/ 2> report.xml
cppcheck-htmlreport --file=report.xml --report-dir=cppcheck_report`,
      filename: 'run_cppcheck.sh',
    },
    {
      type: 'prose',
      markdown: `## clang-tidy

**clang-tidy** — анализатор и инструмент рефакторинга от проекта LLVM. Он умеет не только находить ошибки, но и автоматически их исправлять.`,
    },
    {
      type: 'code',
      language: 'bash',
      code: `# Запуск с набором проверок
clang-tidy src/*.c -- -Iinclude -std=c17

# С конфигурационным файлом .clang-tidy
clang-tidy --config-file=.clang-tidy src/*.c -- -Iinclude

# Автоматическое исправление
clang-tidy --fix src/*.c -- -Iinclude -std=c17`,
      filename: 'run_clang_tidy.sh',
    },
    {
      type: 'code',
      language: 'yaml',
      code: `# .clang-tidy
Checks: >
  -*,
  bugprone-*,
  cert-*,
  clang-analyzer-*,
  misc-*,
  performance-*,
  readability-braces-around-statements,
  readability-identifier-naming

WarningsAsErrors: 'bugprone-*,cert-*'

CheckOptions:
  - key: readability-identifier-naming.FunctionCase
    value: lower_case
  - key: readability-identifier-naming.VariableCase
    value: lower_case
  - key: readability-identifier-naming.MacroDefinitionCase
    value: UPPER_CASE`,
      filename: '.clang-tidy',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Интеграция в CI',
      markdown: 'Статические анализаторы особенно полезны в CI-пайплайне. Включите `cppcheck` и `clang-tidy` в ваш CI — каждый pull request будет автоматически проверяться. Используйте `--error-exitcode=1`, чтобы CI падал при обнаружении ошибок.',
    },
    {
      type: 'quiz',
      question: 'Что делает флаг компилятора -Werror?',
      options: [
        'Выводит дополнительные предупреждения',
        'Превращает все предупреждения в ошибки компиляции',
        'Отключает все предупреждения',
        'Показывает только критические ошибки',
      ],
      correctIndex: 1,
      explanation:
        'Флаг -Werror указывает компилятору трактовать любое предупреждение как ошибку. Код не скомпилируется, пока все предупреждения не будут устранены. Это полезно для поддержания качества кода, особенно в CI.',
    },
    {
      type: 'exercise',
      title: 'Найдите ошибки без запуска',
      description:
        'Проанализируйте следующий код глазами статического анализатора и перечислите все проблемы:\n\n```c\nint *create_array(int n) {\n    int arr[n];\n    for (int i = 0; i <= n; i++) arr[i] = i;\n    return arr;\n}\nvoid process(void) {\n    int *p = malloc(10 * sizeof(int));\n    p[10] = 42;\n    if (p != NULL) free(p);\n    printf("%d", p[0]);\n}\n```',
      hints: [
        'Обратите внимание на возвращаемый указатель в create_array',
        'Проверьте границы циклов и массивов',
        'Что происходит с указателем после free()?',
      ],
      solution: `/* Ошибки в create_array():
 * 1. Возврат указателя на локальный VLA-массив (dangling pointer).
 *    Массив arr размещён на стеке и уничтожается при выходе.
 * 2. Off-by-one: i <= n пишет за границу arr[n] (допустимо 0..n-1).
 *
 * Ошибки в process():
 * 3. Запись за границу: p[10] при размере 10 элементов (индексы 0..9).
 * 4. Проверка p != NULL после использования p[10] — слишком поздно.
 * 5. Use-after-free: printf("%d", p[0]) после free(p).
 *
 * Исправленный код: */
int *create_array(int n)
{
    int *arr = malloc((size_t)n * sizeof(int));
    if (!arr) return NULL;
    for (int i = 0; i < n; i++) arr[i] = i;
    return arr;
}

void process(void)
{
    int *p = malloc(10 * sizeof(int));
    if (!p) return;
    p[9] = 42; /* последний допустимый индекс */
    printf("%d\\n", p[0]);
    free(p);
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
