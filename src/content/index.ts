import type { Section, TableOfContents } from './types'

const section1Language: Section = {
  id: 'language',
  title: 'Язык C',
  description:
    'Полное руководство по языку C — от первой программы до продвинутых возможностей стандартов C11/C17/C23.',
  icon: '📖',
  chapters: [
    { id: 'introduction', title: 'Введение в C', description: 'История, философия и место C в современном мире' },
    { id: 'first-program', title: 'Первая программа', description: 'Hello World и анатомия программы на C' },
    { id: 'compilation', title: 'Компиляция', description: 'Этапы компиляции: препроцессор, компилятор, линковщик' },
    { id: 'variables-and-types', title: 'Переменные и типы данных', description: 'int, float, char, размеры типов, литералы' },
    { id: 'operators', title: 'Операторы', description: 'Арифметические, логические, побитовые операторы и приоритет' },
    { id: 'io', title: 'Ввод и вывод', description: 'printf, scanf, форматные спецификаторы' },
    { id: 'conditions', title: 'Условия: if, else, switch', description: 'Условные конструкции и ветвление' },
    { id: 'loops', title: 'Циклы', description: 'for, while, do-while, break, continue' },
    { id: 'functions', title: 'Функции', description: 'Объявление, определение, прототипы, области видимости' },
    { id: 'arrays', title: 'Массивы', description: 'Одномерные и многомерные массивы, инициализация' },
    { id: 'strings', title: 'Строки', description: 'Строки как массивы char, функции string.h' },
    { id: 'pointers-intro', title: 'Введение в указатели', description: 'Адреса, разыменование, NULL' },
    { id: 'pointers-and-arrays', title: 'Указатели и массивы', description: 'Связь указателей и массивов, передача в функции' },
    { id: 'pointer-arithmetic', title: 'Арифметика указателей', description: 'Сложение, вычитание, сравнение указателей' },
    { id: 'dynamic-memory', title: 'Динамическая память', description: 'malloc, calloc, realloc, free и утечки памяти' },
    { id: 'structs', title: 'Структуры', description: 'struct, вложенные структуры, массивы структур' },
    { id: 'unions-enums', title: 'Объединения и перечисления', description: 'union, enum и их применение' },
    { id: 'typedef-qualifiers', title: 'typedef и квалификаторы', description: 'typedef, const, volatile, restrict' },
    { id: 'preprocessor', title: 'Препроцессор', description: '#define, #include, условная компиляция, макросы' },
    { id: 'multifile', title: 'Многофайловые программы', description: 'Заголовочные файлы, include guards, линковка' },
    { id: 'storage-classes', title: 'Классы памяти', description: 'auto, static, extern, register, _Thread_local' },
    { id: 'file-io', title: 'Файловый ввод/вывод', description: 'fopen, fread, fwrite, fseek, бинарные файлы' },
    { id: 'error-handling', title: 'Обработка ошибок', description: 'errno, perror, коды возврата, стратегии обработки' },
    { id: 'bitwise', title: 'Побитовые операции', description: 'AND, OR, XOR, сдвиги, битовые маски и флаги' },
    { id: 'recursion', title: 'Рекурсия', description: 'Рекурсивные функции, стек вызовов, хвостовая рекурсия' },
    { id: 'function-pointers', title: 'Указатели на функции', description: 'Синтаксис, callback-функции, массивы указателей' },
    { id: 'advanced-pointers', title: 'Продвинутые указатели', description: 'Указатели на указатели, void*, generic-контейнеры' },
    { id: 'variadic-functions', title: 'Функции с переменным числом аргументов', description: 'stdarg.h, va_list, реализация printf' },
    { id: 'data-structures', title: 'Структуры данных на C', description: 'Связные списки, стеки, очереди, деревья, хеш-таблицы' },
    { id: 'memory-model', title: 'Модель памяти C', description: 'Стек, куча, сегменты, выравнивание, порядок байтов' },
    { id: 'undefined-behavior', title: 'Неопределённое поведение', description: 'UB, implementation-defined, unspecified поведение' },
    { id: 'standard-library', title: 'Стандартная библиотека', description: 'Обзор stdlib, string, math, time, assert' },
    { id: 'threads', title: 'Многопоточность (C11)', description: 'threads.h, мьютексы, атомарные операции' },
    { id: 'generic-programming', title: 'Обобщённое программирование', description: '_Generic, макросы для обобщённого кода' },
    { id: 'modern-c', title: 'Современный C (C11/C17/C23)', description: 'Новые возможности стандартов, typeof, constexpr' },
  ],
}

const section2Projects: Section = {
  id: 'projects',
  title: 'Проекты',
  description:
    'Практические проекты для закрепления знаний — от простого калькулятора до рейтрейсера.',
  icon: '🛠',
  chapters: [
    { id: 'calculator', title: 'Калькулятор', description: 'Консольный калькулятор с парсингом выражений' },
    { id: 'text-editor', title: 'Текстовый редактор', description: 'Минимальный текстовый редактор в терминале' },
    { id: 'http-server', title: 'HTTP-сервер', description: 'Простой HTTP/1.1 сервер с сокетами' },
    { id: 'kv-database', title: 'База данных ключ-значение', description: 'Key-value хранилище с персистентностью' },
    { id: 'shell', title: 'Unix-шелл', description: 'Интерпретатор команд с пайпами и перенаправлениями' },
    { id: 'malloc', title: 'Свой malloc', description: 'Реализация аллокатора памяти' },
    { id: 'mini-compiler', title: 'Мини-компилятор', description: 'Компилятор простого языка в x86 ассемблер' },
    { id: 'raytracer', title: 'Рейтрейсер', description: 'Трассировщик лучей с поддержкой сфер и освещения' },
  ],
}

const section3Practices: Section = {
  id: 'practices',
  title: 'Практики реального мира',
  description:
    'Профессиональные практики разработки на C: сборка, тестирование, отладка, документирование.',
  icon: '⚙',
  chapters: [
    { id: 'project-structure', title: 'Структура проекта', description: 'Организация файлов, папок и модулей' },
    { id: 'build-systems', title: 'Системы сборки', description: 'Make, CMake, Meson, Ninja' },
    { id: 'testing', title: 'Тестирование', description: 'Unit-тесты, интеграционные тесты, фреймворки' },
    { id: 'debugging', title: 'Отладка', description: 'GDB, Valgrind, AddressSanitizer, стратегии' },
    { id: 'documentation', title: 'Документирование', description: 'Doxygen, комментарии, README, примеры' },
    { id: 'static-analysis', title: 'Статический анализ', description: 'Clang-Tidy, Cppcheck, PVS-Studio' },
    { id: 'defensive-programming', title: 'Защитное программирование', description: 'Assertions, проверки, безопасное кодирование' },
    { id: 'performance', title: 'Производительность', description: 'Профилирование, оптимизация, кеш-эффекты' },
    { id: 'portability', title: 'Портируемость', description: 'Кроссплатформенность, endianness, стандарты' },
    { id: 'api-design', title: 'Дизайн API', description: 'Проектирование библиотек, ABI, версионирование' },
    { id: 'open-source', title: 'Open Source', description: 'Участие в open source, лицензии, сообщество' },
  ],
}

const section4Environment: Section = {
  id: 'environment',
  title: 'Настройка окружения',
  description:
    'Настройка среды разработки: компиляторы, редакторы, системы контроля версий.',
  icon: '💻',
  chapters: [
    { id: 'tools-overview', title: 'Обзор инструментов', description: 'Компиляторы, редакторы, утилиты для разработки на C' },
    { id: 'gcc-clang', title: 'Установка GCC/Clang', description: 'Установка и настройка компиляторов на Linux, macOS, Windows' },
    { id: 'editor-ide', title: 'Настройка редактора/IDE', description: 'VS Code, Vim, CLion — настройка для C' },
    { id: 'git', title: 'Git', description: 'Основы Git, .gitignore, ветвление для C-проектов' },
    { id: 'package-managers', title: 'Менеджеры пакетов', description: 'vcpkg, Conan, системные пакетные менеджеры' },
    { id: 'ci-cd', title: 'CI/CD', description: 'GitHub Actions, автоматизация сборки и тестов' },
  ],
}

export const tableOfContents: TableOfContents = {
  sections: [section1Language, section2Projects, section3Practices, section4Environment],
}

export function findSection(sectionId: string): Section | undefined {
  return tableOfContents.sections.find((s) => s.id === sectionId)
}

export function findChapterMeta(sectionId: string, chapterId: string) {
  const section = findSection(sectionId)
  if (!section) return undefined
  const chapter = section.chapters.find((c) => c.id === chapterId)
  if (!chapter) return undefined
  return { section, chapter }
}

export function getAdjacentChapters(sectionId: string, chapterId: string) {
  const allChapters: { sectionId: string; chapterId: string; title: string }[] = []
  for (const section of tableOfContents.sections) {
    for (const chapter of section.chapters) {
      allChapters.push({
        sectionId: section.id,
        chapterId: chapter.id,
        title: chapter.title,
      })
    }
  }
  const currentIndex = allChapters.findIndex(
    (c) => c.sectionId === sectionId && c.chapterId === chapterId,
  )
  return {
    prev: currentIndex > 0 ? allChapters[currentIndex - 1]! : null,
    next: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1]! : null,
  }
}
