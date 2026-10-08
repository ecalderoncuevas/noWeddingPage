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
| 2 | Los novios | `#novios` | `components/sections/Novios.tsx` | Hecha |
| 3 | El orden del día | `#plan` | `components/sections/OrdenDelDia.tsx` | Hecha |
| 4 | Invitaciones | `#invitaciones` | `components/sections/Invitaciones.tsx` | Hecha |
| 5 | Dudas | `#dudas` | `components/sections/Dudas.tsx` | Hecha |
| 6 | Footer | — | `components/sections/Footer.tsx` | Hecho |

Las siete piezas están maquetadas y animadas. Lo que falta es contenido definitivo (fuente, imágenes y textos) y los extras opcionales; está en el apartado 6.

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

### Sección 2

- **Mesa.** Las seis polaroids van en un bloque cuadrado del ancho del contenedor y se colocan en porcentajes, así que todo escala con la ventana. El interior de cada polaroid (márgenes y pie de foto) se mide en unidades de contenedor (`cqw`).
- **Línea de tiempo.** Un único `path` de puntos, siempre visible, tapado por una máscara SVG. La máscara tiene un tramo continuo por cada salto entre polaroids, y lo que se anima con `DrawSVGPlugin` son esos tramos: DrawSVG no dibuja bien una línea discontinua.
- **Timeline con `scrub`.** Polaroid 1 y, después, cinco veces: tramo de línea, caída de la polaroid (`y: -200`, `scale: 1.2`, giro extra y `back.out(1.4)`) y etiqueta de año. Termina cuando el final de la mesa llega al borde inferior de la ventana.
- **Dos capas por polaroid.** La exterior (`<figure>`) la mueve el scroll; la interior (el marco) es el `Draggable` y recibe el hover. Si los dos animaran el mismo elemento se pisarían, porque ambos escriben en `transform`.
- **Arrastre y hover.** Solo a partir de 768 px. Al pulsar una foto sube por encima de las demás; al pasar el ratón se endereza, crece un 5 % y gana sombra.
- **Móvil.** Una sola columna en zigzag con una línea recta de puntos que se descubre con `clip-path`.

### Sección 3

- **Datos.** Los cinco momentos están en un array (`momentos`); el HTML, la barra de progreso y la timeline salen de él.
- **Pantalla fija.** `ScrollTrigger` con `pin` y `scrub`; la sección dura una pantalla de scroll por cada transición.
- **Contenido superpuesto.** Todos los momentos ocupan la misma celda de rejilla y solo se ve el actual, de modo que el layout no salta al cambiar.
- **Hora.** Cada carácter es una celda con `overflow: hidden`; el dígito viejo sube y el nuevo entra desde abajo. Si un dígito no cambia entre dos momentos (el "1" de 15:30 a 17:00), no se anima. Cada celda mide lo que su dígito actual y su ancho se anima con él: si reservara el ancho del más grande, el "1" quedaría separado del resto.
- **Nombre y contador.** El mismo movimiento vertical que la hora, dentro de una máscara.
- **Frase.** Fundido cruzado con un poco de desplazamiento.
- **Imagen.** La que sale se va a la izquierda girando y desvaneciéndose; la que entra llega desde fuera de la pantalla por la derecha (`x: "60vw"`, en unidades de ventana para que ninguna forma asome antes de tiempo, por estrecha que sea).
- **Formas del hueco.** Arco, círculo y cápsula son variantes de `Placeholder`. La tarta y la estrella las pinta el componente `Hueco`: la tarta son tres pisos que se reparten la altura con `flex` y una guinda; la estrella reutiliza `Star` con 16 puntas.
- **Botón de compra.** Solo existe en el último momento: aparece con un fundido junto a la frase de "Baile". El hueco se ajusta al espacio disponible con unidades de contenedor (`cqw` y `cqh`), para no desbordarse en pantallas bajas.
- **Fondo y texto.** Se anima el `backgroundColor` y el `color` del escenario a la vez. La etiqueta superior tiene su propio color (`acento`): verde sobre los fondos oscuros y marrón sobre los claros.
- **Progreso.** El relleno crece con `scaleX` desde la izquierda; el punto y el nombre activos cambian de tamaño y opacidad.
- **Móvil y movimiento reducido.** No se fija nada: los momentos se apilan en vertical, cada uno con su color, y no hay barra de progreso.

### Sección 4

- **Datos.** Los tres tickets están en un array con sus textos, colores y el lugar que ocupan en la tira.
- **Tira.** Una rejilla de tres columnas sin separación. En móvil y tablet (por debajo de 1024 px) los tickets se apilan y "Familia" pasa a ser el primero con `order-first`.
- **Alturas alineadas con `subgrid`.** La tira define seis filas (serie, nombre, frase, precio, lista y botón) y cada ticket las hereda con `grid-template-rows: subgrid`. Aunque una frase ocupe dos líneas en un ticket, los precios y los botones de los tres quedan a la misma altura.
- **Muescas y borde dentado.** Se recortan con máscaras CSS (`mask-image` con varios `radial-gradient` y `mask-composite: intersect`), definidas en la clase `.ticket` de `globals.css`. Cada ticket lleva `data-movil` y `data-escritorio` con su posición (`inicio`, `medio` o `fin`), y la máscara cambia con ella: dentado en los extremos de la tira y un cuarto de círculo en cada esquina que toca a otro ticket. Al ser parte del propio ticket, las muescas se mueven con él en el hover.
- **Líneas de corte.** Un borde discontinuo entre tickets: vertical en escritorio y horizontal al apilar.
- **Texto que escala con el ticket.** El nombre y el precio se miden en `cqw`, con un tope en `rem`, para que "Mesa presidencial" quepa en una línea a cualquier ancho.
- **Matriz.** El texto vertical usa `writing-mode: vertical-rl` girado 180°.
- **Entrada.** `gsap.from` con `y: 60`, `opacity: 0` y `stagger: 0.15`, lanzado por `ScrollTrigger` sin `scrub`: se reproduce una vez, al entrar la tira en pantalla.
- **Hover.** El ticket sube 12 px y gira un grado. Solo con ratón y desde 1024 px.

### Sección 5

- **Acordeón propio.** Cada pregunta es un `<button>` con `aria-expanded` y `aria-controls`; la respuesta es una región con `aria-labelledby`. Se abre y se cierra con clic o con Tab y Enter.
- **Estado y animación.** El estado de React (`abierta`) solo guarda qué duda está abierta, para los atributos `aria`. La animación la lanza el propio clic, dentro de `contextSafe`, que es la forma de crear animaciones de GSAP desde un evento para que se limpien al desmontar.
- **Una sola abierta.** Al abrir una se cierra la anterior en el mismo gesto. La primera empieza abierta.
- **Altura.** `height` de 0 a `"auto"` con GSAP. Al cerrar, la respuesta pasa a `display: none` para que no quede accesible con el lector de pantalla.
- **Panel.** Llega inclinándose con rebote (`rotation` de 0 a 1.2, `back.out(2)`) y la flecha gira 180°. El borde dentado es una máscara CSS (`.panel-dentado`), la misma técnica que en los tickets. En móvil no se inclina.
- **`ScrollTrigger.refresh()`** al terminar de abrir o cerrar, porque cambia el alto de la página y lo que hay debajo se desplaza.
- **Estrellas.** Giran despacio en bucle (`rotation: 360`, 20 s, `ease: "none"`).
- **Movimiento reducido.** Las respuestas se abren y cierran al instante y las estrellas no giran.

### Footer

- **Estructura.** Llamada final con botón, navegación numerada (lista ordenada), cuatro bloques de datos (`<dl>`), nombre gigante y fila legal. Va fuera de `<main>`, en un `<footer>`.
- **Nombre gigante.** Su tamaño se mide en `cqw` (porcentaje del ancho del contenedor) y no en `vw`, porque el contenedor tiene un máximo de 1368 px: así va de margen a margen a cualquier ancho. El valor (15cqw en una línea, 29cqw en dos) se sacó midiendo el texto en el navegador con Georgia.
- **Dos líneas en móvil.** Cada mitad del nombre es `block` por debajo de 768 px e `inline` por encima.
- **Revelado de las letras.** `SplitText` por líneas y caracteres, con máscara por líneas; `gsap.from` con `yPercent: 100` y `stagger: 0.03`, lanzado por `ScrollTrigger` sin `scrub`. La máscara es por líneas y no por caracteres para no recortar los lados de las letras en cursiva.
- **`autoSplit`.** Como el nombre pasa de una línea a dos según el ancho, `SplitText` se crea con `autoSplit: true` y la animación se devuelve desde `onSplit`: si cambian las líneas, rehace el corte y la animación.
- **Subrayado de los enlaces.** Solo CSS: un pseudoelemento `::after` que crece con `scale-x` de 0 a 1 desde la izquierda, al pasar el ratón y al recibir el foco.

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
  trigger: mesa,
  start: "top 70%",        // empieza cuando el borde superior de la mesa llega al 70 % de la ventana
  end: "bottom bottom",    // termina cuando su borde inferior toca el de la ventana
  scrub: true,
}
```

#### Parámetro de posición de la timeline

El último argumento de `tl.to()`, `tl.from()` o `tl.fromTo()` dice cuándo empieza ese tween:

- sin nada: al terminar el anterior;
- un número (`t`): en ese instante exacto de la timeline;
- `"<0.3"`: 0.3 después del **inicio** del tween anterior.

En la sección 3, todos los tweens de una transición llevan la misma `t` para que ocurran a la vez.

#### `from`, `to` y `fromTo`

- `to`: del estado actual al que se indica.
- `from`: del estado que se indica al actual. GSAP coloca el elemento en el estado inicial nada más crear el tween; por eso las polaroids están ocultas antes de hacer scroll.
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

El scroll (la caída de la polaroid) y el arrastre escriben los dos en `transform`. Sobre el mismo elemento, el último en escribir borraría al otro. Cada polaroid tiene por eso dos elementos:

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
  bounds: scope.current,  // no puede salir de la sección
  inertia: true,          // al soltar sigue un poco (InertiaPlugin)
  zIndexBoost: false,     // el z-index se gestiona a mano...
  onPress: () => gsap.set(foto, { zIndex: ++altura }),  // ...en la capa exterior
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

- la clase sirve como estado inicial, pero no se suma a la animación. El panel de las dudas tiene la clase `md:rotate-[1.2deg]`; para que llegue inclinado hay que animar `rotation` de 0 a 1.2. Animar de -1.2 a 0 lo dejaría recto;
- un valor en porcentaje (`-translate-1/2`) queda convertido a píxeles en ese momento. Vale para elementos de tamaño fijo, como las etiquetas de año;
- cuando el valor de partida importa, es más claro ponerlo donde GSAP lo va a escribir: el relleno de la barra de progreso parte de `style={{ transform: "scaleX(0)" }}`.

#### Variante `motion-safe` de Tailwind

`md:motion-safe:flex` aplica la clase solo desde 768 px **y** si el usuario no ha pedido reducir el movimiento. Con eso se elige por CSS, sin JavaScript, entre la versión fija de la sección 3 y la apilada.

#### Fuentes con `next/font`

```ts
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })
```

Next descarga la fuente al compilar y la sirve desde el propio sitio; el navegador no llama a Google. `variable` la expone como variable CSS, que `globals.css` recoge en `--font-manuscrita`.

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
| `--font-manuscrita` | Caveat (Google Fonts, vía `next/font`) | Caveat | Pies de foto de las polaroids |

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
| Tamaño de las polaroids | 340 px de ancho sobre 1920 | 3 columnas de ancho (unos 324 px sobre 1368) | Es el reparto en columnas que pide la propia especificación; las posiciones verticales se escalaron en proporción |
| Imagen que sale (sección 3) | Cruza en horizontal hasta `xPercent: -120` | Además se desvanece | Sin el fundido pasaba por encima del texto de la izquierda |
| Huecos de los momentos 03 y 04 | Relleno marrón al 12 % | Relleno liso (beige y verde) | Es lo que muestran los bocetos de Figma |
| Apilado de los tickets | Por debajo de 768 px | Por debajo de 1024 px | Con 8 columnas cada ticket medía unos 235 px y el contenido no cabía |
| Tamaño del titular y del precio (sección 4) | 104 px y 112 px | Unos 70 px y 72 px a 1368 | El titular cabe en una línea junto al dato de plazas, y "120 €" cabe con "por persona" al lado |
| Acordeón de las dudas | Componentes de shadcn donde se pueda | Acordeón propio con GSAP | El de shadcn trae su propia animación de altura, que chocaría con la de GSAP |
| Inclinación del panel de respuesta | -1.2° | +1.2° en CSS | Figma mide los giros al revés que CSS; así cae hacia la derecha, como en el boceto |
| Tamaño del nombre gigante del footer | `font-size` en `vw` (unos 15.7vw) | En `cqw` (15cqw) | El contenedor tiene ancho máximo; en `vw` se saldría en pantallas grandes |
| Marca en el hero y el footer | "[Tu marca]" | "Logo" | Decisión del autor |
| Fotos de las polaroids | Hueco en blanco | Hueco de color liso (lila o marrón) | Se acerca más al boceto de Figma mientras no hay ilustraciones |

---

## 6. Pendiente

### Por recibir

| Qué | Dónde afecta | Mientras tanto |
|---|---|---|
| Tipografía Boska | Todos los titulares | Georgia a través de `--font-display` |
| Ilustración de los novios | Hero | Hueco en blanco |
| Animaciones de las tres cards | Sección 1 | Hueco en blanco |
| Seis fotos o dibujos | Sección 2 | Hueco de color |
| Imágenes de los momentos | Sección 3 | Hueco en blanco con su forma |
| Respuestas de las dudas | Sección 5 | Lorem ipsum (salvo la primera) |
| Correo de contacto | Sección 5 | El texto entre corchetes |
| Año de la primera polaroid | Sección 2 | La primera polaroid va sin año |
| Marca, fecha, lugar, hora, ciudad y número de plazas | Hero, sección 4 y footer | "Logo" y los textos entre corchetes |
| Enlaces de Instagram y TikTok | Footer | Texto sin enlace |
| Columnas y canal que fija el profesor | Toda la página | 12 columnas y 24 px de canal |

Al sustituir la fuente provisional por Boska habrá que reajustar el tamaño de los titulares gigantes.

### Por hacer o comprobar

- Probar a mano el arrastre del marquee y el de las polaroids con el ratón.
- A 1920 × 1080 el hueco de los novios apenas se monta sobre el titular; a 1440 × 900 sí lo hace como en Figma.
- El tamaño del nombre gigante del footer (15cqw y 29cqw) está ajustado a Georgia: hay que volver a medirlo con Boska.
- Comprobar a mano el subrayado de los enlaces del footer al pasar el ratón.
- Los anchos de los dígitos de la hora se miden al cargar; al pasar a Boska habrá que medirlos cuando la fuente esté cargada (`document.fonts.ready`).
- Georgia dibuja los números con cifras de estilo antiguo (suben y bajan de la línea); se corregirá solo al pasar a Boska.
- Los botones "Quiero esta invitación" enlazan a `#invitaciones` (la propia sección): no hay pasarela de compra.
- Precios y nombres de los tickets son provisionales.
- Extras opcionales sin hacer: confeti en el hero, encogido de la card tapada en la sección 1, parallax de las polaroids en la sección 2 separación del ticket por la línea de corte en la sección 4 y footer que aparece desde debajo.

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
