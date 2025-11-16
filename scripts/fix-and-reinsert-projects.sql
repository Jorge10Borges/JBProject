-- Corrige el charset/collation de la tabla y columnas de projects y reinserta ejemplos

-- Cambia el charset y collation de la tabla
ALTER TABLE projects DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cambia el charset y collation de cada columna relevante
ALTER TABLE projects MODIFY name VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects MODIFY client_name VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects MODIFY client_contact VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects MODIFY notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Elimina todos los proyectos existentes y reinicia el índice
DELETE FROM projects;
ALTER TABLE projects AUTO_INCREMENT = 1;

-- Inserta nuevos proyectos de ejemplo con acentos y caracteres especiales
INSERT INTO projects (project_code, name, description, status, start_date, end_date, budget, currency, client_name, client_contact, notes)
VALUES
('PRJ-201', 'Construcción de bodega', 'Proyecto de construcción de bodega industrial', 'active', '2025-10-01', NULL, 50000, 'USD', 'Cliente Álvarez', 'alvarez@cliente.com', '¡Proyecto urgente!'),
('PRJ-202', 'Mantenimiento eléctrico', 'Mantenimiento preventivo y correctivo de equipos', 'plan', '2025-12-15', NULL, 15000, 'USD', 'Cliente Niño', 'nino@cliente.com', 'Incluye materiales y repuestos'),
('PRJ-203', 'Instalación de paneles solares', 'Instalación de sistema fotovoltaico en la azotea', 'on_hold', '2026-01-10', NULL, 80000, 'USD', 'Cliente Peña', 'pena@cliente.com', 'Pendiente aprobación de presupuesto');
