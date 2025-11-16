-- Agrega columna unidad a presupuesto_item_detalle
ALTER TABLE presupuesto_item_detalle
  ADD unidad VARCHAR(20) NOT NULL DEFAULT 'UND';

-- Opcional: normalizar unidades vacías
UPDATE presupuesto_item_detalle SET unidad = 'UND' WHERE unidad IS NULL OR unidad = '';
