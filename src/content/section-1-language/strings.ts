import type { Chapter } from '../types'

export default {
  id: 'strings',
  title: 'Строки',
  description: 'Строки как массивы char, функции string.h',
  blocks: [
    {
      type: 'prose',
      markdown: `# Строки

В отличие от многих современных языков, в C нет встроенного типа «строка». Строка в C — это просто **массив символов** (\`char\`), заканчивающийся специальным **нулевым символом** \`'\\0'\` (нуль-терминатором). Понимание этой концепции — ключ к работе со строками в C.`,
    },
    {
      type: 'prose',
      markdown: `## Строки как массивы char

Строковый литерал \`"Hello"\` — это массив из 6 символов: \`'H'\`, \`'e'\`, \`'l'\`, \`'l'\`, \`'o'\` и \`'\\0'\`. Нуль-терминатор добавляется автоматически.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int main(void) {
    // Три способа создать строку
    char greeting1[] = "Привет";              // Размер определяется автоматически
    char greeting2[10] = "Привет";            // Массив с запасом
    char greeting3[] = {'H', 'i', '\\0'};      // Посимвольная инициализация

    printf("%s\\n", greeting1);
    printf("%s\\n", greeting2);
    printf("%s\\n", greeting3);

    // Строка — это массив, можно обращаться по индексу
    char word[] = "Cat";
    printf("Первый символ: %c\\n", word[0]);
    printf("Второй символ: %c\\n", word[1]);

    // Можно изменить символ
    word[0] = 'B';
    printf("После изменения: %s\\n", word);

    return 0;
}`,
      filename: 'string_basics.c',
    },
    {
      type: 'output',
      content: 'Привет\nПривет\nHi\nПервый символ: C\nВторой символ: a\nПосле изменения: Bat',
      prompt: '$ gcc string_basics.c -o string_basics && ./string_basics',
    },
    {
      type: 'diagram',
      component: 'ArrayVisualizer',
      props: {
        title: 'Строка "Hello" в памяти',
        items: [
          { index: 0, value: "'H' (72)" },
          { index: 1, value: "'e' (101)" },
          { index: 2, value: "'l' (108)" },
          { index: 3, value: "'l' (108)" },
          { index: 4, value: "'o' (111)" },
          { index: 5, value: "'\\0' (0)" },
        ],
        highlightIndex: 5,
        elementSize: 1,
        startAddress: '0x3000',
      },
      caption: 'Каждый символ занимает 1 байт. Нуль-терминатор \'\\0\' (выделен) отмечает конец строки.',
    },
    {
      type: 'note',
      variant: 'danger',
      title: 'Не забывайте про нуль-терминатор!',
      markdown: `Если строка не заканчивается символом \`'\\0'\`, функции вроде \`printf\`, \`strlen\`, \`strcpy\` будут читать память за пределами массива, пока случайно не встретят ноль. Это приводит к мусорному выводу, сбоям или уязвимостям.

\`\`\`c
char bad[3] = {'H', 'i', '!'};  // НЕ строка — нет '\\0'!
printf("%s", bad);               // Неопределённое поведение
\`\`\``,
    },
    {
      type: 'prose',
      markdown: `## Функции string.h

Стандартная библиотека предоставляет набор функций для работы со строками в заголовке \`<string.h>\`. Рассмотрим основные.`,
    },
    {
      type: 'prose',
      markdown: `### strlen — длина строки

Функция \`strlen\` возвращает количество символов в строке **без учёта** нуль-терминатора.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char msg[] = "Hello, World!";

    size_t len = strlen(msg);
    printf("Строка: \\"%s\\"\\n", msg);
    printf("Длина: %zu символов\\n", len);
    printf("Размер массива: %zu байт\\n", sizeof(msg));

    return 0;
}`,
      filename: 'strlen_demo.c',
    },
    {
      type: 'output',
      content: 'Строка: "Hello, World!"\nДлина: 13 символов\nРазмер массива: 14 байт',
      prompt: '$ gcc strlen_demo.c -o strlen_demo && ./strlen_demo',
    },
    {
      type: 'prose',
      markdown: `### strcpy и strncpy — копирование строк

Нельзя скопировать строку простым присваиванием (\`str1 = str2\`), нужно использовать \`strcpy\` или более безопасную \`strncpy\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char source[] = "Копируй меня";
    char dest[50];

    // strcpy — копирует всю строку
    strcpy(dest, source);
    printf("strcpy: %s\\n", dest);

    // strncpy — копирует не более n символов (безопаснее)
    char safe_dest[10];
    strncpy(safe_dest, "Длинная строка", sizeof(safe_dest) - 1);
    safe_dest[sizeof(safe_dest) - 1] = '\\0';  // Гарантируем нуль-терминатор
    printf("strncpy: %s\\n", safe_dest);

    return 0;
}`,
      filename: 'strcpy_demo.c',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Переполнение буфера',
      markdown: `Функция \`strcpy\` не проверяет размер буфера назначения. Если исходная строка длиннее буфера, произойдёт **переполнение буфера** — одна из самых опасных уязвимостей в C. Используйте \`strncpy\` и всегда следите за размером буфера.`,
    },
    {
      type: 'prose',
      markdown: `### strcmp — сравнение строк

Строки нельзя сравнивать оператором \`==\` (он сравнивает адреса, а не содержимое). Используйте \`strcmp\`:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char a[] = "apple";
    char b[] = "banana";
    char c[] = "apple";

    // strcmp возвращает:
    //   0 — строки равны
    //  <0 — первая строка меньше (лексикографически)
    //  >0 — первая строка больше
    printf("strcmp(a, b) = %d\\n", strcmp(a, b));
    printf("strcmp(b, a) = %d\\n", strcmp(b, a));
    printf("strcmp(a, c) = %d\\n", strcmp(a, c));

    if (strcmp(a, c) == 0) {
        printf("Строки \\"%s\\" и \\"%s\\" равны\\n", a, c);
    }

    return 0;
}`,
      filename: 'strcmp_demo.c',
    },
    {
      type: 'codeDiff',
      before: `// ОШИБКА: сравнение адресов, не содержимого
char a[] = "hello";
char b[] = "hello";
if (a == b) {  // Почти всегда false!
    printf("Равны\\n");
}`,
      after: `// ПРАВИЛЬНО: сравнение содержимого строк
char a[] = "hello";
char b[] = "hello";
if (strcmp(a, b) == 0) {
    printf("Равны\\n");
}`,
      language: 'c',
      description: 'Для сравнения строк в C всегда используйте strcmp, а не ==',
    },
    {
      type: 'prose',
      markdown: `### strcat — конкатенация (склеивание) строк

Функция \`strcat\` дописывает одну строку в конец другой:`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char result[100] = "Hello";

    strcat(result, ", ");
    strcat(result, "World");
    strcat(result, "!");

    printf("%s\\n", result);
    printf("Длина: %zu\\n", strlen(result));

    return 0;
}`,
      filename: 'strcat_demo.c',
    },
    {
      type: 'output',
      content: 'Hello, World!\nДлина: 13',
      prompt: '$ gcc strcat_demo.c -o strcat_demo && ./strcat_demo',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Сводка функций string.h',
      markdown: `| Функция | Описание |
|---------|----------|
| \`strlen(s)\` | Длина строки (без \`'\\0'\`) |
| \`strcpy(dst, src)\` | Копирование строки |
| \`strncpy(dst, src, n)\` | Безопасное копирование (макс. n символов) |
| \`strcmp(s1, s2)\` | Сравнение (0 = равны) |
| \`strcat(dst, src)\` | Конкатенация |
| \`strchr(s, c)\` | Поиск первого вхождения символа |
| \`strstr(s, sub)\` | Поиск подстроки |`,
    },
    {
      type: 'exercise',
      title: 'Функция подсчёта слов',
      description: `Напишите функцию \`int count_words(const char *str)\`, которая подсчитывает количество слов в строке. Словом считается последовательность символов, разделённая пробелами. Множественные пробелы между словами должны обрабатываться корректно.

Примеры:
- \`"Hello World"\` -> 2
- \`"  one   two  three  "\` -> 3
- \`""\` -> 0
- \`"word"\` -> 1`,
      hints: [
        'Перебирайте строку посимвольно.',
        'Отслеживайте, находитесь ли вы «внутри слова» или «между словами».',
        'Слово начинается, когда после пробела встречается не-пробельный символ.',
      ],
      solution: `#include <stdio.h>

int count_words(const char *str) {
    int count = 0;
    int in_word = 0;

    for (int i = 0; str[i] != '\\0'; i++) {
        if (str[i] == ' ') {
            in_word = 0;
        } else if (!in_word) {
            in_word = 1;
            count++;
        }
    }

    return count;
}

int main(void) {
    printf("%d\\n", count_words("Hello World"));
    printf("%d\\n", count_words("  one   two  three  "));
    printf("%d\\n", count_words(""));
    printf("%d\\n", count_words("word"));

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
