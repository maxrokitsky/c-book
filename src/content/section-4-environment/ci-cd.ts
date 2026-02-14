import type { Chapter } from '../types'

export default {
  id: 'ci-cd',
  title: 'CI/CD',
  description: 'Непрерывная интеграция и доставка для C-проектов: GitHub Actions, автоматизация',
  blocks: [
    {
      type: 'prose',
      markdown: `# CI/CD

**CI/CD** (Continuous Integration / Continuous Delivery) — практика автоматической сборки, тестирования и доставки кода при каждом изменении. Для проектов на C это особенно важно: необходимо проверять код на разных платформах, с разными компиляторами, запускать статический анализ и тесты на утечки памяти.

В этой главе мы настроим CI/CD с помощью **GitHub Actions** — наиболее популярного бесплатного решения для open source проектов.`,
    },
    {
      type: 'prose',
      markdown: `## Базовый pipeline

Типичный CI-pipeline для C-проекта включает:

1. **Сборка** — компиляция с разными компиляторами (GCC, Clang)
2. **Тестирование** — запуск юнит-тестов
3. **Статический анализ** — cppcheck, clang-tidy
4. **Динамический анализ** — санитайзеры (ASan, UBSan)
5. **Покрытие кода** — gcov + отчёт`,
    },
    {
      type: 'code',
      language: 'yaml',
      code: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        compiler: [gcc, clang]
        build_type: [Debug, Release]

    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y cmake ninja-build cppcheck

      - name: Configure
        run: |
          cmake -B build -G Ninja \\
            -DCMAKE_C_COMPILER=\${{ matrix.compiler }} \\
            -DCMAKE_BUILD_TYPE=\${{ matrix.build_type }}

      - name: Build
        run: cmake --build build

      - name: Test
        run: ctest --test-dir build --output-on-failure

      - name: Static analysis
        if: matrix.compiler == 'gcc' && matrix.build_type == 'Debug'
        run: cppcheck --enable=warning,performance --error-exitcode=1 src/`,
      filename: '.github/workflows/ci.yml',
    },
    {
      type: 'prose',
      markdown: `## Сборка с санитайзерами

Добавьте отдельный job для проверки санитайзерами:`,
    },
    {
      type: 'code',
      language: 'yaml',
      code: `  sanitizers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure with sanitizers
        run: |
          cmake -B build -G Ninja \\
            -DCMAKE_C_COMPILER=clang \\
            -DCMAKE_BUILD_TYPE=Debug \\
            -DCMAKE_C_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer"

      - name: Build
        run: cmake --build build

      - name: Run tests under sanitizers
        env:
          ASAN_OPTIONS: "detect_leaks=1:abort_on_error=1"
          UBSAN_OPTIONS: "print_stacktrace=1:halt_on_error=1"
        run: ctest --test-dir build --output-on-failure`,
      filename: '.github/workflows/ci.yml (продолжение)',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Матрица сборки',
      markdown: 'Используйте `strategy.matrix` для тестирования на нескольких конфигурациях одновременно. Типичные оси: компилятор (gcc/clang), тип сборки (Debug/Release), ОС (ubuntu/macos/windows). GitHub Actions запускает все комбинации параллельно.',
    },
    {
      type: 'prose',
      markdown: `## Покрытие кода

Отчёт о покрытии кода помогает отслеживать качество тестов:`,
    },
    {
      type: 'code',
      language: 'yaml',
      code: `  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install tools
        run: sudo apt-get install -y cmake ninja-build lcov

      - name: Configure with coverage
        run: |
          cmake -B build -G Ninja \\
            -DCMAKE_C_COMPILER=gcc \\
            -DCMAKE_BUILD_TYPE=Debug \\
            -DCMAKE_C_FLAGS="--coverage"

      - name: Build and test
        run: |
          cmake --build build
          ctest --test-dir build --output-on-failure

      - name: Generate coverage report
        run: |
          lcov --capture --directory build --output-file coverage.info
          lcov --remove coverage.info '/usr/*' --output-file coverage.info
          lcov --list coverage.info

      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: coverage.info
          token: \${{ secrets.CODECOV_TOKEN }}`,
      filename: '.github/workflows/coverage.yml',
    },
    {
      type: 'prose',
      markdown: `## Кроссплатформенная сборка

Для проверки на нескольких ОС:`,
    },
    {
      type: 'code',
      language: 'yaml',
      code: `  cross-platform:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        include:
          - os: ubuntu-latest
            compiler: gcc
          - os: macos-latest
            compiler: clang
          - os: windows-latest
            compiler: cl

    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - name: Configure
        run: cmake -B build -DCMAKE_BUILD_TYPE=Release

      - name: Build
        run: cmake --build build --config Release

      - name: Test
        run: ctest --test-dir build -C Release --output-on-failure`,
      filename: '.github/workflows/cross-platform.yml',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Бейджи статуса',
      markdown: `Добавьте бейджи CI в README для визуализации статуса:

\`\`\`markdown
![CI](https://github.com/user/project/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/user/project/branch/main/graph/badge.svg)
\`\`\`

Зелёный бейдж сообщает пользователям и контрибьюторам, что проект в рабочем состоянии.`,
    },
    {
      type: 'quiz',
      question: 'Зачем тестировать C-проект несколькими компиляторами в CI?',
      options: [
        'Для ускорения сборки',
        'Потому что разные компиляторы выдают разные предупреждения и по-разному обрабатывают UB',
        'Это требование стандарта C',
        'Для уменьшения размера бинарного файла',
      ],
      correctIndex: 1,
      explanation:
        'GCC и Clang имеют разные наборы диагностик и по-разному обрабатывают неопределённое поведение. Код, работающий с GCC, может ломаться с Clang (и наоборот), если он содержит UB или полагается на особенности конкретного компилятора. Тестирование обоими повышает портируемость и надёжность.',
    },
    {
      type: 'exercise',
      title: 'Напишите CI-конфигурацию',
      description:
        'Напишите GitHub Actions workflow для C-проекта с CMake. Workflow должен: собирать проект с GCC и Clang в Debug и Release, запускать тесты, запускать cppcheck на исходниках. Используйте матрицу для параллелизации.',
      hints: [
        'Используйте strategy.matrix для компиляторов и типов сборки',
        'cppcheck достаточно запускать один раз (не в каждой комбинации)',
        'Используйте условие if для выборочных шагов',
      ],
      solution: `# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        compiler: [gcc, clang]
        build_type: [Debug, Release]

    steps:
      - uses: actions/checkout@v4

      - name: Install
        run: sudo apt-get install -y cmake ninja-build cppcheck

      - name: Configure
        run: |
          cmake -B build -G Ninja \\
            -DCMAKE_C_COMPILER=\${{ matrix.compiler }} \\
            -DCMAKE_BUILD_TYPE=\${{ matrix.build_type }}

      - name: Build
        run: cmake --build build

      - name: Test
        run: ctest --test-dir build --output-on-failure

      - name: Static analysis
        if: matrix.compiler == 'gcc' && matrix.build_type == 'Debug'
        run: |
          cppcheck --enable=warning,performance \\
                   --error-exitcode=1 \\
                   --suppress=missingIncludeSystem \\
                   src/`,
      solutionLanguage: 'yaml',
    },
  ],
} satisfies Chapter
