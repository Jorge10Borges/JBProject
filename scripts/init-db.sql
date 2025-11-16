-- Inicialización de esquema para jbproject
-- Tabla projects (si no existe)
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  status ENUM('plan','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'plan',
  start_date DATE NULL,
  end_date DATE NULL,
  budget DECIMAL(12,2) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  client_name VARCHAR(120) NULL,
  client_contact VARCHAR(120) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_status (status),
  INDEX idx_projects_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla project_items ligada a projects
CREATE TABLE IF NOT EXISTS project_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  item_code VARCHAR(40) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NULL,
  status ENUM('pending','approved','executed','cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  total DECIMAL(14,2) AS (quantity * unit_price) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_item_code (project_id, item_code),
  INDEX idx_project_items_project (project_id),
  INDEX idx_project_items_status (status),
  CONSTRAINT fk_project_items_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
