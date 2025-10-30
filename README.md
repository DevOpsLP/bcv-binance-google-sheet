# App Script para BCV / Binance

AppScript para colocar el precio del Dolar, Euro BCV y el Precio de Binance (Mas alto actual)

## Instalación

1. Ir a Google Sheets
2. Ir a **Extensiones** > **Apps Script**
3. Copiar el script en este repositorio (bcv.gs)
4. Pegar el Script en el editor de Apps Scripts.
5. Click **Ejecutar**
6. Listo

> [!NOTE]
> Si todo sale bien, veras en la consola del Registro de ejecución </br>
> *Aviso	Se ha iniciado la ejecución* </br>
> *Aviso	Se ha completado la ejecución*

## Uso practico

Para hacer la "Actualizacion" un poco mas practica, pueden agregar un boton para "Actualizar el precio". Para hacerlo solo deben seguir los siguientes pasos

1. Ir a **Insertar** > **Dibujo**
2. Dibujan un rectangulo y colocan el texto que deseen, por ejemplo "Actualizar precio"
3. Guardar y Cerrar
4. Una vez con el dibujo creado, hacen click en los `⋮` en el borde superior derecho del dibujo
5. Click en **Asignar secuencia de comandos** y agregan `actualizarPreciosBCV`
6. Click en Aceptar

A partir de aquí solo deben hacer click en el boton y se actualizara el precio 🚀

## Personalizacion de la hoja / celda donde se coloca el precio

En la ultima parte del codigo esta:

```gs
// ===== Escribir en la hoja // Modificar a gusto =====
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  hoja.getRange("G1").setValue("Precio EURO (BCV)");
  hoja.getRange("H1").setValue("Precio DÓLAR (BCV)");
  hoja.getRange("I1").setValue("Precio Binance");
  hoja.getRange("J1").setValue("Última Actualización");
```

Aqui pueden cambiar la celda y la hoja en la que se renderiza :)
