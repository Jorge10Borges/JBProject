SET NAMES utf8mb4;
SET NAMES utf8mb4;

-- Elimina todos los proyectos existentes
DELETE FROM projects;
ALTER TABLE projects AUTO_INCREMENT = 1;

-- Inserta nuevos proyectos de ejemplo con acentos y caracteres especiales
INSERT INTO projects (project_code, name, description, status, start_date, end_date, budget, currency, client_name, client_contact, notes)
VALUES
('PRJ-101', 'Construcción de bodega', 'Proyecto de construcción de bodega industrial', 'active', '2025-10-01', NULL, 50000, 'USD', 'Cliente Álvarez', 'alvarez@cliente.com', '¡Proyecto urgente!'),
('PRJ-102', 'Mantenimiento eléctrico', 'Mantenimiento preventivo y correctivo de equipos', 'plan', '2025-12-15', NULL, 15000, 'USD', 'Cliente Niño', 'nino@cliente.com', 'Incluye materiales y repuestos'),
('PRJ-103', 'Instalación de paneles solares', 'Instalación de sistema fotovoltaico en la azotea', 'on_hold', '2026-01-10', NULL, 80000, 'USD', 'Cliente Peña', 'pena@cliente.com', 'Pendiente aprobación de presupuesto');
