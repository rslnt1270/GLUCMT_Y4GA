# Análisis del repositorio GLUCMT-Y4GA

**Fecha:** 2026-07-20
**Alcance:** retroalimentación del código actual, oportunidades de mejora, y propuesta de migración Firebase → almacenamiento local con generación de reportes PDF (estilo LaTeX) para el control semanal/mensual de tomas.

---

## 1. Resumen del estado actual

| Aspecto | Estado |
|---|---|
| Framework | Expo SDK 57 / React Native 0.86 / React 19 |
| Estado global | Zustand 5 (solo en memoria, **sin persistencia**) |
| Base de datos | Firestore (solo escritura, nunca se lee de vuelta) |
| BLE | `react-native-ble-plx` con parsing GATT de glucosa (0x1808) y presión arterial (0x1810) |
| Pantallas | Dashboard, Insulina, Medicamentos, Historial (calendario), Bluetooth, Dieta, Perfil |
| Pruebas / Lint | No existen |

La app tiene una base sólida: el parsing GATT de glucosa (SFLOAT IEEE-11073, conversión kg/L y mol/L → mg/dL) está bien hecho, el uso de RACP para forzar al Accu-Chek a enviar registros es correcto, la UI es consistente y el soporte multi-paciente en el store está bien planteado. Los problemas principales están en la **persistencia** y en **flujos incompletos**.

---

## 2. Hallazgos críticos (bugs)

### 2.1 Los datos se pierden al cerrar la app 🔴
`src/store/store.js` es 100 % en memoria. `glucoseHistory`, pacientes creados, perfil, medicamentos y dieta desaparecen al cerrar la app. Firestore recibe una copia (`saveReadingToCloud`), pero **la app nunca lee de Firestore**, así que la nube tampoco restaura nada. En la práctica el historial del calendario solo sobrevive mientras la app esté abierta.

> Este es el argumento más fuerte a favor de tu propuesta: la persistencia local no es opcional, es un bug pendiente.

### 2.2 El registro de insulina no guarda nada 🔴
`src/screens/InsulinLogScreen.js:10-30` — el código de guardado está comentado y **no llama a `setLastInsulinDose`** (que existe en el store pero nadie usa, `store.js:111`). La pantalla muestra "Éxito… registrado exitosamente" y el dato se descarta. Es un mensaje engañoso para el usuario.

### 2.3 Las alarmas nunca se programan 🟠
`scheduleDailyMealAlarms` (`src/services/notifications.js:29`) no se invoca desde ningún lugar de la app. Además, desde SDK 52+ los triggers de notificación requieren el campo `type` explícito (p. ej. `SchedulableTriggerInputTypes.DAILY`); el objeto `{ hour, minute, repeats }` sin `type` ya no es válido — verificar contra https://docs.expo.dev/versions/v57.0.0/sdk/notifications/ al implementarlo.

### 2.4 Bug de zona horaria en el historial 🟠
Las tomas se guardan con `new Date().toISOString()` (UTC) y el calendario agrupa por `record.date.split('T')[0]` (`HistoryScreen.js:33,47`). En México (UTC-6), **una toma registrada después de las ~18:00 aparece marcada en el día siguiente**. Para una app de control de tomas nocturnas (cena/insulina nocturna) esto corrompe el registro diario. Solución: guardar también una clave de fecha local (`dateKey`) calculada con la zona horaria del dispositivo.

### 2.5 Firestore abierto con datos médicos 🔴 (seguridad)
`src/services/firebaseConfig.js` escribe en la colección `mediciones` **sin autenticación**. Para que eso funcione, las reglas de Firestore deben estar en modo abierto → cualquiera con el `projectId` (que es público en el APK y en este repo) puede leer y escribir los datos médicos de tus pacientes. La API key de Firebase no es secreta por diseño, pero unas reglas abiertas sí son una fuga de datos de salud. Migrar a local elimina este riesgo de raíz.

### 2.6 Efecto secundario dentro del setter de Zustand 🟡
`store.js:67-69` — `saveCompleteReading` hace un `require()` inline y dispara una llamada de red *dentro* de la función `set()`. Es fire-and-forget: sin manejo de errores visible al usuario, sin cola offline, y mezcla lógica de red con lógica de estado.

---

## 3. Retroalimentación general del código

1. **Inconsistencia multi-paciente:** los pacientes tienen historial propio, pero `userProfile`, `medications` y `dietMeals` son globales (`store.js:122-180`). El reporte PDF por paciente necesitará que al menos medicamentos y perfil sean por paciente.
2. **`takenToday` nunca se resetea:** un medicamento marcado como tomado queda así para siempre; hace falta un reset diario (comparar la fecha del último reset al abrir la app).
3. **`glucoseHistory[].value` mezcla tipos** (`store.js:79`): número de glucosa, string `"120/80"` o `"✓"`. `fullSnapshot` ya tiene los datos estructurados; `value` debería eliminarse o normalizarse — importa para calcular estadísticas del reporte.
4. **BLE — bucle de escaneo infinito** (`bleManager.js:94-98`): al desconectarse reinicia el escaneo cada vez, sin límite ni timeout. El escaneo BLE continuo drena batería; conviene un timeout (p. ej. 60 s) y reintentos con backoff, o escaneo solo con la app en primer plano.
5. **BLE — parsing de presión arterial simplificado** (`bleManager.js:207-208`): ignora el byte de flags; si el equipo reporta en kPa (flag bit 0) o valores SFLOAT con exponente ≠ 0, los números salen mal. Con OMRON en mmHg funciona, pero conviene leer flags igual que se hace con glucosa.
6. **`alert()` dentro de servicios** (`bleManager.js:24,40`): la capa de servicios no debería tocar UI; devolver estados/errores y que la pantalla decida cómo mostrarlos.
7. **TypeScript configurado pero sin usar:** hay `tsconfig.json` y `typescript` en devDependencies, pero todo es `.js`. Para datos médicos, tipar `Reading`, `Patient`, `Snapshot` evita errores como el punto 3.
8. **Sin ESLint/Prettier/tests:** ni siquiera un test del decodificador GATT, que es la lógica más delicada y la más fácil de testear (bytes de entrada conocidos → valor esperado).
9. **Dependencias web innecesarias:** `react-dom` y `react-native-web` están instaladas pero la app depende de BLE nativo; se pueden quitar si no hay plan real de web.
10. **README desactualizado:** el roadmap dice "Implementación de Firebase" como pendiente, pero ya está implementado (y ahora se va a retirar).

---

## 4. Propuesta: Firebase → almacenamiento local

**Veredicto: sí conviene.** Firebase hoy solo aporta una copia de escritura que nadie lee, con reglas abiertas, ~1 MB extra de bundle y latencia de arranque. El caso de uso real (registro familiar de tomas + reporte para el médico) no necesita nube.

### Opción recomendada: `zustand/persist` + AsyncStorage

```
npm i @react-native-async-storage/async-storage
```

- Se envuelve el store existente con el middleware `persist` de Zustand → **todo lo que ya existe (pacientes, historial, dieta, medicamentos, perfil) se vuelve persistente con ~15 líneas de cambio**, sin tocar las pantallas.
- Volumen de datos: 3 tomas/día × 2 pacientes × 1 año ≈ 2,000 registros ≈ 1–2 MB de JSON. AsyncStorage lo maneja sin problema.
- `expo-sqlite` sería la alternativa si en el futuro se quieren consultas complejas o >10k registros, pero hoy sería sobre-ingeniería.

### Cambios concretos

1. `src/services/storage.js`: adaptador de AsyncStorage para `persist` (con `partialize` para excluir estado efímero como `isGlucometerConnected`).
2. Eliminar `firebaseConfig.js`, la dependencia `firebase` y la llamada en `store.js:67-69`.
3. `saveCompleteReading`: guardar además `dateKey` local (corrige el bug de zona horaria, §2.4).
4. **Rotar/deshabilitar el proyecto Firebase** `glucmt-yaga` o cerrar sus reglas, porque las credenciales y el historial quedaron en el repositorio público y en el historial de git.
5. Botón de respaldo manual (exportar/importar JSON con `expo-sharing`) para no perder datos si se cambia de teléfono — la nube ya no cubrirá ese caso.

---

## 5. Propuesta: reporte PDF semanal/mensual con plantilla estilo LaTeX

**Restricción importante:** no existe motor TeX utilizable dentro de una app Expo/React Native — LaTeX **no se puede compilar en el teléfono**. Hay tres caminos:

| Opción | Cómo | Pros | Contras |
|---|---|---|---|
| **A. HTML con estilo LaTeX + `expo-print`** ⭐ | `Print.printToFileAsync({ html })` genera el PDF en el dispositivo; la plantilla CSS imita un documento LaTeX (tipografía serif estilo Computer Modern, tablas estilo `booktabs`, márgenes de `article`) | 100 % offline, cero servidores, se comparte al médico por WhatsApp con `expo-sharing` | No es LaTeX "real" (visualmente indistinguible con buena plantilla) |
| B. Generar archivo `.tex` y compartirlo | La app rellena una plantilla `.tex` con los datos y la exporta; se compila en Overleaf/PC | LaTeX auténtico, plantilla 100 % controlable | Requiere paso manual en otra máquina; inviable para el usuario final (Papá/Mamá) |
| C. Servidor que compile LaTeX (tectonic en Cloud Run) | La app manda JSON, recibe PDF | LaTeX real automático | Reintroduce la nube que se quiere eliminar + costo + datos médicos viajando |

**Recomendación: Opción A**, opcionalmente ofreciendo también la exportación `.tex` (opción B) como "modo avanzado", ya que la misma función que arma los datos del reporte puede alimentar ambas plantillas.

### Diseño del reporte (semanal o mensual)

```
npm i expo-print expo-sharing   (expo-file-system ya viene con Expo)
```

- `src/services/reportGenerator.js`: recibe `(patient, rangoInicio, rangoFin)` y calcula:
  - Tabla de tomas: fecha, hora, glucosa (mg/dL), presión (sys/dia), insulina (U), medicamentos tomados — directamente de `fullSnapshot`.
  - Estadísticas: promedio/mín/máx de glucosa, desviación estándar, % de lecturas en rango (70–180 mg/dL configurable), número de hipoglucemias (<70) e hiperglucemias (>180), promedio de presión arterial.
  - Cabecera con datos del perfil médico (nombre, edad, tipo de diabetes, alergias) — otro motivo para hacer el perfil por-paciente (§3.1).
- `src/templates/latexReportTemplate.js`: plantilla HTML/CSS estilo LaTeX (y su gemela `.tex` si se quiere la opción B).
- Punto de entrada en la UI: botón **"📄 Exportar reporte"** en `HistoryScreen` con selector Semana/Mes → genera PDF → hoja de compartir del sistema.

### Fases sugeridas

1. **Fase 1 — Persistencia local** (§4): corrige la pérdida de datos y elimina Firebase. Incluye el fix de zona horaria y conectar `InsulinLogScreen` al store.
2. **Fase 2 — Reporte PDF** (§5): generador + plantilla + botón en Historial.
3. **Fase 3 — Endurecimiento**: reset diario de `takenToday`, perfil/medicamentos por paciente, timeout de escaneo BLE, tests del decodificador GATT, respaldo JSON.

---

*Documento generado como parte del análisis solicitado; ningún código de la app fue modificado.*
