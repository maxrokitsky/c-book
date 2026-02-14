import type { Chapter } from '../types'

export default {
  id: 'functions',
  title: 'Функции',
  description: 'Объявление, определение, прототипы, области видимости',
  blocks: [
    {
      type: 'prose',
      markdown: `# Функции

Функции — основной строительный блок программ на C. Они позволяют разбить код на логические части, избежать дублирования и сделать программу понятнее. Каждая программа на C содержит хотя бы одну функцию — \`main\`.`,
    },
    {
      type: 'prose',
      markdown: `## Объявление и определение

В C различают **объявление** (declaration) и **определение** (definition) функции:

- **Объявление** (прототип) — сообщает компилятору о существовании функции, её имени, типе возвращаемого значения и параметрах.
- **Определение** — содержит тело функции с реальным кодом.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

// Объявление (прототип) функции
int add(int a, int b);

int main(void) {
    int result = add(3, 5);
    printf("3 + 5 = %d\\n", result);
    return 0;
}

// Определение функции
int add(int a, int b) {
    return a + b;
}`,
      filename: 'function_proto.c',
    },
    {
      type: 'output',
      content: '3 + 5 = 8',
      prompt: '$ gcc function_proto.c -o function_proto && ./function_proto',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Зачем нужны прототипы?',
      markdown: `Компилятор C обрабатывает файл сверху вниз. Если функция вызывается до её определения, компилятор не знает о ней и выдаст ошибку. Прототип решает эту проблему — он «обещает» компилятору, что функция будет определена позже.

В заголовочных файлах (\`.h\`) обычно размещают именно прототипы.`,
    },
    {
      type: 'prose',
      markdown: `## Параметры и возвращаемое значение

Функция может принимать параметры и возвращать значение. Тип \`void\` означает «ничего» — функция не принимает аргументов или не возвращает значения.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

// Функция без параметров и без возвращаемого значения
void greet(void) {
    printf("Привет, мир!\\n");
}

// Функция с параметрами и возвращаемым значением
double average(double a, double b) {
    return (a + b) / 2.0;
}

// Функция с несколькими параметрами
int clamp(int value, int min, int max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

int main(void) {
    greet();

    double avg = average(3.0, 7.0);
    printf("Среднее: %.1f\\n", avg);

    int clamped = clamp(150, 0, 100);
    printf("Clamped: %d\\n", clamped);

    return 0;
}`,
      filename: 'func_params.c',
    },
    {
      type: 'output',
      content: 'Привет, мир!\nСреднее: 5.0\nClamped: 100',
      prompt: '$ gcc func_params.c -o func_params && ./func_params',
    },
    {
      type: 'prose',
      markdown: `## Передача по значению

В C аргументы передаются **по значению** — функция получает **копию** переданного значения. Изменение параметра внутри функции не влияет на оригинальную переменную.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

void try_to_change(int x) {
    x = 999;  // Изменяем локальную копию
    printf("Внутри функции: x = %d\\n", x);
}

int main(void) {
    int num = 42;
    printf("До вызова: num = %d\\n", num);

    try_to_change(num);

    printf("После вызова: num = %d\\n", num);

    return 0;
}`,
      filename: 'pass_by_value.c',
    },
    {
      type: 'output',
      content: 'До вызова: num = 42\nВнутри функции: x = 999\nПосле вызова: num = 42',
      prompt: '$ gcc pass_by_value.c -o pass_by_value && ./pass_by_value',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Изменение переменных через указатели',
      markdown: `Чтобы функция могла изменить переменную вызывающего кода, нужно передать **указатель** на неё. Мы подробно разберём это в главе «Введение в указатели».`,
    },
    {
      type: 'prose',
      markdown: `## Область видимости переменных

Переменные в C имеют **область видимости** (scope) — часть программы, в которой переменная доступна:

- **Локальные переменные** — объявлены внутри функции или блока \`{}\`, видны только внутри него.
- **Глобальные переменные** — объявлены вне всех функций, видны во всём файле.
- **Параметры функции** — ведут себя как локальные переменные.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>

int global_counter = 0;  // Глобальная переменная

void increment(void) {
    global_counter++;  // Доступна из любой функции
    int local_var = 10;  // Локальная — только в этой функции
    printf("counter = %d, local = %d\\n", global_counter, local_var);
}

int main(void) {
    increment();
    increment();
    increment();

    printf("Итого: counter = %d\\n", global_counter);
    // printf("%d", local_var);  // ОШИБКА: local_var здесь не видна

    return 0;
}`,
      filename: 'scope.c',
    },
    {
      type: 'output',
      content: 'counter = 1, local = 10\ncounter = 2, local = 10\ncounter = 3, local = 10\nИтого: counter = 3',
      prompt: '$ gcc scope.c -o scope && ./scope',
    },
    {
      type: 'note',
      variant: 'warning',
      title: 'Глобальные переменные — осторожно!',
      markdown: `Глобальные переменные удобны, но делают код труднее для понимания и отладки: любая функция может их изменить. Старайтесь минимизировать использование глобальных переменных и передавать данные через параметры функций.`,
    },
    {
      type: 'prose',
      markdown: `## Стек вызовов

При вызове функции её локальные переменные и адрес возврата помещаются в **стек** (stack). Когда функция завершается, её кадр (frame) удаляется со стека. Это позволяет каждому вызову иметь свои независимые переменные.`,
    },
    {
      type: 'diagram',
      component: 'StackFrameVisualizer',
      props: {
        frames: [
          {
            name: 'main',
            variables: [
              { name: 'result', value: '?' },
            ],
          },
          {
            name: 'add(3, 5)',
            variables: [
              { name: 'a', value: '3' },
              { name: 'b', value: '5' },
            ],
          },
        ],
      },
      caption: 'Стек вызовов в момент выполнения функции add(3, 5): каждая функция имеет свой кадр с локальными переменными',
    },
    {
      type: 'codeDiff',
      before: `// Дублирование кода — плохо
int main(void) {
    // Вычисление площади первого прямоугольника
    int area1 = 5 * 3;
    printf("Площадь: %d\\n", area1);

    // Вычисление площади второго прямоугольника
    int area2 = 10 * 7;
    printf("Площадь: %d\\n", area2);

    // Вычисление площади третьего прямоугольника
    int area3 = 4 * 9;
    printf("Площадь: %d\\n", area3);
}`,
      after: `// Вынесение логики в функцию — хорошо
void print_area(int width, int height) {
    int area = width * height;
    printf("Площадь: %d\\n", area);
}

int main(void) {
    print_area(5, 3);
    print_area(10, 7);
    print_area(4, 9);
}`,
      language: 'c',
      description: 'Функции устраняют дублирование кода и делают программу понятнее',
    },
    {
      type: 'exercise',
      title: 'Функция проверки простого числа',
      description: `Напишите функцию \`is_prime\`, которая принимает целое число и возвращает \`1\`, если число простое, и \`0\` в противном случае. Затем используйте её в \`main\`, чтобы вывести все простые числа от 2 до 50.

Простое число — это число больше 1, которое делится только на 1 и на само себя.

Ожидаемый вывод:
\`\`\`
2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
\`\`\``,
      hints: [
        'Числа 0 и 1 не являются простыми.',
        'Для проверки достаточно делить число на все числа от 2 до его квадратного корня.',
        'Если нашёлся хотя бы один делитель — число не простое.',
      ],
      solution: `#include <stdio.h>

int is_prime(int n) {
    if (n < 2) return 0;

    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return 0;
        }
    }

    return 1;
}

int main(void) {
    for (int i = 2; i <= 50; i++) {
        if (is_prime(i)) {
            printf("%d ", i);
        }
    }
    printf("\\n");

    return 0;
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
