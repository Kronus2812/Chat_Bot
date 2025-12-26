# 📊 MVP - Dashboard Analítico de CRM para Equipos de Ventas

![CRM Dashboard Banner](https://raw.githubusercontent.com/Kronus2812/Chat_Bot/main/assets/dashboard-banner.png)

## 🎯 Resumen Ejecutivo

Dashboard analítico client-side que transforma archivos Excel de CRM en insights visuales instantáneos. Procesamiento 100% local (privacidad garantizada), sin backend, sin configuración. Arrastra tu archivo xlsx y obtén KPIs, gráficos interactivos y análisis de pipeline en segundos.

**Casos de uso:** Reuniones ejecutivas, análisis de desempeño individual, auditorías de calidad de datos, forecasting de ventas.

---

## ✨ Características Principales

- **🔒 Privacidad Total:** Todos los datos se procesan localmente en tu navegador
- **⚡ Carga Instantánea:** Drag & drop de archivos Excel (.xlsx)
- **📈 Visualizaciones Automáticas:** Gráficos de donut, barras y tendencias temporales
- **🎯 KPIs Ejecutivos:** Oportunidades abiertas/cerradas, Win Rate, GP Total
- **🔍 Filtros Dinámicos:** Por trimestre, owner y estado
- **📊 Tabla Detallada:** Vista completa row-level con scroll y headers fijos
- **🧩 Detección Inteligente:** Columnas detectadas automáticamente con regex flexible
- **✅ Validación en Tiempo Real:** Feedback instantáneo de calidad de datos

---

## 🚀 Inicio Rápido

### Requisitos Mínimos del Archivo Excel

Tu exportación de CRM debe incluir:
- **Owner/Responsable** (Account Manager, Propietario)
- **Cuenta/Cliente** (Account Name, Company)
- **Estado** (Status: Won/Lost/Open)
- **Probabilidad** (0-100)
- **Valores Monetarios** (TCV, GP)
- **Fechas** (Created Date, Close Date)

### Uso

1. Abre `index.html` en cualquier navegador moderno
2. Arrastra tu archivo `.xlsx` a la zona de carga
3. Si el archivo tiene múltiples hojas, selecciona la correcta
4. Visualiza KPIs, gráficos y tabla de datos
5. Aplica filtros por trimestre u owner según necesites

**¡Eso es todo!** No hay instalación, configuración ni credenciales.

---

## 🏗️ Arquitectura Técnica

### Filosofía: Client-Side First

**Ventajas:**
- ✅ Zero costos de infraestructura
- ✅ Privacidad de datos corporativos garantizada
- ✅ Despliegue trivial (servidor estático o filesystem local)
- ✅ Sin latencia de red

### Componentes

**HTML5**
- Estructura semántica del dashboard
- Secciones: carga, KPIs, gráficos, tabla

**CSS3 (Glassmorphism)**
- Esquema oscuro para reducir fatiga visual
- Transparencias, blur y gradientes radiales
- Responsive y accesible

**JavaScript ES6+ (Patrón Módulo Revelador)**
- **SheetJS:** Parsing de archivos Excel
- **Chart.js:** Generación de visualizaciones
- **Detección automática de columnas:** Regex patterns para variaciones lingüísticas
- **Estructuras de datos:**
  - `workbook`: Excel parseado
  - `rawData`: Datos originales
  - `normalizedRows`: Datos transformados con tipos detectados

---

## 📋 Casos de Uso Reales

### Escenario 1: Reunión Ejecutiva Express
**María**, directora de ventas, recibe el reporte del CRM 30 min antes de su reunión. Carga el archivo, filtra por Q4, y presenta visualizaciones profesionales sin crear manualmente gráficos.

### Escenario 2: Autoevaluación de Sales Rep
**Carlos** exporta sus oportunidades, filtra por su nombre, y analiza su win rate y GP antes de su revisión trimestral con su manager.

### Escenario 3: Auditoría de Calidad de Datos
El equipo de **Ops** carga la exportación completa y usa las validaciones en vivo para identificar campos vacíos, fechas incorrectas o probabilidades fuera de rango.

---

## 💡 Mejores Prácticas

### Preparación de Datos
- Exporta **todas las columnas esenciales** desde tu CRM
- Evita filtros restrictivos (mejor filtrar en el dashboard)
- **Estructura esperada:** Tabla plana (headers en fila 1, datos desde fila 2)
- ❌ Evita: tablas dinámicas, celdas combinadas, subtotales intercalados

### Formatos Recomendados
- **Fechas:** ISO 8601 (`YYYY-MM-DD`) para máxima compatibilidad
- **Números:** Sin separadores de miles
- **Probabilidad:** 0-100 (sin símbolo %)

### Performance
- Datasets grandes (>5,000 filas): Segmenta por año fiscal o región
- Mejor UX con análisis enfocados y contextualizados

### Seguridad
- Aunque el procesamiento es local, maneja archivos sensibles con cuidado
- Elimina archivos de descarga después de usarlos
- Para compartir: hostea en servidor interno o GitHub Pages privado

---

## 🔮 Roadmap Futuro

### Alertas Inteligentes
- Identificar oportunidades con fecha de cierre cercana y baja probabilidad
- Detectar concentración de riesgo (1-2 deals = >50% del GP total)

### Machine Learning Client-Side (TensorFlow.js)
- Predicción de probabilidad real basada en patrones históricos
- Detección de optimismo/pesimismo en forecasts

### Integración con APIs de CRM
- Sincronización automática vía OAuth (Salesforce, HubSpot)
- Dashboards en tiempo real
- Writeback de actualizaciones

### Colaboración (Backend Opcional)
- Vistas personalizadas compartidas
- Comentarios en oportunidades
- Alertas configurables por usuario

---

## 🎯 Valor Diferencial

### Simplicidad Radical
❌ No requiere: training, configuración, credenciales, permisos IT  
✅ Solo requiere: archivo Excel + navegador web

### Transparencia Total
- Visualización completa de datos procesados
- Verificación manual de cálculos de KPIs
- Comprensión visual del impacto de filtros

### Privacidad como Valor Core
- Cumplimiento GDPR sin esfuerzo adicional
- Zero exposición de datos a terceros
- Control total sobre información corporativa

> **"Herramientas poderosas no necesitan ser complejas ni costosas."**

Democramos que con tecnologías web modernas y diseño centrado en el usuario, es posible democratizar el acceso a analytics sofisticado para equipos de cualquier tamaño.

---

## 🛠️ Stack Tecnológico

**Frontend:** HTML5 · CSS3 · JavaScript ES6+  
**Librerías:** SheetJS · Chart.js · Bootstrap 5  
**Arquitectura:** Client-Side · Zero Backend · Static Hosting

---

## 👨‍💻 Desarrollador

**Kronus2812**  
**Stack:** Frontend · Backend · Python · JavaScript · SQL · PHP · React · CSS · HTML

📂 **Repositorio:** [github.com/Kronus2812/Chat_Bot](https://github.com/Kronus2812/Chat_Bot)  

---

## 📄 Licencia

MIT License - Úsalo libremente en proyectos personales o comerciales.

---

⭐ **Si este proyecto te resulta útil, deja una estrella en GitHub**