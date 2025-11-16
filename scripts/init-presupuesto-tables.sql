-- Tabla presupuestos (cabecera de presupuesto de un proyecto)
CREATE TABLE IF NOT EXISTS presupuestos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  total DECIMAL(14,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla presupuesto_item (detalle de actividades/partidas)
CREATE TABLE IF NOT EXISTS presupuesto_item (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  presupuesto_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  monto DECIMAL(14,2) NOT NULL DEFAULT 0,
  ejecutado DECIMAL(14,2) NOT NULL DEFAULT 0,
  avance DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar ejemplos
INSERT INTO presupuestos (project_id, nombre, descripcion, total) VALUES
  (1, 'Presupuesto General', 'Presupuesto principal del proyecto', 35000),
  (2, 'Presupuesto Remodelación', 'Presupuesto para remodelación', 18000);

INSERT INTO presupuesto_item (presupuesto_id, nombre, monto, ejecutado, avance) VALUES
  (1, 'Instalaciones eléctricas', 12000, 6000, 50),
  (1, 'Plomería', 8000, 2000, 25),
  (1, 'Obra civil', 15000, 15000, 100),
  (2, 'Demolición', 5000, 5000, 100),
  (2, 'Acabados', 13000, 6500, 50);
