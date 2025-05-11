
# Crypto Chart Game

Este módulo es un juego tipo Crash pero con temática de **gráfica de criptomonedas**, animaciones de velas japonesas y la misma mecánica base.

## 📂 Archivos incluidos

- `index.tsx`: Lógica principal del juego.
- `styles.ts`: Estilos para la gráfica y las velas.
- `utils.ts`: Función auxiliar `calculateBetArray`.
- `crash.mp3`, `music.mp3`, `win.mp3`: Archivos de sonido (placeholders, reemplaza por los tuyos).

## 🚀 Cómo integrarlo

1️⃣ **Ubicación sugerida:**  
Copia la carpeta `CryptoChartGame` en `src/games/`.

2️⃣ **Importar el juego:**  
En tu archivo donde listas los juegos (ej: `src/games/index.tsx`), añade:

```ts
import CryptoChartGame from './CryptoChartGame'
```

Y en tu lista de juegos:

```js
{ name: 'Crypto Chart Game', component: CryptoChartGame }
```

3️⃣ **Ajustar rutas:**  
Si tienes un `Slider` ya creado en otra carpeta, ajusta esta línea en `index.tsx`:

```ts
import CustomSlider from './Slider'
```

Para apuntar a la ubicación correcta.

4️⃣ **Sonidos:**  
Reemplaza los archivos `.mp3` por sonidos reales si lo deseas.

5️⃣ **Corre tu proyecto:**  
¡Y listo para probar la nueva experiencia cripto! 📈🕯️

---

🔧 **Requisitos:**  
- React + Vite
- `gamba-react` y `styled-components` instalados.
