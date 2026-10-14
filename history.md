# noWeddingLanding — historial y documentación

Landing para vender invitaciones a una boda enorme en la que nadie se casa. Proyecto de DAW 2, con entrega el 14 de octubre de 2026.

Este documento recoge qué hay construido, con qué herramientas y por qué se tomó cada decisión. La especificación de diseño completa (textos, medidas y animaciones de cada sección) está en `noWeddingLanding-animaciones.md`; aquí solo se documenta lo ya programado y lo que se aparta de ella.

Última actualización: 14 de octubre de 2026.

## Estado

| Nº | Pieza | Ancla | Componente | Estado |
|---|---|---|---|---|
| — | Base común (rejilla, paleta, tipografía, huecos, GSAP y Lenis) | — | varios | Hecha |
| 0 | Hero | `#inicio` | `components/sections/Hero.tsx` | Hecho |
| 1 | No hace falta conocer a los novios | `#concepto` | `components/sections/Concepto.tsx` | Hecha |
| 2 | Los novios | `#novios` | `components/sections/Novios.tsx` | Hecha |
| 3 | El orden del día | `#plan` | `components/sections/OrdenDelDia.tsx` | Hecha |
| 4 | Invitaciones | `#invitaciones` | `components/sections/Invitaciones.tsx` | Hecha |
| 5 | Dudas razonables | `#dudas` | `components/sections/Dudas.tsx` | Hecha |
| 6 | Footer | — | `components/sections/Footer.tsx` | Hecho |

Las siete piezas están maquetadas y animadas. Lo que falta es contenido definitivo (imágenes y textos) y los extras opcionales; está en el apartado 6.

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
| gsap | 3.15.0 | Animaciones; incluye ScrollTrigger, SplitText, Draggable, InertiaPlugin, DrawSVGPlugin y MotionPathPlugin |
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
  fonts/              Boska variable (redonda y cursiva) en woff2
  page.tsx            Solo importa las secciones y las devuelve en orden (<main> y <footer>)
  globals.css         Tema de Tailwind, paleta, tipografía y rejilla
components/
  sections/           Una pieza de la página por archivo
    Hero.tsx
    Invitaciones.tsx
    Concepto.tsx
    Dudas.tsx
    Footer.tsx
    Novios.tsx
    OrdenDelDia.tsx
  ui/
    button.tsx        Botón de shadcn, con el tamaño "pill" añadido
  placeholder.tsx     Hueco de imagen provisional (ya sin uso)
  polaroid.tsx        Polaroid de la sección 2, con su papel, detalles y sujeción
  sello-arrastra.tsx  Sello de lacre que hace de cursor en el marquee
  fondo-card.tsx      Fondo de las cards de la sección 1
  novios-hero.tsx     Ilustración de los novios del hero
  escenas-concepto.tsx  Las tres escenas animadas de las cards de la sección 1
  escenas-polaroid.tsx  Las seis escenas animadas de las fotos de las polaroids (sección 2)
  footer-relleno.tsx  Dibujos de los laterales del footer (tarta, bola, botella, corcho y estrellas)
  star.tsx            Estrella SVG de N puntas
  smooth-scroll.tsx   Lenis sincronizado con ScrollTrigger
  theme-provider.tsx  Tema del andamiaje inicial
public/
  plan/               Ilustraciones de los cinco momentos de la sección 3, sin fondo
lib/
  datos-evento.ts     Marca, fecha, hora, lugar, ciudad, plazas y correo del evento
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

- **`Placeholder`** — hueco en blanco con el tamaño final de la imagen que irá ahí. Recibe ancho y alto (de los que saca la proporción), forma, tono del fondo y una etiqueta. Lleva un `data-slot` con nombre (`hero-novios`, `concepto-card-1`...) para sustituirlo después sin tocar el layout ni las animaciones. Ya no lo usa ninguna sección: todos los huecos tienen su imagen.
- **`Star`** — estrella SVG con el número de puntas que se le pida. Se usa la de ocho puntas en el marquee, las de 5 de los tickets (sección 4) y las de 4 de las cards, las dudas y el footer.
- **`Button`** — el de shadcn, con el tamaño `pill` añadido. Los botones de compra ya no lo usan: tienen su propio componente.
- **`BotonCompra`** (`components/boton-compra.tsx`) — botón de compra tipo ticket: cuerpo, línea discontinua en SVG y círculo con flecha. Opciones: `variante` (`oscura` sobre lila y marrón, `clara` sobre beige y verde), `tamano` (`grande` o `pequeno`) y `decoracion` (ramo al pasar el ratón y copas al hacer clic; solo header y footer). Todas las medidas van en `em`, así que el tamaño de letra escala el botón entero. Si no cabe en una línea, el texto se parte en dos en vez de desbordar. La especificación está en `noWeddingLanding-boton-compra.md`.
- **`SelloArrastra`** (`components/sello-arrastra.tsx`) — sello de lacre que hace de cursor sobre el marquee: cera, brillo, disco, aro, flor y texto circular. Solo pinta; lo anima la sección 1, que llega a sus piezas por los `data-sello` (`cera` y `texto`). La especificación está en `noWeddingLanding-sello-arrastra.md`.
- **`FondoCard`** (`components/fondo-card.tsx`) — fondo de cada card de la sección 1: número gigante, patrón y grano. Recibe el número; el tono oscuro le llega por la variable `--oscuro` de la card.
- **`escenas`** (`components/escenas-concepto.tsx`) — las tres escenas de las cards (sobre, regalo y bola). Cada una es un SVG con sus capas marcadas con `data-capa` y una función que devuelve su timeline en pausa. La especificación está en `noWeddingLanding-cards-seccion1.md`.
- **`escenasPolaroid`** (`components/escenas-polaroid.tsx`) — las seis escenas de las fotos de las polaroids. Cada una es un SVG de 300 × 300 con sus capas marcadas con `data-capa` y una función que devuelve su timeline en pausa. La especificación está en `noWeddingLanding-polaroids-escenas.md`.
- **`Polaroid`** (`components/polaroid.tsx`) — una polaroid de la sección 2: papel, detalles (manchas, arrugas, caligrafía, matasellos, sello de correos, borde rasgado, polaroid de debajo) y sujeción (celo, celo washi, chincheta o esquineros). Recibe el número, el pie de foto y un objeto `diseno` que dice qué lleva. Solo pinta; la mueve la sección. Exporta también las dos sombras (`SOMBRA` y `SOMBRA_HOVER`) para el hover. La especificación está en `noWeddingLanding-polaroids.md`.
- **Relleno del footer** (`components/footer-relleno.tsx`) — tarta, bola de discoteca, botella, trayecto del corcho, estrellas y anillos. Solo pintan; los anima el footer, que llega a sus piezas por los `data-footer`. Exporta también la función `meridianos()`, que dibuja las facetas de la bola girada un ángulo. La especificación está en `noWeddingLanding-footer-relleno.md`.
- **`SmoothScroll`** — se monta una vez en el layout. No pinta nada. Exporta `irA(ancla)` para bajar a un ancla a mano; lo usa el botón de compra cuando frena el clic para que brinden las copas.

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

Una única timeline al cargar. Cada paso lleva su segundo exacto como posición absoluta (`tl.from(..., 0.4)`), para poder mover uno sin descuadrar los demás. La especificación está en `noWeddingLanding-hero-entrada.md`, con los cambios de `noWeddingLanding-hero-relleno.md` (logo, ilustración de los novios y datos definitivos).

| Segundo | Qué pasa |
|---|---|
| 0,0 | Baja el header (`yPercent: -100`) |
| 0,2 | Se dibujan los anillos del logo (`drawSVG`, 0,6 s, el segundo 0,15 s después), el texto del logo sube desde una máscara y los enlaces del menú suben uno tras otro (`y: 12`, `autoAlpha: 0`, `stagger: 0.06`) |
| 0,4 | Botón "Comprar invitación": aparece el cuerpo y se dibuja la línea discontinua; a los 0,7 entra el texto y a los 0,85 salta el círculo de la flecha (`back.out(2)`) |
| 0,5 | "La boda del año": las letras pasan de `letter-spacing: 0.6em` a su sitio mientras aparecen |
| 0,6 | El titular entra línea a línea (`SplitText` por líneas con máscara, `yPercent: 100`, `stagger: 0.15`) |
| 1,1 | Los novios se dibujan a línea (`drawSVG`, 1,2 s, `stagger: 0.04`, `power2.inOut`); a los 1,4 sus rellenos pasan de `fill-opacity: 0` a 1 |
| 1,4 | Bloques inferiores en cascada (`y: 20`, `autoAlpha: 0`, `stagger: 0.08`): a la izquierda el párrafo línea a línea y luego el botón; a la derecha sus tres textos |
| 1,9 | Florece el ramo: cada flor crece desde su centro (`back.out(2.5)`, `stagger: 0.06`) |
| 2,0 | Saltan los "?" de las caras (`scale: 0`, `rotation: -20`, `back.out(2)`) |

Detalles:

- **La línea discontinua del botón** no se puede dibujar con DrawSVG. Igual que en las polaroids, `BotonCompra` lleva una `<mask>` con el mismo rectángulo en trazo continuo (`data-btn="trazo"`), y eso es lo que se dibuja. La timeline del hero llega a las piezas del botón por sus `data-btn`.
- **La línea de la fecha** tiene alto fijo, `white-space: nowrap` y `overflow: hidden`, y el texto va centrado con flex, así que al separarse las letras crece hacia los dos lados sin mover nada. Por debajo de 640 px puede ocupar dos renglones: ahí no se anima el espaciado, solo aparece.
- **El párrafo** se corta por líneas solo durante la entrada; al terminar se deshace el corte para que vuelva a ajustarse solo si cambia el ancho.
- El header va dentro del hero y se va con el scroll, así que si el navegador restaura la página a mitad no hay header a la vista que animar.

Para que no se vea el contenido un instante antes de que arranque la animación, los elementos con `data-hero` empiezan ocultos por CSS (solo si el usuario acepta animaciones) y la timeline los hace visibles al empezar.

La ilustración de los novios ocupa las filas 3 y 4 de la rejilla y se alinea abajo; así se apoya en el borde inferior del hero, justo bajo "se casa", sin `position: absolute`. Por eso el header, la etiqueta y el titular llevan la fila fijada a mano: sin ella, la colocación automática de la rejilla mandaba el titular debajo de los novios.

- **Logo.** Dos anillos entrelazados en SVG (verde, trazo de 3 px) y "**Boda** *ajena*" como texto real, sacado de `evento.marca`. Es un enlace a `#inicio` con `aria-label`.
- **Hover del header.** Los enlaces del menú llevan una línea fina (`::after`) que crece desde la izquierda al pasar el ratón o recibir el foco y se recoge hacia la derecha al salir: se cambia el `transform-origin` en el hover. En el logo, una timeline en pausa gira los anillos 180° (son simétricos, así que acaban como empezaron) y aparta el texto 3 px; al salir se reproduce al revés. También con el foco del teclado; sin animaciones no hay giro.
- **Ilustración** (`components/novios-hero.tsx`). Dibujo a línea con el mismo estilo que los novios del footer, calcado del boceto: trazo beige de 4 px (3 en los detalles), relleno lila para tapar lo de detrás, pajarita verde y ramo de cinco flores. Va por delante del titular (`z-10`) y mide `clamp(300px, 26vw, 560px)`; en móvil, 300 px encima de los bloques de texto. Lleva `role="img"` y `aria-label`.
- **Dibujo y relleno.** Lo que se dibuja lleva `data-trazo`. DrawSVG anima el trazo y no el relleno, así que los rellenos empiezan con `fill-opacity: 0` y aparecen cuando la línea ya va por la mitad.
- **Bucles** (empiezan al terminar la entrada y se pausan con el hero fuera de pantalla). Los "?" flotan (`y` y `rotation` de -6 a 6, 3 s); el segundo va 1,5 s por detrás y espera ya en un extremo para no dar un salto al empezar. Los novios se mecen ±1,5° desde su base y en sentidos contrarios, como si se acercaran y se separaran. Cada flor sube y baja 2 px con su propia duración, entre 1,6 y 2,4 s.
- **Profundidad con el ratón.** Solo desde 1024 px y con ratón: titular 4 px, novios 10 px y "?" 14 px (van dentro de los novios y suman 4 a sus 10). La profundidad mueve el contenedor y los bucles, el dibujo de dentro.
- **Movimiento reducido.** Los novios aparecen ya dibujados con un fundido; sin bucles ni profundidad.

### Datos del evento

Marca, fecha, hora, lugar, ciudad, plazas y correo están en `lib/datos-evento.ts` (objeto `evento`) y los importan el hero, el orden del día (hora de la ceremonia), las invitaciones, las dudas (correo) y el footer. Se cambian en un solo sitio.

### Sección 1

- **Marquee.** Dos frases cortas que se alternan, "Boda sin compromiso" y "¡Vivan los novios!", separadas por una estrella de ocho puntas (especificación en `noWeddingLanding-marquee.md`). Una pista con tres copias de la pareja se mueve un tercio de su ancho (`xPercent: -100 / 3`) en bucle con `ease: "none"`. Al usar porcentaje, no hay que recalcular nada al cambiar el texto ni el ancho de la ventana.
- **Estrellas del marquee.** Tres capas: giran siempre (una sola animación para todas, 8 s por vuelta); al arrastrar, la velocidad del giro sigue a la del arrastre (`InertiaPlugin.getVelocity()` ajusta el `timeScale()` entre 1 y 6, en negativo si se arrastra hacia atrás) y al soltar vuelve a la normal; y cada una late (`scale: 1.25`) al cruzar el centro de la pantalla. El giro arranca con el reloj adelantado, porque una animación en bucle no puede retroceder más allá de su inicio.
- **Exclamaciones del marquee.** "¡" y "!" van en su propio `<span>` y dan un brinco en bucle (suben girando y caen con `bounce.out`), primero la que abre y 0,18 s después la que cierra. Mismo tono que los "?" del hero.
- **Sin animaciones**, el marquee muestra la pareja de frases una sola vez, centrada y en letra más pequeña, con clases `motion-reduce:`.
- **Arrastre.** `Draggable` sobre un elemento invisible, con inercia. Al arrastrar se pausa el bucle y se mueve su progreso; al soltar, sigue solo. Solo a partir de 768 px.
- **Sello "Arrastra".** Sustituye al círculo marrón. Es un sello de lacre fijo que sigue al ratón con `gsap.quickTo()` y oculta el cursor del sistema sobre el marquee (`cursor: "none"` en el `Draggable`). Solo con ratón (`(hover: hover) and (pointer: fine)`).
  - **Entrada y salida.** Estampa al entrar (`scale` de 1.4 a 1, `back.out(3)`) y se encoge al salir (`scale: 0`, `power2.in`), con `overwrite: "auto"` para que entrar y salir deprisa no lo deje a medias.
  - **Texto circular.** Entra en el mismo tween de giro que las estrellas, así que comparte su `timeScale()` y giran siempre a la vez. La flor no gira.
  - **Al pulsar.** Un tween en pausa encoge la cera (`scale: 0.9`); al soltar se reproduce al revés.
  - **Inclinación.** Mientras se arrastra, una función en el ticker lee `InertiaPlugin.getVelocity()` y gira el sello entre -20° y 20° con `quickTo`; con el ratón quieto la velocidad cae a cero y se endereza.
  - **Tres capas, tres transformaciones.** El sello lleva posición, inclinación y la escala de entrada; la cera, la escala del pulsado; el texto, el giro. Así no se pisan.
  - **Fuera del marquee.** El movimiento se escucha en la ventana, porque `Draggable` sigue al ratón aunque salga de la franja: el sello va con él y se quita al soltar. Con el ratón quieto, el scroll no lanza `mouseenter` ni `mouseleave`, así que en cada evento de scroll se comprueba si el puntero sigue sobre el marquee.
- **Párrafo.** `SplitText` por palabras; la opacidad pasa de 0.25 a 1 con `ScrollTrigger` y `scrub`.
- **Texto de las cards.** Cada card tiene, bajo el título, una frase de entrada en cursiva de titulares, un párrafo que la explica y tres datos cortos en mayúsculas separados por estrellas de cuatro puntas ("Solo · En pareja · Con amigos", "Sin sobre · Sin lista · Sin quedar bien", "Comer · Brindar · Bailar"). Están en el array `cards` (`entrada`, `descripcion` y `datos`). Ocupan el hueco libre de la izquierda, así que en escritorio la card no crece. Como en el ticket "Invitado", la card verde lleva más peso (frase 500, párrafo 600 y datos 800), porque el marrón sobre verde contrasta menos; cada card declara sus pesos en `pesos`.
- **Cards apiladas.** Solo CSS: `position: sticky` con un `top` distinto por card. La altura de la franja visible (`--franja`) y el primer tope (`--tope`) son variables, más pequeñas en móvil.
- **Fondo de las cards.** Tres capas detrás del contenido (`FondoCard`): el número gigante en el tono oscuro de la card, que asoma 24 px dentro de la franja visible; un patrón de anillos, estrellas y flores (un `<pattern>` SVG en `currentColor` al 7 %); y el grano, un `feTurbulence` en una imagen de fondo con `mix-blend-mode: overlay` (clase `.grano`). Tamaños y posiciones van en `cqw`, así que el fondo escala con la card.
- **Recorte del fondo.** El `overflow: hidden` va en la capa del fondo, que hereda el radio de la card, y no en la card. La card lleva `isolate` y el fondo `-z-10` para que quede detrás del contenido sin salirse de ella.
- **Escenas de las cards.** Tres SVG de 500 × 330 dentro del hueco: el sobre que se abre solo, la caja de regalo de la que solo sale una estrella y la bola de discoteca. Las dos primeras son una timeline con `repeat: -1` y `repeatDelay: 2`; la bola es continua.
- **Cuándo se reproducen.** Un `ScrollTrigger` por card, de su tope fijo al de la siguiente (la última, hasta el final de la sección); `onToggle` hace `play()` o `pause()`. El tope se lee del `top` calculado de la card, así que vale para escritorio y móvil sin repetir los números.
- **Solapa del sobre.** Son dos piezas: la de fuera se pliega con `scaleY` hasta el borde del sobre y ahí la releva la de dentro, que está por detrás de la invitación. Una sola pieza no puede estar delante del sobre cerrada y detrás de la invitación abierta.
- **Sello partido.** El mismo dibujo dos veces, cada uno con un `clipPath` de media grieta. El recorte se mueve con su grupo.
- **Facetas de la bola.** Una rejilla cuyo brillo se repite cada cuatro columnas; se desplaza ese tramo en bucle dentro de un `clipPath` circular y da la sensación de giro.
- **Movimiento reducido en las cards.** Cada timeline tiene una etiqueta `fijo` y se deja en pausa ahí: la invitación fuera, la caja abierta con la estrella y la bola quieta.
- **Salida de la pila.** Cada card lleva un margen inferior de tantas franjas como cards tiene encima. Sin él, la tercera card se soltaba antes que las otras y tapaba sus títulos al salir de la sección.
- **`overflow: hidden`** va solo en el contenedor del marquee. En la sección rompería el `sticky` de las cards.

### Sección 2

- **Etiqueta y titular.** La misma animación que el párrafo de la sección 1: `SplitText` por palabras sobre los dos textos a la vez y la opacidad de 0.25 a 1 con `ScrollTrigger` y `scrub`, de modo que se encienden seguidos, primero "Los novios" y luego el titular.
- **Mesa.** Las seis polaroids, la línea y los años van en un bloque cuadrado y se colocan en porcentajes, así que todo escala junto.
- **Diseño de las polaroids.** Papel crema o kraft envejecido, cada una con una combinación distinta de detalles y de sujeción, definida en el array `polaroids` de la sección (objeto `diseno`). Miden 340 × 430 con la foto de 300 × 300.
- **Dibujos en SVG sobre un lienzo de 340 × 430.** Cada polaroid lleva tres SVG con el mismo `viewBox`, que escalan con ella sin media queries: uno bajo la foto (manchas, arrugas y caligrafía), otro encima (matasellos, sello de correos y contorno rasgado) y otro fuera del papel, con `overflow: visible`, para la sujeción que sobresale por arriba. La foto, el pie y los bordes envejecidos son HTML medido en `cqw`.
- **Manchas sin `blur`.** Son elipses rellenas con un degradado radial que se desvanece: se ven difuminadas sin pagar un filtro en vivo mientras la polaroid se mueve.
- **Borde rasgado.** Un `clip-path: polygon()` calculado al cargar el módulo: se recorre el contorno cada 10 px y cada punto se mete hacia dentro entre 0,5 y 5 px según una función fija de su posición, así el servidor y el navegador obtienen el mismo dibujo. El mismo polígono se pinta como contorno fino.
- **Sombra aparte.** La sombra de cada polaroid es un elemento propio detrás del papel (`data-polaroid="sombra"`), porque el `clip-path` del borde rasgado recortaría un `box-shadow` puesto en el papel. Es la que crece en el hover.
- **Sello de correos perforado.** Un rectángulo beige y, encima, el mismo rectángulo solo con trazo de puntos redondos (`stroke-dasharray: 0 7.125` con `stroke-linecap: round`) del color del papel, que llega por la variable `--papel`: los puntos muerden el borde.
- **Grano.** La clase `.grano` de las cards de la sección 1, sobre cada papel y, al 12 %, sobre el fondo de la sección.
- **Pista y ventana.** La mesa va dentro de una ventana a pantalla completa con `position: sticky`, y esta dentro de una pista de 650svh: mientras se recorre la pista, la ventana no se mueve. Las dos van fuera del `.contenedor` para que las fotos entren y salgan por los bordes de la pantalla y no por un corte invisible a 1368 px.
- **Tamaño de la mesa.** La ventana es un contenedor de tamaño (`container-type: size`) y la mesa mide `min(200cqh, 260cqw)`: una polaroid ocupa unos tres quintos del alto de la ventana a cualquier tamaño de pantalla.
- **Cámara.** La esquina de la mesa se coloca en el centro de la ventana y una timeline con `scrub` la desplaza con `xPercent` e `yPercent` hasta dejar centrada cada polaroid, en el orden de la línea (1 → 2 → 3, baja, 4 → 5 → 6). Al ir en porcentaje de la propia mesa, no hay que recalcular nada al cambiar el ancho. El efecto copia el componente Polaroid Scroll de Framer.
- **Ritmo.** Cada salto dura 1 y cada parada sobre una foto `PAUSA` (0.45), con `sine.inOut` para arrancar y frenar despacio. `scrub: 1.5` (constante `SUAVIDAD`) hace que la animación tarde segundo y medio en alcanzar al scroll. El alto de la pista decide cuánto scroll ocupa todo.
- **Aparición.** Al empezar solo existe la primera polaroid, que aparece con un fundido (`autoAlpha` e `y`, en un `ScrollTrigger` propio) mientras la ventana sube a su sitio. Las demás están ocultas (`autoAlpha: 0`, al 80 % e inclinadas) y cada una aparece cuando la línea llega a su borde: a los 0.75 del salto (`LLEGADA`) empieza a hacerse visible, a enderezarse y a crecer, y termina (`APARICION`, 0.5) ya dentro de la parada. Así la línea se ve llegar hasta el sitio de la foto antes de que esta la tape.
- **Al dejarla atrás.** La polaroid de la que sale la cámara sigue visible, pero se inclina el triple de su giro y se queda al 90 %.
- **Línea de tiempo.** Un único `path` de puntos, siempre visible, tapado por una máscara SVG. La máscara tiene un tramo continuo por cada salto, y lo que se anima con `DrawSVGPlugin` son esos tramos, a la vez que viaja la cámara y hasta el centro de la polaroid siguiente: DrawSVG no dibuja bien una línea discontinua. La etiqueta de año salta a mitad de cada salto.
- **Dos capas por polaroid.** La exterior (`<figure>`) la mueve el scroll; la interior (la pieza que pinta `Polaroid`, con su sujeción y la polaroid de debajo) es el `Draggable` y recibe el hover. Si los dos animaran el mismo elemento se pisarían, porque ambos escriben en `transform`.
- **Arrastre y hover.** Solo a partir de 768 px. Al pulsar una foto sube por encima de las demás; al pasar el ratón crece un 5 % y gana sombra. Cada foto puede alejarse de su sitio un tercio del ancho de la mesa: el límite es un objeto (`minX`, `maxX`...) y no un elemento, porque `Draggable` mete dentro del elemento límite todo lo que crea, y habría traído a la ventana las fotos que están fuera de pantalla.
- **Botón "Recolocar".** Fijo abajo en el centro de la ventana. Está oculto y asoma (`autoAlpha` e `y`) en el primer `onDragStart`. Al pulsarlo corta la inercia que quede (`killTweensOf`), devuelve todos los marcos a `x: 0, y: 0` con un pequeño `stagger`, restablece los `z-index` y se vuelve a ocultar. Con `visibility: hidden` tampoco se llega a él con el tabulador. Usa el lenguaje del botón de compra (esquinas de 4 px, línea discontinua interior, mayúsculas espaciadas) en pequeño y con el fondo beige al 80 %.
- **Escenas de las fotos.** Cada foto es una escena dibujada a línea con los novios en monigote (cabeza con "?", pajarita verde él, moño ella), copiada del SVG `polaroids-escenas.svg`: la lluvia bajo el paraguas, el cine, el paseo de noche, el perro, la pedida con fuegos artificiales y la «boda» bajo el arco. `Polaroid` las recibe como `children` y las recorta con `overflow: hidden`, también al arrastrar. Las figuras no se mueven; se anima el fondo.
- **Animaciones de cada escena.** Lluvia en mosaico sin cortes y ondas en el charco; parpadeo del proyector (con `repeatRefresh`, cada vuelta distinta), brillo de la pantalla y palomitas que saltan; estrellas que titilan, farola que late y luna que flota; cola del perro, corazones que suben y pelota que bota y se aplasta; fuegos artificiales dibujados con `drawSVG` y destello del anillo; confeti que cae girando y flores del arco que se mecen.
- **Lluvia sin cortes.** El grupo de gotas se repite como un mosaico: 300 px a la derecha y, en la fila de arriba, 128 px más a la derecha (la inclinación de las gotas). Todo baja un tramo (`x: "-=128"`, `y: "+=300"`) en bucle; al repetirse, cada copia ocupa el sitio de otra. Con solo la copia de arriba que proponía la especificación quedaban huecos en las esquinas a mitad del tramo, así que son cuatro copias.
- **Confeti a media caída.** Cada trozo empieza en un punto distinto de su caída: se coloca en la timeline de la escena entre los segundos 0 y 5, y la timeline arranca adelantada a los 5 (`seek`). Cada trozo va en su grupo, para que su giro dibujado y el de la caída no se pisen.
- **Fuegos.** Cada rayo sale del centro (`drawSVG: "0% 100%"`) y se aleja hasta desaparecer (`"100% 100%"`); al acabar se ocultan, porque con largo cero las puntas redondas dejaban un anillo de puntos.
- **Cuándo se mueven.** Cada escena se reproduce solo si su polaroid ya ha caído y está en pantalla. La caída la marca un `call` en la timeline de la cámara, al terminar de aparecer la foto, que mira la dirección del scroll; la primera, el `onLeave` de su fundido. La pantalla se vigila con un `IntersectionObserver` (`threshold: 0.2`) y no con `ScrollTrigger`, porque las fotos se arrastran y cambian de sitio. En móvil, igual, con un `call` al terminar de subir cada foto.
- **Hover.** Al pasar el ratón por una foto, su escena se acelera (`timeScale` a 1,6) y vuelve a 1 al salir.
- **Movimiento reducido.** No se crea ninguna timeline: las escenas se ven quietas, en su primer fotograma.
- **Móvil.** Una sola columna en zigzag con una línea recta de puntos que se descubre con `clip-path`. Las fotos suben con un fundido (`y: 60`, `power2.out`) y el mismo `scrub: 1.5`.
- **Movimiento reducido.** No hay pista ni ventana (sus clases llevan `motion-safe:`): la mesa cuadrada se ve entera, del ancho del contenedor, y no se puede arrastrar.

### Sección 3

- **Datos.** Los cinco momentos están en un array (`momentos`); el HTML, la barra de progreso y la timeline salen de él.
- **Pantalla fija.** `ScrollTrigger` con `pin` y `scrub`; la sección dura una pantalla de scroll por cada transición.
- **Contenido superpuesto.** Todos los momentos ocupan la misma celda de rejilla y solo se ve el actual, de modo que el layout no salta al cambiar.
- **Hora.** Cada carácter es una celda con `overflow: hidden`; el dígito viejo sube y el nuevo entra desde abajo. Si un dígito no cambia entre dos momentos (el "1" de 15:30 a 17:00), no se anima. Cada celda mide lo que su dígito actual y su ancho se anima con él: si reservara el ancho del más grande, el "1" quedaría separado del resto.
- **Nombre y contador.** El mismo movimiento vertical que la hora, dentro de una máscara.
- **Frase.** Fundido cruzado con un poco de desplazamiento.
- **Imagen.** La que sale se va a la izquierda girando y desvaneciéndose; la que entra llega desde fuera de la pantalla por la derecha (`x: "60vw"`, en unidades de ventana para que ninguna forma asome antes de tiempo, por estrecha que sea).
- **Ilustraciones.** Cada momento tiene su ilustración (la pareja bajo el arco, la mesa del banquete, el micrófono con el cartel de «no», la tarta y el baile), en `public/plan/`. Se importan de forma estática, así que `next/image` conoce su ancho y alto, y el hueco usa esa proporción: `width: min(100cqw, 100cqh * ancho / alto)`.
- **Sin fondo y con la paleta de la landing.** Las originales eran dibujos claros sobre un morado oscuro. Un script con el lienzo del navegador las pasó a PNG con transparencia: cada píxel es más transparente cuanto más se parece al fondo, y su color se cambia por el de la paleta según su tipo (claro, verde o rojizo). Sobre lila y marrón el dibujo queda en beige, verde y rosa; sobre verde (Discursos) y beige (Tarta), en lila y marrón, para que se lea. La tarta va en verde, como su hueco anterior. Lo que tocaba el borde de la imagen se desvanece en vez de quedar cortado, y cada una se recortó a su contenido.
- **Botón de compra.** Solo existe en el último momento: aparece con un fundido junto a la frase de "Baile". El hueco se ajusta al espacio disponible con unidades de contenedor (`cqw` y `cqh`), para no desbordarse en pantallas bajas.
- **Fondo y texto.** Se anima el `backgroundColor` y el `color` del escenario a la vez. La etiqueta superior tiene su propio color (`acento`): verde sobre los fondos oscuros y marrón sobre los claros.
- **Progreso.** El relleno crece con `scaleX` desde la izquierda; el punto y el nombre activos cambian de tamaño y opacidad. La rejilla de la barra tiene cuatro tramos iguales y una última columna del ancho de la etiqueta final (`grid-cols-[repeat(4,1fr)_auto]`): la línea y su relleno ocupan los cuatro tramos y acaban en el punto del último momento, cuya etiqueta llega al borde derecho del contenedor. La lista hereda esas columnas con `subgrid`. Cada transición suma al relleno 1 / (momentos − 1).
- **Móvil y movimiento reducido.** No se fija nada: los momentos se apilan en vertical, cada uno con su color, y no hay barra de progreso.

### Sección 4

- **Datos.** Los tres tickets están en un array con sus textos, colores y el lugar que ocupan en la tira.
- **Tira.** Una rejilla de tres columnas sin separación. En móvil y tablet (por debajo de 1024 px) los tickets se apilan y "Familia" pasa a ser el primero con `order-first`.
- **Alturas alineadas con `subgrid`.** La tira define seis filas (serie, nombre, frase, precio, lista y botón) y cada ticket las hereda con `grid-template-rows: subgrid`. Aunque una frase ocupe dos líneas en un ticket, los precios y los botones de los tres quedan a la misma altura.
- **Muescas y borde dentado.** Se recortan con máscaras CSS (`mask-image` con varios `radial-gradient` y `mask-composite: intersect`), definidas en la clase `.ticket` de `globals.css`. Cada ticket lleva `data-movil` y `data-escritorio` con su posición (`inicio`, `medio` o `fin`), y la máscara cambia con ella: dentado en los extremos de la tira y un cuarto de círculo en cada esquina que toca a otro ticket. Al ser parte del propio ticket, las muescas se mueven con él en el hover.
- **Líneas de corte.** Cada una es un elemento propio con borde discontinuo, pegado al canto de un ticket, para poder dibujarlas en la entrada. En la tira las llevan Invitado (a su derecha) y Mesa presidencial (a su izquierda), que entran antes que Familia; al apilar, Familia e Invitado (debajo).
- **Texto que escala con el ticket.** El nombre y el precio se miden en `cqw`, con un tope en `rem`, para que "Mesa presidencial" quepa en una línea a cualquier ancho.
- **Peso del texto en "Invitado".** Marrón sobre verde contrasta menos que beige sobre lila o marrón, así que ese ticket lleva la frase, la lista y "por persona" en negrita (700) y la serie y la matriz en 800. Cada ticket declara sus clases de peso (`texto` y `etiqueta`) en el array.
- **Matriz.** El texto vertical usa `writing-mode: vertical-rl` girado 180°.
- **Textos.** La cabecera (etiqueta, titular y dato de plazas, seguidos) lleva la misma animación que en las secciones 1 y 2: `SplitText` por palabras y opacidad de 0.25 a 1 con `scrub`. La nota final no se anima.
- **Entrada.** Una timeline que se reproduce una sola vez (`ScrollTrigger` con `once: true`, al llegar la tira al 75 % de la pantalla), con el segundo exacto de cada paso, como en el hero. La especificación está en `noWeddingLanding-invitaciones-animacion.md`.

| Segundo | Qué pasa |
|---|---|
| 0,0 | Invitado entra desde la izquierda y Mesa presidencial desde la derecha (`x: ∓60`, `autoAlpha`, `power3.out`) |
| 0,4 | Se dibujan las dos líneas de corte (`scaleY` desde arriba) y se abren las muescas |
| 0,5 | Familia aparece en el hueco del centro (`y: 30`, `scale: 0.96`) |
| 0,9 | "La más pedida" cae como un sello (`scale: 1.6 → 1`, `rotation: -12 → -3`, `back.out(3)`) |
| 1,0 | Los precios cuentan desde 0 |

- **Muescas.** Son agujeros de la máscara del ticket, no elementos, así que no se pueden escalar: se anima su radio, la variable `--m` que usa la máscara, de `0px` a su valor. Al terminar se quita la variable en línea para que vuelva a mandar el CSS.
- **Precios que cuentan.** Se anima un objeto (`{ valor: 0 }`) con `snap: { valor: 1 }` y en `onUpdate` se escribe en el número. El "€" va fuera de ese número, que mientras cuenta tiene el ancho fijo de su cifra final, para que nada se mueva. El HTML lleva siempre el precio final (y un texto solo para lectores de pantalla): el número se pone a cero al arrancar la timeline, con los tickets aún ocultos.
- **Estado inicial.** Los tickets esperan con `visibility: hidden` desde CSS (misma regla que `[data-hero]`), solo si el usuario acepta animaciones.
- **Brillo de Familia.** Una capa del tamaño del ticket con un degradado diagonal (110°, beige al 25 % en una franja de 120 px) y `mix-blend-mode: soft-light`, que cruza de `xPercent: -150` a `150` en 1,2 s y se repite cada 5 s. La máscara del ticket ya la recorta. Solo corre si se cumplen tres cosas a la vez: entrada terminada, sección en pantalla (`ScrollTrigger` con `onToggle`) y ratón fuera del ticket.
- **Al apilar (menos de 1024 px).** Familia aparece primero, se estampa la etiqueta y suben Invitado y Mesa presidencial; cada precio cuenta al aparecer su ticket y las líneas se dibujan con `scaleX`.
- **Movimiento reducido.** Los tres tickets aparecen con un fundido; la etiqueta ya está girada por CSS, los precios escritos y no hay brillo.
- **Hover.** El ticket sube 12 px y gira un grado. Solo con ratón y desde 1024 px, y solo cuando ha terminado la entrada.

### Sección 5

Rehecha entera: las preguntas son notas de papel sobre un tablero lila. La especificación está en `noWeddingLanding-dudas.md`.

- **Estructura.** Fondo lila con grano, un marco de línea fina a 24 px de los bordes con la etiqueta vertical "preguntas frecuentes" (solo desde 1024 px), cabecera centrada, rejilla de seis notas (3 columnas desde 1024 px, 2 desde 768 y 1 en móvil) y el botón "¿Otra duda? Escríbenos".
- **Cada nota.** Un `<li>` (la celda) con una hoja dentro. La pregunta es un `<h3>`. Solo el sello de abajo abre y cierra la nota: es un `<button>` con `aria-expanded` y `aria-controls`, y su `aria-label` une la acción y la pregunta ("Ver respuesta: ¿Puedo ir solo?") para que no haya seis botones con el mismo nombre. La respuesta es una región con `aria-labelledby`, en el HTML desde el principio y con `hidden`.
- **Crecer sin empujar.** Desde 768 px la celda mide 300 px fijos y la hoja va en `position: absolute` con `min-height: 100%`: al abrirse crece por encima de la nota de debajo (con más `z-index`) y la rejilla no se mueve. En móvil la hoja va en el flujo y sí empuja; al terminar se llama a `ScrollTrigger.refresh()`.
- **Dos capas, otra vez.** La celda recibe la caída de la entrada y el hover; la hoja, la inclinación y la escala al abrirse. Así no se pisan.
- **Entrada.** Una timeline que se reproduce una vez (`once: true`, sección al 70 %): el titular sube desde una máscara (`SplitText` con `mask: "lines"`), la línea crece desde el centro (`scaleX`), las notas caen en zigzag (orden 1, 3, 5, 2, 4, 6, con un giro inicial al azar entre -6° y 6° y `back.out(1.6)`), aparecen los sellos "Ver respuesta" y sube el botón. Lo que entra espera con `visibility: hidden` desde CSS.
- **Sellos de acción.** "Ver respuesta" y "Cerrar" son sellos de tinta lila (doble recuadro, mayúsculas espaciadas y una estrella de cuatro puntas a cada lado, algo torcidos), pintados por el componente `Sello` de la propia sección. Son las dos caras del botón de la nota. Las dos ocupan la misma celda de rejilla y se descubren de izquierda a derecha con `clip-path: inset(0 100% 0 0)` a `inset(0 0% 0 0)`; al abrir se borra uno y aparece el otro.
- **Abrir y cerrar.** Cada nota abierta tiene su timeline: la hoja se levanta e inclina (-2,5°, 2° o -2° según la columna), el clip cae y se engancha (`back.out(2.5)`), la respuesta crece (`height: 0` a `"auto"`) y aparece línea a línea. Cerrar es la misma timeline con `reverse()` y `timeScale(1.4)`. Solo hay una abierta: al abrir otra, la anterior se cierra.
- **La timeline se crea al abrir, no al cargar.** Un texto con `hidden` no se puede medir ni partir en líneas, así que la timeline y el `SplitText` se crean en el clic, con la respuesta ya visible, y se destruyen al terminar de cerrarse. Como nacen fuera del contexto de `matchMedia`, se deshacen a mano en su función de limpieza.
- **Estado.** React solo guarda qué nota está abierta, para `aria-expanded`. El atributo `hidden` de la respuesta lo quita y lo pone el código de la animación; React no lo pisa porque su valor en el JSX no cambia.
- **Clip.** Un SVG de un solo trazo dibujado a mano, en la esquina superior derecha de la hoja. La pregunta lleva margen derecho para que nunca lo tape.
- **Estrellas del sello.** Al pasar por él dan media vuelta (`rotation: "+=180"`).
- **Hover.** Al pasar por el sello, la nota cerrada sube 4 px y gira ±1°; la flecha del botón final sale y vuelve a entrar, como en el botón de compra. Solo con ratón, desde 768 px y con la entrada terminada.
- **Movimiento reducido.** Las notas aparecen con un fundido; al abrir, la respuesta, el clip y el sello "Cerrar" se muestran directamente.

### Footer

Rehecho entero: un cartel tipo *save the date* dibujado a línea, con los novios jugando con las letras, un hilo con corazón entre dos manos y una tira de fotomatón. La especificación está en `noWeddingLanding-footer.md`.

- **Estructura.** Fondo marrón con grano; cartel "NADIE / se / CASA!" con los novios, "? & ?" y la rúbrica; tira de fotomatón; zona del hilo con las dos manos; botón de compra con decoración; datos (correo, navegación con fecha y lugar) y fila legal. Va fuera de `<main>`, en un `<footer>`.
- **Tamaño.** Desde 768 px todo el footer de arriba (cartel, fotomatón, manos, hilo y márgenes) se mide con una sola variable, `--f: min(12.5vw, 19svh)`: depende también del alto de la pantalla, para que el botón de compra se vea al llegar al footer en cualquier portátil (comprobado a 1024 × 768, 1366 × 768, 1440 × 900 y 1920 × 1080).
- **Cartel.** Texto real en HTML, de tamaño `--f` (22vw en móvil). Los novios, "? & ?" y la rúbrica son hermanos del texto, no hijos: `SplitText` mete cada línea en una máscara y los habría recortado. Se colocan en `em` desde la variable `--tope`, que es la altura del borde superior de la N dentro de la caja (0,035em con `leading-[0.8]`, medida en el navegador con Boska). Así siguen pegados a la N y a la E a cualquier tamaño de letra. La novia va al 85 % del dibujo, sentada con el vestido sobre el borde de la N; su trazo se compensa para que no quede más fino que el del novio.
- **Dibujos.** Novia, novio, manos, hilo, corazón y rúbrica son SVG dibujados a mano en el propio componente, calcados del PNG del diseño: una unidad de sus `viewBox` es un píxel del diseño a 2000 px. Relleno marrón para tapar lo de detrás y trazo beige de 4,2 con puntas redondas.
- **Hilo en píxeles reales.** El SVG del hilo tiene como `viewBox` el tamaño de su zona y se mide con un `ResizeObserver`. Las manos son SVG propios pegados a los bordes (la derecha en espejo) y de su caja sale dónde sujeta el meñique. Cada mitad del hilo es una Bézier de la mano a la punta del corazón: sale de la mano hacia abajo y llega plana al corazón. El corazón es un grupo que se traslada a esa punta con `transform`. En móvil el hilo cuelga como mucho el 20 % de su tramo, para no ocupar tanto alto.
- **Fotomatón.** Desde 768 px va a la izquierda en vertical, girado 4°; en móvil pasa debajo del cartel, con las cuatro fotos en fila. Sus medidas van en `cqw`. El `@container` va en el envoltorio y no en la propia tira: el relleno de un contenedor en `cqw` se mide con el contenedor de fuera.
- **Entrada.** Una sola timeline (`ScrollTrigger` con `start: "top 70%"` y `once: true`), con el segundo exacto de cada paso:

| Segundo | Qué pasa |
|---|---|
| 0,0 | Las dos mitades del hilo se dibujan desde las manos (`drawSVG`, 1 s) |
| 0,2 | Aparecen las manos |
| 0,3 | Las letras suben una a una (`SplitText` por líneas y caracteres, máscara por líneas, `stagger: 0.03`) |
| 0,6 | Baja la tira del fotomatón (`y: -80`) |
| 0,8 | Se dibuja la rúbrica de "se" |
| 0,9 | Se dibuja el corazón y cada foto pasa de blanco a su color, una tras otra (`stagger: 0.2`): se "imprime" |
| 1,0 | La novia salta sobre la N (`y: -30`, `scale: 0.8`, `back.out(2)`) y aparece "? & ?" |
| 1,1 | El novio llega balanceándose (`rotation: 25 → 0` desde sus manos, `elastic.out(1, 0.4)`, 1,4 s) |
| 1,2 | El corazón late una vez |
| 1,6 | Suben el botón, los datos y la fila legal |

- **Detalles de la entrada.** La opacidad del novio va en un tween aparte: con el rebote elástico parpadearía. Al terminar de dibujarse el hilo se le quitan los restos de `drawSVG`, porque el hilo elástico cambia su largo.
- **Bucles.** Empiezan al terminar la entrada y se pausan con el footer fuera de pantalla (`onToggle`). El novio hace de péndulo (-4° a 4°, 2,4 s por lado), y arranca en su punto medio con `seek()` para no dar un salto. El corazón late dos veces seguidas cada 2,4 s. La novia brinda: el brazo y la copa giran desde el hombro (`svgOrigin`) y las chispas se apagan y vuelven a saltar; la espera entre brindis se sortea en cada vuelta (`onRepeat`) entre 3,5 y 5 s.
- **Hilo elástico.** Solo con ratón, desde 768 px y con la entrada terminada. Si el cursor está a menos de 160 px del hilo, el anclaje se desplaza hacia él (como mucho 120 px en horizontal y 60 en vertical) y el corazón gira un poco. Se anima un objeto proxy con dos parejas de `quickTo`: una sigue al cursor (`power3.out`, 0,5 s) y otra lo devuelve a su sitio con rebote (`elastic.out(1, 0.35)`, 1,2 s). Al cambiar de una a otra se pausa la que no toca. El `d` del hilo solo se recalcula en su `onUpdate`.
- **Profundidad.** Cartel, fotomatón y novios se alejan del cursor unos píxeles con `quickTo` (0,8 s). Los novios van dentro del cartel y suman los 6 px de él a sus 10: 16 en total. El hilo y las manos no se mueven.
- **Capas.** La profundidad mueve el envoltorio (`data-profundidad`) y la entrada y los bucles, el dibujo de dentro, así que no se pisan.
- **Movimiento reducido.** Todo aparece con un fundido, con el hilo ya dibujado; sin bucles ni interacciones.
- **Subrayado de los enlaces.** Solo CSS: un pseudoelemento `::after` que crece con `scale-x` de 0 a 1 desde la izquierda, al pasar el ratón y al recibir el foco.

#### Relleno de los laterales

Con Boska el cartel queda más estrecho de lo previsto y los lados del footer se veían vacíos. Se añaden una tarta, una bola de discoteca, una botella de champán cuyo corcho vuela hasta la copa de la novia, siete estrellas y dos parejas de anillos. La especificación está en `noWeddingLanding-footer-relleno.md`.

- **Posición.** Cada dibujo se coloca con `left` en porcentaje del ancho y `top` y ancho en múltiplos de `--f`, así escalan con el cartel. Las medidas se sacaron del boceto, donde el cartel medía 182 px: una distancia del boceto en `f` es esa distancia / 182.
- **Solo desde 768 px.** En móvil se ocultan todos: el cartel ocupa el ancho.
- **Bola de discoteca.** Las facetas verticales son medias elipses de polo a polo, cuya anchura depende de su ángulo (`r · sen θ`). Para que gire, un objeto proxy suma el mismo ángulo a todas, de 0 a 30° (la separación entre dos) en bucle, y en su `onUpdate` se recalcula el `d` de cada una. Al llegar a 30° el dibujo es igual que a 0°, así que el bucle no se nota. El cordel sube más allá del techo del footer, que lo recorta, y la bola se balancea desde ese punto del techo (`svgOrigin`).
- **Trayecto del corcho.** Va en un SVG del tamaño del footer, en píxeles reales, igual que el hilo. La boca de la botella y la copa de la novia se miden con `getBoundingClientRect()` en cada cambio de tamaño, de modo que el corcho termina en la copa a cualquier ancho (comprobado a 1024, 1366, 1919 y 2560 px). La copa se mide en la capa de profundidad de la novia y no en su dibujo, porque la entrada escala y desplaza el dibujo.
- **Línea de puntos.** Igual que en la sección 2: una máscara con el trazo continuo, que es lo que dibuja `DrawSVGPlugin`, descubre los puntos.
- **Vuelo.** `MotionPathPlugin` lleva el corcho por la misma curva (`align` al trazado), con la misma duración y curva de velocidad que el dibujo de la máscara, así la estela sigue al corcho. Mientras vuela no lo recoloca el `ResizeObserver`.
- **Primer brindis.** El brindis de la novia es una función que devuelve su timeline: la entrada añade uno a los 2 s, cuando llega el corcho, y el bucle repite otro.
- **Novios de la tarta.** El segundo va 0,9 s por detrás del primero, un cuarto de su vaivén, y espera ya inclinado a -6° para no dar un salto al empezar.
- **Profundidad.** Tarta, bola, botella y trayecto, 12 px; estrellas y anillos, 20 px.

| Segundo | Qué pasa |
|---|---|
| 1,0 | Aparecen la botella, la tarta, la bola, las estrellas y los anillos (`y: 20`, `back.out(1.6)`, `stagger: 0.1`) |
| 1,3 | El corcho sale de la botella girando hasta la copa (0,7 s) y su estela de puntos se dibuja a la vez; las gotas saltan y se desvanecen |
| 2,0 | La novia brinda |

### Conceptos de código nuevos en las secciones 2 y 3

Lo que aparece por primera vez en estas dos secciones, explicado con el trozo de código donde se usa.

#### `gsap.matchMedia()` con varias condiciones

En vez de una sola media query, se le pasa un objeto con nombre para cada una. La función se ejecuta cuando cambia cualquiera, y dentro se consulta cuáles se cumplen:

```ts
mm.add(
  {
    animado: "(prefers-reduced-motion: no-preference)",
    escritorio: "(min-width: 768px)",
  },
  (context) => {
    const { animado, escritorio } = context.conditions!
    if (!animado) return        // sin animaciones: todo queda en su estado final
    // ...animaciones comunes...
    if (!escritorio) return     // lo de abajo solo en escritorio
    // ...arrastre y hover...
  }
)
```

Si la función devuelve otra función, GSAP la llama al deshacer ese bloque. Ahí se quitan los `addEventListener`, que GSAP no conoce.

#### Timeline con `scrub`

Una timeline normal avanza con el tiempo. Con `scrollTrigger: { scrub: true }` avanza con el scroll: su progreso (de 0 a 1) es la posición del scroll entre `start` y `end`. Las duraciones dejan de ser segundos y pasan a ser proporciones: un tween de duración 1 ocupa el doble de scroll que uno de 0.5.

```ts
scrollTrigger: {
  trigger: pista,
  start: "top top",        // empieza cuando el borde superior de la pista llega al de la ventana
  end: "bottom bottom",    // termina cuando su borde inferior toca el de la ventana
  scrub: 1.5,              // con un número, la animación tarda esos segundos en alcanzar al scroll
}
```

Con `scrub: true` la animación va pegada al scroll; con un número lo sigue con retraso y el movimiento sale más suave.

#### Parámetro de posición de la timeline

El último argumento de `tl.to()`, `tl.from()` o `tl.fromTo()` dice cuándo empieza ese tween:

- sin nada: al terminar el anterior;
- un número (`t`): en ese instante exacto de la timeline;
- `"<0.3"`: 0.3 después del **inicio** del tween anterior.

En la sección 3, todos los tweens de una transición llevan la misma `t` para que ocurran a la vez.

#### `from`, `to` y `fromTo`

- `to`: del estado actual al que se indica.
- `from`: del estado que se indica al actual. GSAP coloca el elemento en el estado inicial nada más crear el tween; por eso las etiquetas de año están ocultas antes de hacer scroll.
- `fromTo`: se fijan los dos extremos. Se usa cuando el estado de partida no es el del CSS, como la imagen que entra desde `xPercent: 120`.

`autoAlpha` es `opacity` más `visibility`: al llegar a 0 pone `visibility: hidden`, y el elemento deja de recibir clics.

#### Dibujar una línea de puntos con una máscara SVG

`DrawSVGPlugin` dibuja un trazo animando su `stroke-dasharray`, que es la misma propiedad que hace la línea discontinua, así que no puede animar una línea de puntos directamente. La solución tiene dos piezas:

```tsx
<mask id="novios-mascara" maskUnits="userSpaceOnUse" ...>
  {/* trazo continuo: esto es lo que se anima */}
  <path data-novios="tramo" d={tramo} stroke="white" strokeWidth="12" />
</mask>
{/* línea de puntos: no se toca */}
<path d={linea} mask="url(#novios-mascara)" strokeDasharray="18 14" />
```

En una máscara, lo blanco deja ver y lo demás tapa. Al ir dibujando el trazo blanco, se va descubriendo la línea de puntos que hay debajo.

#### Dos capas para dos animaciones sobre `transform`

El scroll (el giro y la escala de la polaroid) y el arrastre escriben los dos en `transform`. Sobre el mismo elemento, el último en escribir borraría al otro. Cada polaroid tiene por eso dos elementos:

```tsx
<figure data-novios="polaroid">   {/* la anima la timeline del scroll */}
  <div>...</div>                  {/* es el Draggable y recibe el hover */}
</figure>
```

Los transforms de padre e hijo se suman, así que una foto arrastrada sigue donde se dejó aunque el scroll mueva a su padre.

#### `Draggable`

```ts
Draggable.create(marco, {
  type: "x,y",            // se mueve en los dos ejes
  bounds: { minX: -radio, maxX: radio, minY: -radio, maxY: radio },  // hasta dónde se aleja de su sitio
  inertia: true,          // al soltar sigue un poco (InertiaPlugin)
  zIndexBoost: false,     // el z-index se gestiona a mano...
  onPress: () => gsap.set(foto, { zIndex: ++altura }),  // ...en la capa exterior
  onDragStart: () => asomar.play(),  // enseña el botón "Recolocar"
})
```

El `z-index` se sube en la capa exterior porque es ella la que compite con las otras polaroids; subirlo en la interior no tendría efecto fuera de su padre.

#### Posiciones con variables CSS y unidades de contenedor

Cada polaroid recibe su posición como variables en `style`, y la clase solo las aplica desde 768 px. En móvil no afectan y la foto queda en la columna:

```tsx
style={{ "--x": "33.91%", "--y": "16.67%" }}
className="relative md:absolute md:top-(--y) md:left-(--x)"
```

Dentro de la polaroid, los márgenes y el pie de foto se miden en `cqw` (el 1 % del ancho del contenedor más cercano marcado con `@container`). La polaroid entera escala como una imagen, sin media queries.

En la sección 3 se usa también `cqh` (alto del contenedor) para que el hueco de imagen quepa tanto a lo ancho como a lo alto: `width: min(100cqw, 100cqh * proporción)`.

#### Sección fija con `pin`

```ts
scrollTrigger: {
  trigger: escenario,
  pin: true,                                  // el elemento se queda quieto en pantalla
  scrub: true,
  end: `+=${(momentos.length - 1) * 100}%`,   // una pantalla de scroll por transición
}
```

`pin` añade debajo el espacio necesario para que el resto de la página no se monte encima. Por eso los `ScrollTrigger` deben crearse en el orden de la página: cada uno necesita saber cuánto espacio han añadido los anteriores.

#### Superponer contenido en la misma celda de rejilla

Los nombres, horas, frases e imágenes de todos los momentos ocupan el mismo sitio. En vez de `position: absolute`, se colocan todos en la misma celda:

```tsx
<p className="grid overflow-hidden">
  <span className="col-start-1 row-start-1">Ceremonia</span>
  <span className="invisible col-start-1 row-start-1">Banquete</span>
</p>
```

La celda mide lo que el mayor de sus hijos, así que el layout no salta al cambiar de momento. El `overflow: hidden` del padre hace de máscara: el texto que sube o baja desaparece al salir de él.

#### Contador rodante (odómetro)

La hora se parte en cinco celdas, una por carácter. Cada celda apila el carácter de cada momento, y al cambiar se mueve el viejo hacia arriba y el nuevo desde abajo:

```ts
const rodar = (sale, entra, t) =>
  tl.to(sale, { yPercent: -100 }, t)
    .fromTo(entra, { yPercent: 100 }, { yPercent: 0 }, t)
```

`yPercent` es un porcentaje del alto del propio elemento: ±100 lo saca justo fuera de su celda. Si un carácter es igual en los dos momentos, se salta.

#### Generar la animación desde un array

La sección 3 no escribe cada transición a mano. Los momentos son datos y un bucle crea la transición de cada uno al siguiente:

```ts
for (let i = 0; i < momentos.length - 1; i++) {
  // transición del momento i al i + 1, colocada en el instante i de la timeline
}
```

El mismo array pinta el HTML con `.map()`. Añadir un momento es añadir un objeto.

#### Animar una transformación que ya tiene una clase

Tailwind 4 escribe `rotate-[1.2deg]`, `scale-x-0` o `-translate-x-1/2` en las propiedades CSS `rotate`, `scale` y `translate`, no en `transform`. La primera vez que GSAP toca un elemento, lee esas tres propiedades, las incorpora a su propio `transform` y las deja en `none`. Desde ese momento solo cuenta lo que diga GSAP. Consecuencias:

- la clase sirve como estado inicial, pero no se suma a la animación. La etiqueta "La más pedida" tiene la clase `-rotate-3`; para que quede girada tras estamparse hay que animar `rotation` de -12 a -3. Animar hasta 0 la dejaría recta;
- un valor en porcentaje (`-translate-1/2`) queda convertido a píxeles en ese momento. Vale para elementos de tamaño fijo, como las etiquetas de año;
- cuando el valor de partida importa, es más claro ponerlo donde GSAP lo va a escribir: el relleno de la barra de progreso parte de `style={{ transform: "scaleX(0)" }}`.

#### Variante `motion-safe` de Tailwind

`md:motion-safe:flex` aplica la clase solo desde 768 px **y** si el usuario no ha pedido reducir el movimiento. Con eso se elige por CSS, sin JavaScript, entre la versión fija de la sección 3 y la apilada.

#### Fuentes con `next/font`

```ts
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })

const boska = localFont({
  src: [
    { path: "./fonts/Boska-Variable.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/Boska-VariableItalic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-boska",
  adjustFontFallback: "Times New Roman",
})
```

Caveat viene de Google Fonts: Next la descarga al compilar y la sirve desde el propio sitio, así que el navegador no llama a Google. Boska es un archivo local (`app/fonts/`) con `next/font/local`; al ser variable, un solo archivo cubre todos los pesos de 200 a 900. `adjustFontFallback` ajusta las métricas de la fuente de reserva para que el texto no salte al terminar de cargar Boska. `variable` expone cada fuente como variable CSS, que `globals.css` recoge en `--font-display`, `--font-body` y `--font-manuscrita`.

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

| Variable | Fuente | Uso |
|---|---|---|
| `--font-display` | Boska (local, vía `next/font/local`) | Titulares |
| `--font-body` | Boska | Resto de textos |
| `--font-manuscrita` | Caveat (Google Fonts, vía `next/font`) | Pies de foto y caligrafía de las polaroids; etiqueta vertical de las dudas |

Georgia queda solo como fuente de reserva mientras carga Boska. Todos los componentes usan las clases `font-display`, `font-body` y `font-manuscrita`, nunca una familia escrita a mano, así que la fuente se cambia en un solo sitio (`app/globals.css`). Las utilidades de shadcn `font-sans` y `font-heading` también apuntan a Boska, de modo que ningún componente puede caer en otra fuente.

Recursos que se repiten:

- **Contraste negrita / cursiva** dentro del mismo titular: "Nadie" en negrita y "se casa" en cursiva; "sin compromiso" y "los novios!" en cursiva dentro del marquee.
- **Titulares gigantes** con `clamp()`, interlineado de 0.9 a 1 y `letter-spacing: -0.02em`.
- **Etiqueta** (`.eyebrow`): cuerpo pequeño, mayúsculas y `letter-spacing: 0.18em`, encima de cada bloque.
- **Botones** en forma de píldora, peso 600.

### Lenguaje visual

- Fondos planos de color que cambian de una sección a otra (lila en el hero, beige en la sección 1).
- Formas simples: píldoras, esquinas muy redondeadas (40 px en las cards) y estrellas como separador.
- Los novios no tienen cara: dos "?" grandes ocupan su sitio.
- Movimiento con rebote en los detalles (los "?", el cursor) y lineal o suave en lo estructural (marquee, titular).

### Imágenes

Ya no queda ningún hueco provisional. Todas las imágenes van en la paleta de la landing y sin fondo, sobre el color de su sección: dibujos a línea en SVG (novios del hero, escenas de las cards y de las polaroids, footer) e ilustraciones en PNG con transparencia (orden del día).

---

## 5. Decisiones que se apartan de la especificación

| Tema | Especificación | Lo que se hizo | Motivo |
|---|---|---|---|
| Nombre de las clases | `.section` y `.container` | `.seccion` y `.contenedor` | Tailwind ya tiene una utilidad `container` que pisaba el ancho |
| Hueco de los novios | `position: absolute` | Colocado en la rejilla (columnas 5 a 8, filas 3 y 4) | Respeta la regla de las columnas y el resultado visual es el mismo |
| Dibujos del botón de compra | SVG del ramo y las copas exportados de Figma | Dibujados a mano en el propio componente | No había acceso al archivo de Figma; se sustituyen dentro de `Ramo` y `Copa` manteniendo los `data-btn` |
| Colores de los botones de los tickets | Un color distinto por ticket | Las dos variantes del botón de compra | Lo fija la especificación del botón |
| Borde exterior del botón de compra | Marco fino alrededor del cuerpo | Sin marco | Se quitó a petición tras verlo en pantalla |
| Bloques inferiores del hero | Se apilan por debajo de 768 px | Se apilan por debajo de 1024 px | Con 8 columnas quedaban en 160 px y el botón no cabía |
| Dibujo del sello "Arrastra" | Capas exportadas de Figma | Dibujado a mano en `SelloArrastra` | No había acceso al archivo de Figma; se sustituye dentro del componente manteniendo los `data-sello` |
| Texto circular del sello | Grupo `<g>` dentro del mismo SVG, a 71 px del centro | SVG propio encima del sello, con la línea base a 67 px | Un `<svg>` gira sobre su centro igual que las estrellas, sin depender de la caja del texto; con la línea base a 67 las letras quedan centradas en 71 |
| Tamaño del sello | 170 px | Caja de 200 px con la cera de unos 170 | La caja es el `viewBox` de 200 de la especificación a escala 1:1; el margen deja sitio al borde ondulado |
| Sello con movimiento reducido | Sigue al cursor con un fundido | No aparece | Sin animaciones el marquee está quieto y no se puede arrastrar: un cursor que dice "Arrastra" engañaría |
| Flechas del arrastre | Dos círculos con flecha a los lados del sello mientras se arrastra | Sin flechas | Se quitaron a petición tras verlas en pantalla |
| Aplastamiento al estampar | Opcional (`scaleY: 0.92 → 1`) | Sin hacer | El rebote de `back.out(3)` ya da el golpe; se puede añadir sobre la cera |
| Ilustraciones de las cards | Pendientes de dibujar; el hueco en blanco | Dibujadas a mano en `escenas-concepto.tsx` | Para poder animarlas ya; se sustituyen manteniendo los nombres de capa en `data-capa` |
| Capas del sobre | `sobre-solapa` | `sobre-solapa` y `sobre-solapa-abierta` | La solapa tiene que cambiar de profundidad a mitad del giro |
| Forma recortada de las cards | Círculo de 560 px cortado por la esquina superior derecha | Sin círculo | Se quitó a petición tras verlo en pantalla |
| Copas de la bola y parallax del número | Opcionales | Sin hacer | — |
| `overflow: hidden` de la card | En la card | En la capa del fondo | El resultado es el mismo y la card `sticky` no se toca |
| Bucle del marquee | Helper `horizontalLoop()` de GSAP | Bucle propio con una pista de tres copias | Mucho menos código y el mismo resultado; se cambia si el profesor exige el helper |
| Separación entre cards | Cards seguidas | 120 y 240 px de margen extra antes de apilarse | Hace que las tres se suelten a la vez al salir |
| Alto de las cards | 560 px | Unos 496 px | La pila completa cabe en un portátil de 900 px de alto |
| Tamaño de las polaroids | 340 px de ancho sobre 1920 | 3 columnas de ancho (unos 324 px sobre 1368) | Es el reparto en columnas que pide la propia especificación; las posiciones verticales se escalaron en proporción |
| Imagen que sale (sección 3) | Cruza en horizontal hasta `xPercent: -120` | Además se desvanece | Sin el fundido pasaba por encima del texto de la izquierda |
| Imágenes del orden del día | Formas de arco, círculo, cápsula, tarta y estrella | Ilustraciones del autor, sin fondo y con los colores de la landing | Decisión del autor |
| Entrada al apilar los tickets | Se describe para móvil | Se aplica por debajo de 1024 px, que es donde se apilan | Es el mismo corte que ya tenía la tira |
| Tear-off hover de los tickets | Opcional | Sin hacer | — |
| Apilado de los tickets | Por debajo de 768 px | Por debajo de 1024 px | Con 8 columnas cada ticket medía unos 235 px y el contenido no cabía |
| Tamaño del titular y del precio (sección 4) | 104 px y 112 px | Unos 70 px y 72 px a 1368 | El titular cabe en una línea junto al dato de plazas, y "120 €" cabe con "por persona" al lado |
| Notas de las dudas | Componentes de shadcn donde se pueda | Notas propias con GSAP | El acordeón de shadcn trae su propia animación de altura, que chocaría con la de GSAP |
| Texto de acción de las notas | "pulsa para ver la respuesta" manuscrito, con subrayado de puntos que avanza en el hover | Sellos "Ver respuesta" y "Cerrar", con estrellas que giran en el hover | Cambio de diseño del autor sobre el boceto |
| Qué abre la nota | La nota entera es el botón | Solo el sello "Ver respuesta" / "Cerrar" | Decisión del autor |
| Clip de las notas | SVG exportado de Figma | Dibujado a mano en la sección | No había acceso al archivo de Figma |
| Timeline de cada nota | Creada una sola vez | Creada al abrir y destruida al cerrar | La respuesta oculta no se puede medir ni partir en líneas; así además se adapta si cambia el ancho |
| Etiqueta vertical en móvil y tablet | Se oculta o pasa a horizontal | Se oculta por debajo de 1024 px | — |
| Botón "¿Otra duda? Escríbenos" | Sin destino definido | Enlace `mailto:` al correo pendiente | Hay que cambiar `correo` en `lib/datos-evento.ts` cuando llegue |
| Dibujos del footer | SVG `footer-v2-boceto-marron.svg` exportado de Figma | Dibujados a mano en `Footer.tsx`, calcados del PNG | No se recibió el SVG; se sustituyen manteniendo los nombres de capa en `data-capa` |
| Posición de los novios del footer | Coordenadas del diseño | Recolocados sobre las letras de Boska | Con Boska, "NADIE" es más estrecho que en el diseño (2,6em frente a 3,2em) a la misma altura de mayúscula |
| Rúbrica de "se" | Sin animación | Se dibuja con `DrawSVG` en la entrada | Si estuviera desde el principio, se vería sola mientras suben las letras |
| Profundidad de los novios | 16 px | 10 px dentro del cartel, que suma 6 | Van dentro del cartel para seguir pegados a las letras; el total es el mismo |
| Tamaño del footer | Cartel de unos 290 px a 1920 y novia a tamaño completo | Cartel con `min(12.5vw, 19svh)` y novia al 85 %, más abajo | Petición del autor: que el botón de compra se vea al llegar al footer |
| Dibujos del relleno del footer | SVG `footer-relleno-capas.svg` | Dibujados a mano en `footer-relleno.tsx`, calcados del boceto | No se recibió el SVG |
| Giro de la bola | Grupo de facetas desplazado con `x` dentro de un `clipPath` | Facetas recalculadas como elipses según el ángulo de giro | Una rejilla que se desplaza parece plana; así la bola parece una esfera |
| Estrellas del footer | 7 sueltas | 7 sueltas más los 5 destellos de la bola | Es lo que muestra el boceto |
| Relleno en móvil | Tarta pequeña junto al cartel, o se oculta | Se oculta todo el relleno | En móvil el cartel ocupa el ancho |
| Datos del footer | Desde el borde de la pantalla (100 px a 1920) | Dentro del contenedor de 1368 px | Regla de la rejilla del profesor; solo el hilo, las manos y el fotomatón llegan a los bordes |
| Textos de la navegación y la fila legal | Letra de palo | Boska | Toda la landing va en Boska |
| Ilustración y logo del hero | SVG `hero-relleno-capas.svg` | Dibujados a mano en `novios-hero.tsx` y en el header, calcados del boceto | No se recibió el SVG |
| Grosor del "?" de las caras | Cursiva de titulares | Cursiva de Boska, peso normal | Es lo que pide la especificación; el boceto lo muestra con otra fuente |
| Pelota de la escena del perro | A los pies de ella; si el matasellos la tapa, 20 px a la izquierda | A los pies de él, a la izquierda | Movida 20 px seguía bajo el matasellos y sus ondas cruzaban el bote |
| Lluvia de la escena 1 | Grupo de gotas y una copia | Cuatro copias en mosaico | Con una sola copia quedaban huecos en las esquinas a mitad del tramo |
| Animación de las polaroids | Caen una a una sobre la mesa, que se ve entera | Ventana fija con una cámara que recorre la mesa de foto en foto | Decisión del autor: se copia el componente Polaroid Scroll de Framer, con un scroll más largo y suave |
| Hover de las polaroids | La foto se endereza, crece y gana sombra | Solo crece y gana sombra | Ahora la endereza la cámara al enfocarla |
| Detalles de las polaroids | Papel, manchas, arrugas, caligrafía, matasellos y sello exportados de Figma como imagen | Dibujados a mano en `Polaroid`, en SVG | No había acceso al archivo de Figma; al ser vectores y degradados, sin `blur`, no pesan en las animaciones |
| Chincheta que salta al arrastrar y `will-change` durante el arrastre | Opcionales | Sin hacer | — |
| Botón "Recolocar" | No existe | Botón pequeño que devuelve las fotos arrastradas a su sitio | Decisión del autor |

---

## 6. Pendiente

### Por recibir

| Qué | Dónde afecta | Mientras tanto |
|---|---|---|
| Ilustraciones definitivas de las tres cards | Sección 1 | Dibujos propios ya animados |
| Respuestas de las dudas | Sección 5 | Lorem ipsum (salvo la primera) |
| Correo de contacto | Sección 5 y footer | `[tu correo]` (campo `correo` de `lib/datos-evento.ts`) |
| Ciudad definitiva | Footer | Barcelona, pendiente de confirmar (campo `ciudad`) |
| Año de la primera polaroid | Sección 2 | La primera polaroid va sin año |
| Fotos del fotomatón | Footer | Hueco de color con el cartel escrito |
| Columnas y canal que fija el profesor | Toda la página | 12 columnas y 24 px de canal |

### Por hacer o comprobar

- Probar a mano el arrastre del marquee y el de las polaroids con el ratón.
- A 1920 × 1080 el hueco de los novios apenas se monta sobre el titular; a 1440 × 900 sí lo hace como en Figma.
- Probar a mano el hilo elástico y la profundidad del footer con el ratón (comprobados solo con un ratón simulado).
- Comprobar con el ratón que el ramo del botón del footer no choca con el corazón; si choca, reducirlo a escala 0,75.
- Los anchos de los dígitos de la hora se miden al cargar; si Boska aún no ha llegado se miden con la de reserva. Habría que medirlos con `document.fonts.ready`.
- Los botones "Quiero esta invitación" enlazan a `#invitaciones` (la propia sección): no hay pasarela de compra.
- Precios y nombres de los tickets son provisionales.
- Extras opcionales sin hacer: confeti en el hero, encogido de la card tapada en la sección 1, parallax de las polaroids en la sección 2, separación del ticket por la línea de corte en la sección 4 y lo descartado en el footer (pataleo del novio, flash periódico del fotomatón, corazones que suben...).

---

## 7. Cronología

| Fecha | Qué se hizo |
|---|---|
| 7 de octubre de 2026 | Andamiaje inicial con Next.js y shadcn; primer commit y repositorio en GitHub |
| 7 de octubre de 2026 | Instalación de GSAP, `@gsap/react` y Lenis |
| 7 de octubre de 2026 | Base común: rejilla, paleta, tipografía provisional, `Placeholder`, registro de plugins y scroll suave |
| 7 de octubre de 2026 | Hero, en estático y con su timeline de entrada |
| 7 de octubre de 2026 | Sección 1: marquee arrastrable, cursor, revelado del párrafo y cards apiladas |
| 7 de octubre de 2026 | Sección 2: polaroids arrastrables, línea de tiempo dibujada con el scroll y etiquetas de año |
| 7 de octubre de 2026 | Sección 3, primera parte: pantalla fija con los momentos 01 (Ceremonia) y 02 (Banquete) |
| 7 de octubre de 2026 | Sección 3, segunda parte: momentos 03 (Discursos) y 04 (Tarta), con texto en lila sobre fondos claros |
| 7 de octubre de 2026 | Sección 3 completa: momento 05 (Baile), con la estrella de 16 puntas y el botón de compra |
| 7 de octubre de 2026 | Sección 4: tira de tres tickets con muescas, borde dentado, entrada escalonada y hover |
| 7 de octubre de 2026 | Sección 5: cabecera, acordeón accesible con panel inclinado y borde dentado |
| 7 de octubre de 2026 | Footer: llamada final, navegación numerada, datos y nombre gigante con revelado de letras. Página completa |
| 8 de octubre de 2026 | Tipografía Boska en toda la landing |
| 8 de octubre de 2026 | Componente `BotonCompra` con sus animaciones, colocado en hero, sección 3, tickets y footer |
| 8 de octubre de 2026 | Entrada completa del hero: header, logo, menú, botón, fecha y bloques en cascada |
| 8 de octubre de 2026 | Sección 1: nuevo texto del marquee con estrellas animadas; la card 02 pasa a llamarse "Sin regalo" |
| 9 de octubre de 2026 | Sección 1: nuevo fondo de las cards (número gigante, patrón y grano) y una escena animada en cada una |
| 9 de octubre de 2026 | Sección 1: el cursor "Arrastra" pasa a ser un sello de lacre con inclinación y texto que gira con las estrellas |
| 13 de octubre de 2026 | Sección 2: nuevo diseño de las polaroids (papel envejecido, detalles y sujeciones) y grano en el fondo |
| 13 de octubre de 2026 | Sección 2: las polaroids pasan a una ventana fija con cámara que recorre la mesa, con scroll más lento y suave; cada foto aparece cuando la línea llega a ella; etiqueta y titular se encienden palabra a palabra; botón "Recolocar" para las fotos arrastradas |
| 13 de octubre de 2026 | Sección 3: la línea de progreso ocupa todo el ancho y acaba en el último momento |
| 13 de octubre de 2026 | Sección 4: más peso en el texto del ticket "Invitado" para que se lea mejor |
| 13 de octubre de 2026 | Sección 4: la cabecera se enciende palabra a palabra |
| 13 de octubre de 2026 | Sección 4: nueva entrada de los tickets (lados, líneas, sello y precios que cuentan) y brillo en Familia |
| 13 de octubre de 2026 | Sección 5 rehecha: notas de papel que se abren con clip, entrada en zigzag y botón de contacto |
| 14 de octubre de 2026 | Sección 3: ilustraciones de los cinco momentos en lugar de las formas, sin fondo y con la paleta de la landing |
| 14 de octubre de 2026 | Sección 2: escenas animadas en las seis fotos de las polaroids, que se mueven solo cuando su foto ha caído y está en pantalla |
| 14 de octubre de 2026 | Sección 1: texto completo en las tres cards (entrada, párrafo y datos) |
| 14 de octubre de 2026 | Hero: hover discreto en los enlaces del menú y en el logo |
| 14 de octubre de 2026 | Hero: logo "Boda ajena", ilustración de los novios dibujada a línea con ramo, bucles y profundidad; datos del evento en `lib/datos-evento.ts`, compartidos con el resto de la landing |
| 14 de octubre de 2026 | Footer: relleno de los laterales con tarta, bola de discoteca que gira, botella cuyo corcho vuela hasta la copa de la novia, estrellas y anillos |
| 14 de octubre de 2026 | Footer rehecho: cartel *save the date* con los novios, hilo elástico con corazón entre dos manos, fotomatón que imprime sus fotos, bucles y profundidad con el ratón |
| 14 de octubre de 2026 | Revisión de la tipografía: se quitan Inter y Geist Mono del andamiaje y `font-sans` / `font-heading` pasan a Boska; corrección del historial |
