# Dashboard Analítico de CRM para Equipos de Ventas

![Dashboard Preview](https://via.placeholder.com/1200x300/1a1a2e/ffffff?text=CRM+Analytics+Dashboard)

## Descripción

Dashboard analítico que procesa archivos Excel de CRM localmente en el navegador. Transforma datos crudos en visualizaciones interactivas, KPIs ejecutivos y análisis de pipeline sin necesidad de backend o configuración compleja.

**Características principales:**
- Procesamiento 100% local (privacidad garantizada)
- Carga de archivos Excel mediante drag & drop
- Generación automática de gráficos y métricas
- Filtros dinámicos por trimestre y responsable
- Detección inteligente de columnas

---

## Inicio Rápido

### Requisitos del archivo Excel

Tu exportación debe incluir estas columnas (nombres flexibles):
- Owner/Responsable/Account Manager
- Cuenta/Cliente/Company
- Estado/Status (Won/Lost/Open)
- Probabilidad (0-100)
- TCV y GP (valores monetarios)
- Fechas de creación y cierre

### Uso

1. Abre `index.html` en tu navegador
2. Arrastra tu archivo `.xlsx` a la zona de carga
3. Selecciona la hoja si hay múltiples
4. Visualiza automáticamente los datos

No requiere instalación ni configuración.

---

## Arquitectura

### Diseño Client-Side

La aplicación procesa todo en el navegador del usuario:
- Sin costos de infraestructura
- Datos sensibles nunca salen del dispositivo
- Despliegue simple (servidor estático o local)
- Sin latencia de red

### Componentes Técnicos

**HTML5**
- Estructura semántica del dashboard
- Secciones: carga de archivos, KPIs, gráficos, tabla de datos

**CSS3**
- Diseño oscuro con glassmorphism
- Responsive y accesible
- Enfoque en legibilidad de datos

**JavaScript ES6+**
- SheetJS para parsing de archivos Excel
- Chart.js para visualizaciones
- Detección automática de columnas con expresiones regulares
- Tres estructuras de datos: workbook original, raw data, normalized rows

### Detección Automática de Columnas

El sistema usa patrones flexibles para detectar columnas incluso con nombres personalizados. Por ejemplo, para probabilidad busca: "probability", "prob", "probabilidad", "chance".

---

## Funcionalidades

### Panel de KPIs
- Oportunidades abiertas (status != Won/Lost)
- Oportunidades cerradas (Won + Lost)
- Win rate (Won / Total cerradas)
- GP total acumulado

### Visualizaciones
- Gráfico de donut: distribución abiertas vs cerradas
- Gráfico de barras: top 5 owners por GP
- Gráfico de línea: win rate por trimestre

### Filtros Dinámicos
- Por trimestre (Q1, Q2, Q3, Q4)
- Por owner/responsable
- Filtros reactivos que actualizan todos los componentes

### Tabla Detallada
- Vista completa de todas las oportunidades
- Headers fijos con scroll vertical
- Columnas: ID, cuenta, owner, etapa, status, probabilidad, TCV, GP, fechas, trimestre

---

## Casos de Uso

### Reuniones ejecutivas
María, directora de ventas, recibe el reporte del CRM 30 minutos antes de su reunión. Carga el archivo y tiene visualizaciones profesionales listas en segundos. Puede filtrar por trimestre y hacer análisis individuales de cada vendedor.

### Análisis individual
Carlos exporta sus oportunidades, filtra por su nombre y analiza su win rate y contribución al GP antes de su revisión con su manager.

### Auditoría de datos
El equipo de operaciones carga la exportación completa y usa las validaciones en tiempo real para identificar problemas: campos vacíos, fechas incorrectas, probabilidades fuera de rango.

---

## Mejores Prácticas

### Preparación de datos
- Exporta todas las columnas necesarias desde tu CRM
- Evita filtros restrictivos en la exportación (usa los filtros del dashboard)
- Estructura requerida: tabla plana con headers en fila 1
- Evita: tablas dinámicas, celdas combinadas, subtotales intercalados

### Formatos recomendados
- **Fechas:** YYYY-MM-DD (ISO 8601)
- **Números:** sin separadores de miles
- **Probabilidad:** 0-100 sin símbolo de porcentaje

### Performance
Para archivos grandes (>5000 filas), considera segmentar por período o región para mejor rendimiento y análisis más enfocados.

### Seguridad
Aunque el procesamiento es local, maneja archivos sensibles con precaución. Elimina archivos de descarga después de usarlos. Para compartir con tu equipo, usa un servidor interno o repositorio privado.

---

## Roadmap Futuro

**Alertas inteligentes**
- Detectar oportunidades de alto riesgo (cierre cercano + baja probabilidad)
- Identificar concentración de riesgo en pocos deals

**Machine Learning**
- Predicción de probabilidad real basada en patrones históricos
- Detección de forecasts optimistas/pesimistas

**Integración con CRM**
- Sincronización automática vía OAuth (Salesforce, HubSpot)
- Actualización en tiempo real
- Writeback de cambios al CRM

**Colaboración**
- Vistas personalizadas compartidas
- Comentarios en oportunidades
- Alertas configurables

---

## Valor Diferencial

**Simplicidad**
No requiere training, configuración, credenciales ni permisos especiales. Solo necesitas un archivo Excel y un navegador.

**Transparencia**
Todos los datos son visibles. Puedes verificar cálculos manualmente y entender cómo los filtros afectan los resultados.

**Privacidad**
Cumplimiento automático con GDPR. Los datos nunca salen de tu dispositivo. Control total sobre información corporativa.

---

## Stack Tecnológico

- HTML5, CSS3, JavaScript ES6+
- SheetJS (parsing de Excel)
- Chart.js (visualizaciones)
- Bootstrap 5 (UI components)
- Arquitectura client-side sin backend

---

## Desarrollador

**Kronus2812**

Stack: Frontend, Backend, Python, JavaScript, SQL, PHP, React, CSS, HTML

Repositorio: [github.com/Kronus2812/Chat_Bot](https://github.com/Kronus2812/Chat_Bot)

---

## Licencia

MIT License