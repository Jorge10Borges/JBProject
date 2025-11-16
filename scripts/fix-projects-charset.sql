-- Corrige el charset/collation de la tabla y columnas de projects
ALTER TABLE projects CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE projects
  MODIFY name VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY client_name VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY client_contact VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
