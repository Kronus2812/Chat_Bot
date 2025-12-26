# 📊 MVP - CRM Analytics Dashboard

Dashboard interactivo para análisis de oportunidades de venta (CRM) que procesa archivos Excel localmente y genera insights en tiempo real sin enviar datos a servidores externos.

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![Estado](https://img.shields.io/badge/status-MVP-orange)
![Licencia](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Descripción

Sistema de análisis y visualización de datos de CRM construido completamente del lado del cliente. Permite a los equipos de ventas cargar archivos Excel exportados desde su CRM y obtener:

- **KPIs ejecutivos** (oportunidades abiertas/cerradas, win rate, GP total)
- **Visualizaciones interactivas** (gráficos de estado, top performers, win rate trimestral)
- **Filtrado dinámico** por trimestre y propietario de cuenta
- **Validación en vivo** de calidad de datos
- **Exportación** a Excel/CSV

### 💡 Características Clave

✅ **100% cliente-side** - Sin backend, datos procesados en el navegador  
✅ **Privacidad total** - No se envían datos a servidores externos  
✅ **Zero setup** - Abre el HTML y arrastra tu Excel  
✅ **Detección inteligente** de columnas (Owner, TCV, GP, Probability, etc.)  
✅ **Multi-hoja** - Selecciona la hoja correcta si el Excel tiene varias  
✅ **Responsive design** - Diseño moderno con glassmorphism  

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño glassmorphism con gradientes radiales
- **JavaScript (Vanilla)** - Lógica de procesamiento y visualización

### Librerías
- **SheetJS (xlsx.js)** - Parseo de archivos Excel (.xlsx)
- **Chart.js 4.x** - Generación de gráficos interactivos
- **Bootstrap 5** - Sistema de grid y componentes

### Compatibilidad
- Navegadores modernos (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- No requiere Node.js ni instalación de dependencias

---

## 📂 Estructura del Proyecto

