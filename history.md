# noWeddingLanding — historial y documentación

Landing para vender invitaciones a una boda enorme en la que nadie se casa. Proyecto de DAW 2, con entrega el 14 de octubre de 2026.

Este documento recoge qué hay construido, con qué herramientas y por qué se tomó cada decisión. La especificación de diseño completa (textos, medidas y animaciones de cada sección) está en `noWeddingLanding-animaciones.md`; aquí solo se documenta lo ya programado y lo que se aparta de ella.

Última actualización: 7 de octubre de 2026.

## Estado

| Nº | Pieza | Ancla | Componente | Estado |
|---|---|---|---|---|
| — | Base común (rejilla, paleta, tipografía, huecos, GSAP y Lenis) | — | varios | Hecha |
| 0 | Hero | `#inicio` | `components/sections/Hero.tsx` | Hecho |
| 1 | No hace falta conocer a los novios | `#concepto` | `components/sections/Concepto.tsx` | Hecha |
| 2 | Los novios | `#novios` | `Novios.tsx` | Pendiente |
| 3 | El orden del día | `#plan` | `OrdenDelDia.tsx` | Pendiente |
| 4 | Invitaciones | `#invitaciones` | `Invitaciones.tsx` | Pendiente |
| 5 | Dudas | `#dudas` | `Dudas.tsx` | Pendiente |
| 6 | Footer | — | `Footer.tsx` | Pendiente |

Orden previsto para lo que queda, de más a menos impacto: sección 3, sección 2, footer, sección 5 y sección 4.

---

## 1. Stack y versiones

Versiones instaladas (`npm ls`) a fecha de la última actualización.

### Entorno

| Herramienta | Versión | Uso |
|---|---|---|
| Node.js | 25.9.0 | Entorno de ejecución |
| npm | 11.12.1 | Gestor de paquetes |
| Git | — | Ramas `main` (estable) y `testing` (trabajo) |

### Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| next | 16.3.6 | Framework (App Router, Turbopack) |
| react / react-dom | 19.2.8 | Librería de interfaz |
| gsap | 3.15.0 | Animaciones; incluye ScrollTrigger, SplitText, Draggable, InertiaPlugin y DrawSVGPlugin |
| @gsap/react | 2.1.2 | Hook `useGSAP`, que limpia las animaciones al desmontar |
| lenis | 1.3.26 | Scroll suave |
| shadcn | 4.21.0 | Componentes de interfaz (estilo `base-nova`) |
| @base-ui/react | 1.8.0 | Primitivas sobre las que se apoya shadcn |
| class-variance-authority | 0.7.1 | Variantes de los componentes (tamaños y colores del botón) |
| cn | 0.4.0 | Fusión de clases de Tailwind |
| lucide-react | 1.49.0 | Iconos (aún sin usar) |
| next-themes | 0.4.6 | Tema claro/oscuro del andamiaje inicial |
| tw-animate-css | 1.4.0 | Utilidades de animación que requiere shadcn |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| typescript | 5.9.3 | Tipado |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | Estilos |
| eslint / eslint-config-next | 9.39.5 / 16.3.6 | Linter |
| prettier / prettier-plugin-tailwindcss | 3.9.9 / 0.8.1 | Formato y orden de clases |
| @types/node, @types/react, @types/react-dom | 20.19.43, 19.3.0, 19.3.0 | Tipos |

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run typecheck` | Comprueba tipos |
| `npm run lint` | Linter |
| `npm run format` | Formatea con Prettier |

---

## 2. Arquitectura del proyecto

### Estructura de carpetas

```
app/
  layout.tsx          Layout raíz: idioma, metadatos, fuentes y scroll suave
  page.tsx            Solo importa las secciones y las devuelve en orden
  globals.css         Tema de Tailwind, paleta, tipografía y rejilla
components/
  sections/           Una pieza de la página por archivo
    Hero.tsx
    Concepto.tsx
  ui/
    button.tsx        Botón de shadcn, con el tamaño "pill" añadido
  placeholder.tsx     Hueco de imagen provisional
  star.tsx            Estrella SVG de N puntas
  smooth-scroll.tsx   Lenis sincronizado con ScrollTrigger
  theme-provider.tsx  Tema del andamiaje inicial
lib/
  gsap.ts             Registro único de los plugins de GSAP
  utils.ts            Reexporta `cn`
```

### Esqueleto de cada pieza

Regla del profesor: toda la landing usa el mismo esqueleto y una rejilla de columnas.

- **La sección** (`.seccion`) ocupa todo el ancho y lleva el color de fondo.
- **El contenedor** (`.contenedor`) mide 1368 px como máximo, va centrado y contiene la rejilla.

Las dos clases están en `app/globals.css`. La rejilla se controla con tres variables CSS que cambian con el ancho de la ventana:

| Ancho de ventana | `--columnas` | `--canal` | `--margen` |
|---|---|---|---|
| 1024 px o más | 12 | 24 px | 48 px |
| De 768 a 1023 px | 8 | 20 px | 32 px |
| Menos de 768 px | 4 | 16 px | 20 px |

Cada elemento se coloca sobre líneas de columna con las utilidades de Tailwind (`lg:col-start-5 lg:col-span-4`). Solo se salen del contenedor los fondos de sección y el marquee.

### Componentes compartidos

- **`Placeholder`** — hueco en blanco con el tamaño final de la imagen que irá ahí. Recibe ancho y alto (de los que saca la proporción), forma, tono del fondo y una etiqueta. Lleva un `data-slot` con nombre (`hero-novios`, `concepto-card-1`...) para sustituirlo después sin tocar el layout ni las animaciones.
- **`Star`** — estrella SVG con el número de puntas que se le pida. Se usa la de ocho puntas en el marquee; servirá también para la de 16 (sección 3) y las de 4 (sección 5).
- **`Button`** — el de shadcn. Se le añadió el tamaño `pill` para los botones de compra; el color se pasa por clase en cada sección. Como son enlaces a un ancla, se usa `buttonVariants` sobre un `<a>`.
- **`SmoothScroll`** — se monta una vez en el layout. No pinta nada.

### Servidor y cliente

`page.tsx` y `layout.tsx` son componentes de servidor. Las secciones animadas llevan `"use client"` porque usan `useGSAP`.

### Ramas

Se trabaja en `testing`; cuando una entrega está revisada, se sube a `main`.

---

## 3. Aspectos técnicos

### GSAP

- Los plugins se registran una sola vez en `lib/gsap.ts`. Los componentes importan `gsap`, `useGSAP` y los plugins desde ahí, nunca directamente del paquete.
- Cada sección crea sus animaciones dentro de `useGSAP` con `scope`, de modo que los selectores no salen de la sección y todo se limpia al desmontar.
- Los elementos animados se marcan con atributos `data-` (`data-hero="titular"`, `data-concepto="pista"`), no con clases, para separar estilo de animación.
- Las diferencias por tamaño de pantalla y por preferencias del usuario se resuelven con `gsap.matchMedia()`.

### Scroll suave

Lenis mueve el scroll y avisa a ScrollTrigger en cada fotograma; el `raf` de Lenis cuelga del ticker de GSAP para que los dos vayan al mismo ritmo. Con `anchors: true`, los enlaces a anclas también se desplazan suavemente.

### Movimiento reducido

Con `prefers-reduced-motion: reduce` no se arranca Lenis ni ninguna animación: todo aparece en su estado final.

### Hero

Una única timeline al cargar, en este orden:

1. El titular entra línea a línea (`SplitText` por líneas con máscara, `yPercent: 100`, `stagger: 0.15`).
2. El hueco de los novios sube (`y: 60`, `opacity: 0`).
3. Aparecen los dos bloques laterales (`opacity: 0`).
4. Saltan los "?" (`scale: 0`, `ease: "back.out(2)"`).
5. Los "?" se quedan flotando en bucle (`y` y `rotation`, `yoyo`, `sine.inOut`).

Para que no se vea el contenido un instante antes de que arranque la animación, los elementos con `data-hero` empiezan ocultos por CSS (solo si el usuario acepta animaciones) y la timeline los hace visibles al empezar.

El hueco de los novios ocupa las filas 3 y 4 de la rejilla y se alinea abajo; así se monta sobre la parte baja del titular sin `position: absolute`. Por eso el header, la etiqueta y el titular llevan la fila fijada a mano: sin ella, la colocación automática de la rejilla mandaba el titular debajo del hueco.

### Sección 1

- **Marquee.** Una pista con tres copias de la frase se mueve un tercio de su ancho (`xPercent: -100 / 3`) en bucle con `ease: "none"`. Al usar porcentaje, no hay que recalcular nada al cambiar el ancho de la ventana.
- **Arrastre.** `Draggable` sobre un elemento invisible, con inercia. Al arrastrar se pausa el bucle y se mueve su progreso; al soltar, sigue solo. Solo a partir de 768 px.
- **Cursor "Arrastra".** Círculo fijo que sigue al ratón con `gsap.quickTo()` y solo se muestra sobre el marquee.
- **Párrafo.** `SplitText` por palabras; la opacidad pasa de 0.25 a 1 con `ScrollTrigger` y `scrub`.
- **Cards apiladas.** Solo CSS: `position: sticky` con un `top` distinto por card. La altura de la franja visible (`--franja`) y el primer tope (`--tope`) son variables, más pequeñas en móvil.
- **Salida de la pila.** Cada card lleva un margen inferior de tantas franjas como cards tiene encima. Sin él, la tercera card se soltaba antes que las otras y tapaba sus títulos al salir de la sección.
- **`overflow: hidden`** va solo en el contenedor del marquee. En la sección rompería el `sticky` de las cards.

### Comprobaciones

Antes de dar una pieza por hecha: `npm run typecheck`, `npm run lint`, `npm run build` y revisión visual a 1440, 1024, 900 y 390 px, incluido el modo de movimiento reducido.

---

## 4. Aspectos artísticos

### Concepto

Una fiesta temática que reproduce una boda entera, con novios que son actores e invitados que no se conocen. El tono es de humor seco: se presenta con toda la solemnidad de una boda real y el giro ("nadie se casa") se entiende en dos segundos.

### Paleta

| Nombre | Hex | Variable | Clase de Tailwind |
|---|---|---|---|
| Lila | `#672D4B` | `--lila` | `bg-lila`, `text-lila` |
| Verde | `#B0B487` | `--verde` | `bg-verde`, `text-verde` |
| Blanco beige | `#F1F0E2` | `--beige` | `bg-beige`, `text-beige` |
| Marrón | `#54392D` | `--marron` | `bg-marron`, `text-marron` |

Reglas de contraste:

- Sobre beige o verde, el texto va en lila o marrón.
- Sobre lila o marrón, el texto va en beige.
- El verde solo se usa como texto pequeño sobre lila o marrón, nunca sobre beige.

### Tipografía

| Variable | Valor provisional | Valor final | Uso |
|---|---|---|---|
| `--font-display` | Georgia, Times New Roman, serif | Boska | Titulares |
| `--font-body` | system-ui, sans-serif | Por decidir | Resto de textos |

Todos los componentes usan las clases `font-display` y `font-body`, nunca una familia escrita a mano: cuando llegue Boska se cambia en un solo sitio (`app/globals.css`).

Recursos que se repiten:

- **Contraste negrita / cursiva** dentro del mismo titular: "Nadie" en negrita y "se casa" en cursiva; "menos en la boda" en cursiva dentro del marquee.
- **Titulares gigantes** con `clamp()`, interlineado de 0.9 a 1 y `letter-spacing: -0.02em`.
- **Etiqueta** (`.eyebrow`): cuerpo pequeño, mayúsculas y `letter-spacing: 0.18em`, encima de cada bloque.
- **Botones** en forma de píldora, peso 600.

### Lenguaje visual

- Fondos planos de color que cambian de una sección a otra (lila en el hero, beige en la sección 1).
- Formas simples: píldoras, esquinas muy redondeadas (40 px en las cards) y estrellas como separador.
- Los novios no tienen cara: dos "?" grandes ocupan su sitio.
- Movimiento con rebote en los detalles (los "?", el cursor) y lineal o suave en lo estructural (marquee, titular).

### Imágenes

Todavía no hay ilustraciones ni fotos. Cada una tiene su hueco con el tamaño definitivo: beige al 12 % sobre fondos oscuros y marrón al 12 % sobre fondos claros, con una etiqueta pequeña que deja claro que es intencionado.

---

## 5. Decisiones que se apartan de la especificación

| Tema | Especificación | Lo que se hizo | Motivo |
|---|---|---|---|
| Nombre de las clases | `.section` y `.container` | `.seccion` y `.contenedor` | Tailwind ya tiene una utilidad `container` que pisaba el ancho |
| Hueco de los novios | `position: absolute` | Colocado en la rejilla (columnas 5 a 8, filas 3 y 4) | Respeta la regla de las columnas y el resultado visual es el mismo |
| Bloques inferiores del hero | Se apilan por debajo de 768 px | Se apilan por debajo de 1024 px | Con 8 columnas quedaban en 160 px y el botón no cabía |
| Posición de los "?" | Tercio superior del hueco | Hacia el 36–40 % de su altura | En el tercio superior chocaban con "se casa" |
| Bucle del marquee | Helper `horizontalLoop()` de GSAP | Bucle propio con una pista de tres copias | Mucho menos código y el mismo resultado; se cambia si el profesor exige el helper |
| Separación entre cards | Cards seguidas | 120 y 240 px de margen extra antes de apilarse | Hace que las tres se suelten a la vez al salir |
| Alto de las cards | 560 px | Unos 496 px | La pila completa cabe en un portátil de 900 px de alto |

---

## 6. Pendiente

### Por recibir

| Qué | Dónde afecta | Mientras tanto |
|---|---|---|
| Tipografía Boska | Todos los titulares | Georgia a través de `--font-display` |
| Ilustración de los novios | Hero | Hueco en blanco |
| Animaciones de las tres cards | Sección 1 | Hueco en blanco |
| Marca, fecha, lugar y número de plazas | Hero | Textos entre corchetes |
| Columnas y canal que fija el profesor | Toda la página | 12 columnas y 24 px de canal |

Al sustituir la fuente provisional por Boska habrá que reajustar el tamaño de los titulares gigantes.

### Por hacer o comprobar

- Los enlaces del menú (`#plan`, `#novios`, `#invitaciones`, `#dudas`) no saltan a ningún sitio hasta que existan esas secciones.
- Probar a mano el arrastre del marquee con el ratón.
- En móvil, la pila de cards no llega a completarse porque la página se acaba ahí; se resolverá al añadir la sección siguiente.
- A 1920 × 1080 el hueco de los novios apenas se monta sobre el titular; a 1440 × 900 sí lo hace como en Figma.
- Extras opcionales sin hacer: confeti en el hero y encogido de la card tapada en la sección 1.
- `app/layout.tsx` importa `Geist` sin usarlo (aviso del linter que viene del andamiaje inicial).

---

## 7. Cronología

| Fecha | Qué se hizo |
|---|---|
| 7 de octubre de 2026 | Andamiaje inicial con Next.js y shadcn; primer commit y repositorio en GitHub |
| 7 de octubre de 2026 | Instalación de GSAP, `@gsap/react` y Lenis |
| 7 de octubre de 2026 | Base común: rejilla, paleta, tipografía provisional, `Placeholder`, registro de plugins y scroll suave |
| 7 de octubre de 2026 | Hero, en estático y con su timeline de entrada |
| 7 de octubre de 2026 | Sección 1: marquee arrastrable, cursor, revelado del párrafo y cards apiladas |
