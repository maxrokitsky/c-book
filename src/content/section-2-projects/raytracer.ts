import type { Chapter } from '../types'

export default {
  id: 'raytracer',
  title: 'Рейтрейсер',
  description: 'Трассировщик лучей с поддержкой сфер и освещения',
  blocks: [
    {
      type: 'prose',
      markdown: `# Рейтрейсер

Трассировка лучей (ray tracing) — метод рендеринга, при котором для каждого пикселя изображения выпускается луч из камеры в сцену. Если луч пересекает объект, вычисляется цвет пикселя с учётом материала и освещения.

В этом проекте мы напишем рейтрейсер, который:
- Рендерит сцену со сферами
- Поддерживает диффузное и зеркальное освещение (модель Фонга)
- Вычисляет тени и отражения
- Выводит результат в формате PPM

Проект прекрасно демонстрирует работу с математикой в C: векторные операции, вычисления с плавающей точкой, оптимизация вычислений.`,
    },
    {
      type: 'prose',
      markdown: `## Математические основы

Вся трассировка лучей построена на трёхмерных векторах. Нам понадобятся операции: сложение, вычитание, скалярное произведение (dot product), нормализация и масштабирование.

Луч описывается формулой: **P(t) = origin + t * direction**, где \`origin\` — начало луча, \`direction\` — направление, \`t\` — параметр (расстояние).

Для нахождения пересечения луча со сферой решается квадратное уравнение, полученное подстановкой формулы луча в уравнение сферы \`|P - center|^2 = radius^2\`.`,
    },
    {
      type: 'code',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <float.h>

/* ========== Вектор ========== */
typedef struct {
    double x, y, z;
} Vec3;

static Vec3 vec3(double x, double y, double z)
{
    return (Vec3){x, y, z};
}

static Vec3 vec3_add(Vec3 a, Vec3 b)
{
    return vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

static Vec3 vec3_sub(Vec3 a, Vec3 b)
{
    return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

static Vec3 vec3_scale(Vec3 v, double t)
{
    return vec3(v.x * t, v.y * t, v.z * t);
}

static double vec3_dot(Vec3 a, Vec3 b)
{
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

static double vec3_length(Vec3 v)
{
    return sqrt(vec3_dot(v, v));
}

static Vec3 vec3_normalize(Vec3 v)
{
    double len = vec3_length(v);
    return vec3(v.x / len, v.y / len, v.z / len);
}

/* Отражение вектора относительно нормали */
static Vec3 vec3_reflect(Vec3 v, Vec3 n)
{
    return vec3_sub(v, vec3_scale(n, 2.0 * vec3_dot(v, n)));
}`,
      filename: 'raytracer.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* ========== Структуры сцены ========== */
typedef struct {
    Vec3 origin;
    Vec3 direction;
} Ray;

typedef struct {
    Vec3 color;      /* RGB, каждый компонент от 0 до 1 */
    double diffuse;  /* коэффициент диффузного отражения */
    double specular; /* коэффициент зеркального отражения */
    double shininess;/* показатель блеска */
    double reflect;  /* коэффициент отражения (0..1) */
} Material;

typedef struct {
    Vec3 center;
    double radius;
    Material mat;
} Sphere;

typedef struct {
    Vec3 position;
    Vec3 color;
    double intensity;
} Light;

#define MAX_SPHERES 32
#define MAX_LIGHTS 8

typedef struct {
    Sphere spheres[MAX_SPHERES];
    int num_spheres;
    Light lights[MAX_LIGHTS];
    int num_lights;
    Vec3 ambient;   /* цвет фонового освещения */
    Vec3 bg_color;  /* цвет фона (небо) */
} Scene;`,
      filename: 'raytracer.c',
    },
    {
      type: 'note',
      variant: 'info',
      title: 'Формат PPM',
      markdown:
        'PPM (Portable Pixmap) — простейший формат изображений. Заголовок: `P3\\nширина высота\\n255\\n`, затем RGB-тройки в текстовом виде. Файл можно открыть в большинстве графических программ (GIMP, ImageMagick). Для конвертации в PNG: `convert output.ppm output.png`.',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Пересечение луча со сферой */
static int sphere_intersect(const Sphere *s, const Ray *ray, double *t)
{
    Vec3 oc = vec3_sub(ray->origin, s->center);
    double a = vec3_dot(ray->direction, ray->direction);
    double b = 2.0 * vec3_dot(oc, ray->direction);
    double c = vec3_dot(oc, oc) - s->radius * s->radius;
    double discriminant = b * b - 4.0 * a * c;

    if (discriminant < 0)
        return 0;

    double sqrt_d = sqrt(discriminant);
    double t1 = (-b - sqrt_d) / (2.0 * a);
    double t2 = (-b + sqrt_d) / (2.0 * a);

    if (t1 > 0.001) {
        *t = t1;
        return 1;
    }
    if (t2 > 0.001) {
        *t = t2;
        return 1;
    }
    return 0;
}

/* Поиск ближайшего пересечения луча с объектами сцены */
static int scene_intersect(const Scene *scene, const Ray *ray,
                           double *t_out, int *sphere_idx)
{
    double closest = DBL_MAX;
    int hit = 0;
    for (int i = 0; i < scene->num_spheres; i++) {
        double t;
        if (sphere_intersect(&scene->spheres[i], ray, &t) && t < closest) {
            closest = t;
            *sphere_idx = i;
            hit = 1;
        }
    }
    if (hit) *t_out = closest;
    return hit;
}`,
      filename: 'raytracer.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Модель освещения Фонга */
static Vec3 shade(const Scene *scene, const Ray *ray,
                  Vec3 hit_point, Vec3 normal, const Material *mat,
                  int depth)
{
    /* Фоновое освещение */
    Vec3 color = vec3(
        mat->color.x * scene->ambient.x,
        mat->color.y * scene->ambient.y,
        mat->color.z * scene->ambient.z
    );

    for (int i = 0; i < scene->num_lights; i++) {
        Light *light = (Light *)&scene->lights[i];
        Vec3 to_light = vec3_sub(light->position, hit_point);
        double dist_to_light = vec3_length(to_light);
        Vec3 light_dir = vec3_normalize(to_light);

        /* Проверка тени */
        Ray shadow_ray = {hit_point, light_dir};
        double shadow_t;
        int shadow_idx;
        if (scene_intersect(scene, &shadow_ray, &shadow_t, &shadow_idx)
            && shadow_t < dist_to_light)
            continue;  /* точка в тени */

        /* Диффузная составляющая (закон Ламберта) */
        double diff = vec3_dot(normal, light_dir);
        if (diff > 0) {
            color = vec3_add(color, vec3_scale(
                vec3(mat->color.x * light->color.x,
                     mat->color.y * light->color.y,
                     mat->color.z * light->color.z),
                diff * mat->diffuse * light->intensity
            ));
        }

        /* Зеркальная составляющая (блик) */
        Vec3 reflect_dir = vec3_reflect(
            vec3_scale(light_dir, -1), normal);
        double spec = vec3_dot(reflect_dir, ray->direction);
        if (spec > 0) {
            color = vec3_add(color, vec3_scale(
                light->color,
                pow(spec, mat->shininess) * mat->specular * light->intensity
            ));
        }
    }

    /* Отражения (рекурсия) */
    if (mat->reflect > 0 && depth > 0) {
        Vec3 reflect_dir = vec3_reflect(ray->direction, normal);
        Ray reflect_ray = {hit_point, reflect_dir};
        Vec3 reflect_color = trace(scene, &reflect_ray, depth - 1);
        color = vec3_add(color,
                         vec3_scale(reflect_color, mat->reflect));
    }

    return color;
}`,
      filename: 'raytracer.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `/* Трассировка одного луча */
static Vec3 trace(const Scene *scene, const Ray *ray, int depth)
{
    double t;
    int idx;
    if (!scene_intersect(scene, ray, &t, &idx))
        return scene->bg_color;

    Vec3 hit = vec3_add(ray->origin, vec3_scale(ray->direction, t));
    Vec3 normal = vec3_normalize(
        vec3_sub(hit, scene->spheres[idx].center));

    return shade(scene, ray, hit, normal,
                 &scene->spheres[idx].mat, depth);
}

/* Ограничение значения в диапазон [0, 1] */
static double clamp01(double v)
{
    return v < 0 ? 0 : (v > 1 ? 1 : v);
}

static void render(const Scene *scene, int width, int height,
                   const char *filename)
{
    FILE *fp = fopen(filename, "w");
    fprintf(fp, "P3\\n%d %d\\n255\\n", width, height);

    double aspect = (double)width / (double)height;
    double fov = 1.0;  /* tan(FOV/2) */

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            /* Преобразуем пиксельные координаты в направление луча */
            double px = (2.0 * ((double)x + 0.5) / (double)width - 1.0)
                        * aspect * fov;
            double py = (1.0 - 2.0 * ((double)y + 0.5) / (double)height)
                        * fov;

            Ray ray = {vec3(0, 0, 0), vec3_normalize(vec3(px, py, -1))};
            Vec3 color = trace(scene, &ray, 5);

            int r = (int)(clamp01(color.x) * 255.0);
            int g = (int)(clamp01(color.y) * 255.0);
            int b = (int)(clamp01(color.z) * 255.0);
            fprintf(fp, "%d %d %d ", r, g, b);
        }
        fprintf(fp, "\\n");
    }
    fclose(fp);
}`,
      filename: 'raytracer.c',
    },
    {
      type: 'code',
      language: 'c',
      code: `int main(void)
{
    Scene scene = {0};
    scene.ambient = vec3(0.1, 0.1, 0.1);
    scene.bg_color = vec3(0.2, 0.3, 0.5);

    /* Красная сфера */
    scene.spheres[0] = (Sphere){
        .center = vec3(0, 0, -5),
        .radius = 1.0,
        .mat = {vec3(0.9, 0.1, 0.1), 0.8, 0.5, 50, 0.2}
    };
    /* Зелёная сфера */
    scene.spheres[1] = (Sphere){
        .center = vec3(2, 0.5, -4),
        .radius = 0.7,
        .mat = {vec3(0.1, 0.8, 0.2), 0.7, 0.3, 30, 0.1}
    };
    /* Большая серая сфера (пол) */
    scene.spheres[2] = (Sphere){
        .center = vec3(0, -101, -5),
        .radius = 100,
        .mat = {vec3(0.5, 0.5, 0.5), 0.6, 0.2, 10, 0.05}
    };
    /* Синяя зеркальная сфера */
    scene.spheres[3] = (Sphere){
        .center = vec3(-1.5, -0.3, -3.5),
        .radius = 0.6,
        .mat = {vec3(0.1, 0.2, 0.9), 0.5, 0.8, 100, 0.6}
    };
    scene.num_spheres = 4;

    /* Источник света */
    scene.lights[0] = (Light){vec3(-5, 5, 0), vec3(1, 1, 1), 1.0};
    scene.lights[1] = (Light){vec3(3, 3, -2), vec3(0.8, 0.8, 1.0), 0.6};
    scene.num_lights = 2;

    printf("Рендеринг 800x600...\\n");
    render(&scene, 800, 600, "output.ppm");
    printf("Готово! Результат в output.ppm\\n");

    return 0;
}`,
      filename: 'raytracer.c',
    },
    {
      type: 'output',
      content: `Рендеринг 800x600...
Готово! Результат в output.ppm`,
      prompt: '$ gcc -Wall -Wextra -O2 -lm -o raytracer raytracer.c && ./raytracer',
    },
    {
      type: 'note',
      variant: 'tip',
      title: 'Оптимизация производительности',
      markdown: `Наш рейтрейсер прост, но медленен для сложных сцен. Основные техники оптимизации:

- **Многопоточность:** каждая строка (или блок пикселей) рендерится в отдельном потоке
- **SIMD:** использование SSE/AVX инструкций для параллельных вычислений над векторами
- **BVH (Bounding Volume Hierarchy):** ускоряющая структура для быстрого отсечения объектов, далёких от луча
- **Флаг -O2:** включает оптимизации компилятора, ускоряя рейтрейсер в 3-5 раз`,
    },
    {
      type: 'exercise',
      title: 'Добавьте поддержку плоскости',
      description:
        'Реализуйте пересечение луча с бесконечной плоскостью, заданной точкой и нормалью. Это позволит создать реалистичный пол вместо огромной сферы. Формула: `t = dot(point - origin, normal) / dot(direction, normal)`.',
      hints: [
        'Создайте структуру Plane с полями: Vec3 point, Vec3 normal, Material mat',
        'Пересечение существует только если dot(direction, normal) != 0 и t > 0.001',
        'Для шахматного узора на полу используйте (int)(floor(x) + floor(z)) % 2',
      ],
      solution: `typedef struct {
    Vec3 point;
    Vec3 normal;
    Material mat;
} Plane;

static int plane_intersect(const Plane *plane, const Ray *ray, double *t)
{
    double denom = vec3_dot(ray->direction, plane->normal);
    if (fabs(denom) < 1e-6)
        return 0;  /* луч параллелен плоскости */

    Vec3 diff = vec3_sub(plane->point, ray->origin);
    *t = vec3_dot(diff, plane->normal) / denom;
    return *t > 0.001;
}

/* Шахматный узор для плоскости */
static Vec3 checkerboard_color(Vec3 point)
{
    int pattern = ((int)floor(point.x) + (int)floor(point.z)) % 2;
    if (pattern < 0) pattern = -pattern;
    return pattern ? vec3(0.9, 0.9, 0.9) : vec3(0.2, 0.2, 0.2);
}`,
      solutionLanguage: 'c',
    },
    {
      type: 'exercise',
      title: 'Реализуйте антиалиасинг',
      description:
        'Добавьте антиалиасинг методом суперсэмплинга: для каждого пикселя выпускайте несколько лучей со случайным смещением внутри пикселя и усредняйте результат. Это устранит ступенчатые края объектов.',
      hints: [
        'Для каждого пикселя генерируйте N=16 лучей с малым случайным смещением',
        'Используйте drand48() или (double)rand()/RAND_MAX для случайного числа от 0 до 1',
        'Усредните все полученные цвета делением на N',
      ],
      solution: `#define SAMPLES_PER_PIXEL 16

static Vec3 render_pixel(const Scene *scene, int x, int y,
                         int width, int height, double aspect, double fov)
{
    Vec3 color = vec3(0, 0, 0);
    for (int s = 0; s < SAMPLES_PER_PIXEL; s++) {
        double jx = (double)x + drand48();
        double jy = (double)y + drand48();
        double px = (2.0 * jx / (double)width - 1.0) * aspect * fov;
        double py = (1.0 - 2.0 * jy / (double)height) * fov;

        Ray ray = {vec3(0, 0, 0), vec3_normalize(vec3(px, py, -1))};
        color = vec3_add(color, trace(scene, &ray, 5));
    }
    return vec3_scale(color, 1.0 / SAMPLES_PER_PIXEL);
}`,
      solutionLanguage: 'c',
    },
  ],
} satisfies Chapter
