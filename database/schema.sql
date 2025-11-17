-- ============================================================================
-- LA FANTANA WHS - MARIADB DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Created: 2025-01-17
-- Description: Complete database schema for web portal and mobile app
-- ============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS lafantana_whs
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lafantana_whs;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  charisma_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'External system ID',
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  name VARCHAR(255) NOT NULL,
  role ENUM('super_user', 'admin', 'technician', 'viewer') NOT NULL DEFAULT 'technician',
  depot VARCHAR(100) NOT NULL COMMENT 'Assigned depot/location',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret VARCHAR(255) NULL,
  workday_status ENUM('open', 'closed') DEFAULT 'open',
  workday_closed_at DATETIME NULL,
  workday_opened_by VARCHAR(36) NULL COMMENT 'Admin user ID who reopened',
  workday_reopen_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME NULL,

  INDEX idx_username (username),
  INDEX idx_charisma_id (charisma_id),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  INDEX idx_workday_status (workday_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System users and technicians';

-- ============================================================================
-- 2. DEVICE TYPES TABLE (Tipovi aparata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Device type name (e.g., Floor Standing, Tabletop)',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Short code for device type',
  description TEXT NULL,
  manufacturer VARCHAR(255) NULL,
  model VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Water dispenser device types';

-- ============================================================================
-- 3. OPERATIONS TABLE (Operacije servisa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS operations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Operation name (e.g., Cleaning, Repair, Maintenance)',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Short code for operation',
  description TEXT NULL,
  estimated_duration INT NULL COMMENT 'Estimated duration in minutes',
  category ENUM('maintenance', 'repair', 'installation', 'inspection', 'other') NOT NULL DEFAULT 'maintenance',
  requires_parts BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Does this operation typically require spare parts?',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Service operation types';

-- ============================================================================
-- 4. SPARE PARTS TABLE (Delovi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS spare_parts (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Part name',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Part code/SKU',
  description TEXT NULL,
  category VARCHAR(100) NULL COMMENT 'Part category (e.g., Filter, Valve, Sensor)',
  unit_price DECIMAL(10, 2) NULL COMMENT 'Price per unit',
  stock_quantity INT NOT NULL DEFAULT 0 COMMENT 'Available stock',
  min_stock_level INT NULL COMMENT 'Minimum stock level for alerts',
  supplier VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_stock_quantity (stock_quantity),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Spare parts inventory';

-- ============================================================================
-- 5. SERVICE HEADER TABLE (Glavni servisni nalozi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_header (
  id VARCHAR(36) PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique ticket number',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  device_type_id VARCHAR(36) NULL COMMENT 'FK to device_types',
  device_serial_number VARCHAR(100) NULL,

  assigned_technician_id VARCHAR(36) NOT NULL COMMENT 'FK to users',

  status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',

  scheduled_date DATETIME NULL COMMENT 'Scheduled service date',
  started_at DATETIME NULL COMMENT 'Actual start time',
  completed_at DATETIME NULL COMMENT 'Actual completion time',

  total_duration INT NULL COMMENT 'Total duration in minutes',
  total_cost DECIMAL(10, 2) NULL COMMENT 'Total service cost',

  customer_signature TEXT NULL COMMENT 'Base64 encoded signature',
  notes TEXT NULL COMMENT 'General notes about the service',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (device_type_id) REFERENCES device_types(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_ticket_number (ticket_number),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned_technician (assigned_technician_id),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Service ticket headers';

-- ============================================================================
-- 6. SERVICE DETAILS TABLE (Detaljne operacije servisa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_details (
  id VARCHAR(36) PRIMARY KEY,
  service_header_id VARCHAR(36) NOT NULL COMMENT 'FK to service_header',
  operation_id VARCHAR(36) NOT NULL COMMENT 'FK to operations',

  sequence_number INT NOT NULL COMMENT 'Order of operation execution',

  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  duration INT NULL COMMENT 'Duration in minutes',

  status ENUM('pending', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'pending',

  notes TEXT NULL COMMENT 'Operation-specific notes',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (service_header_id) REFERENCES service_header(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE RESTRICT,

  UNIQUE KEY unique_service_operation (service_header_id, sequence_number),
  INDEX idx_service_header (service_header_id),
  INDEX idx_operation (operation_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed service operations per ticket';

-- ============================================================================
-- 7. SERVICE PARTS TABLE (Delovi korišćeni u servisu)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_parts (
  id VARCHAR(36) PRIMARY KEY,
  service_header_id VARCHAR(36) NOT NULL COMMENT 'FK to service_header',
  service_detail_id VARCHAR(36) NULL COMMENT 'FK to service_details (optional - link to specific operation)',
  spare_part_id VARCHAR(36) NOT NULL COMMENT 'FK to spare_parts',

  quantity_used INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NULL COMMENT 'Price at time of use',
  total_price DECIMAL(10, 2) NULL COMMENT 'quantity * unit_price',

  notes TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (service_header_id) REFERENCES service_header(id) ON DELETE CASCADE,
  FOREIGN KEY (service_detail_id) REFERENCES service_details(id) ON DELETE SET NULL,
  FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT,

  INDEX idx_service_header (service_header_id),
  INDEX idx_service_detail (service_detail_id),
  INDEX idx_spare_part (spare_part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Spare parts used in service tickets';

-- ============================================================================
-- 8. WORKDAY HISTORY TABLE (Istorija otvaranja radnih dana)
-- ============================================================================
CREATE TABLE IF NOT EXISTS workday_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL COMMENT 'FK to users - technician',
  admin_id VARCHAR(36) NOT NULL COMMENT 'FK to users - admin who reopened',

  action ENUM('closed', 'reopened') NOT NULL,
  reason TEXT NULL COMMENT 'Reason for reopening',

  closed_at DATETIME NULL,
  reopened_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_user (user_id),
  INDEX idx_admin (admin_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Workday open/close history';

-- ============================================================================
-- 9. SYNC LOG TABLE (Sinhronizacija mobilne app i web portala)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_log (
  id VARCHAR(36) PRIMARY KEY,
  sync_type ENUM('users', 'tickets', 'spare_parts', 'operations', 'device_types', 'full') NOT NULL,
  direction ENUM('mobile_to_web', 'web_to_mobile') NOT NULL,

  user_id VARCHAR(36) NULL COMMENT 'FK to users - who initiated sync',

  records_synced INT NOT NULL DEFAULT 0,
  status ENUM('success', 'partial', 'failed') NOT NULL,
  error_message TEXT NULL,

  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  duration INT NULL COMMENT 'Duration in milliseconds',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_sync_type (sync_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Synchronization audit log';

-- ============================================================================
-- 10. AUDIT LOG TABLE (Sistem audit log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL COMMENT 'FK to users',

  action VARCHAR(100) NOT NULL COMMENT 'Action performed (e.g., CREATE, UPDATE, DELETE)',
  table_name VARCHAR(100) NOT NULL COMMENT 'Table affected',
  record_id VARCHAR(36) NULL COMMENT 'ID of affected record',

  old_values JSON NULL COMMENT 'Previous values (for updates)',
  new_values JSON NULL COMMENT 'New values',

  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_table_name (table_name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System audit trail';

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Complete service tickets with all details
CREATE OR REPLACE VIEW v_service_tickets_complete AS
SELECT
  sh.id AS service_id,
  sh.ticket_number,
  sh.customer_name,
  sh.customer_phone,
  sh.customer_address,
  sh.status,
  sh.priority,
  sh.scheduled_date,
  sh.started_at,
  sh.completed_at,
  sh.total_duration,
  sh.total_cost,
  dt.name AS device_type,
  dt.code AS device_type_code,
  sh.device_serial_number,
  u.name AS technician_name,
  u.username AS technician_username,
  COUNT(DISTINCT sd.id) AS total_operations,
  COUNT(DISTINCT sp.id) AS total_parts_used,
  SUM(sp.total_price) AS parts_total_cost,
  sh.created_at,
  sh.updated_at
FROM service_header sh
LEFT JOIN device_types dt ON sh.device_type_id = dt.id
LEFT JOIN users u ON sh.assigned_technician_id = u.id
LEFT JOIN service_details sd ON sh.id = sd.service_header_id
LEFT JOIN service_parts sp ON sh.id = sp.service_header_id
GROUP BY sh.id;

-- View: Spare parts low stock alert
CREATE OR REPLACE VIEW v_spare_parts_low_stock AS
SELECT
  id,
  name,
  code,
  category,
  stock_quantity,
  min_stock_level,
  (min_stock_level - stock_quantity) AS shortage,
  supplier
FROM spare_parts
WHERE is_active = TRUE
  AND min_stock_level IS NOT NULL
  AND stock_quantity <= min_stock_level
ORDER BY shortage DESC;

-- View: Technician performance statistics
CREATE OR REPLACE VIEW v_technician_stats AS
SELECT
  u.id AS technician_id,
  u.name AS technician_name,
  u.username,
  u.depot,
  COUNT(sh.id) AS total_tickets,
  SUM(CASE WHEN sh.status = 'completed' THEN 1 ELSE 0 END) AS completed_tickets,
  SUM(CASE WHEN sh.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tickets,
  SUM(CASE WHEN sh.status = 'pending' THEN 1 ELSE 0 END) AS pending_tickets,
  AVG(sh.total_duration) AS avg_duration_minutes,
  SUM(sh.total_cost) AS total_revenue
FROM users u
LEFT JOIN service_header sh ON u.id = sh.assigned_technician_id
WHERE u.role = 'technician' AND u.is_active = TRUE
GROUP BY u.id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure: Complete service ticket
CREATE PROCEDURE sp_complete_service_ticket(
  IN p_service_id VARCHAR(36),
  IN p_signature TEXT,
  IN p_notes TEXT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error completing service ticket';
  END;

  START TRANSACTION;

  -- Update service header
  UPDATE service_header
  SET
    status = 'completed',
    completed_at = NOW(),
    customer_signature = p_signature,
    notes = CONCAT(IFNULL(notes, ''), '\n', IFNULL(p_notes, '')),
    total_duration = TIMESTAMPDIFF(MINUTE, started_at, NOW())
  WHERE id = p_service_id;

  -- Calculate total cost
  UPDATE service_header sh
  SET total_cost = (
    SELECT IFNULL(SUM(sp.total_price), 0)
    FROM service_parts sp
    WHERE sp.service_header_id = sh.id
  )
  WHERE id = p_service_id;

  COMMIT;
END //

-- Procedure: Close workday
CREATE PROCEDURE sp_close_workday(
  IN p_user_id VARCHAR(36)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error closing workday';
  END;

  START TRANSACTION;

  -- Update user workday status
  UPDATE users
  SET
    workday_status = 'closed',
    workday_closed_at = NOW()
  WHERE id = p_user_id;

  -- Log workday closure
  INSERT INTO workday_history (id, user_id, admin_id, action, closed_at, created_at)
  VALUES (UUID(), p_user_id, p_user_id, 'closed', NOW(), NOW());

  COMMIT;
END //

-- Procedure: Reopen workday (admin only)
CREATE PROCEDURE sp_reopen_workday(
  IN p_user_id VARCHAR(36),
  IN p_admin_id VARCHAR(36),
  IN p_reason TEXT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error reopening workday';
  END;

  START TRANSACTION;

  -- Update user workday status
  UPDATE users
  SET
    workday_status = 'open',
    workday_closed_at = NULL,
    workday_opened_by = p_admin_id,
    workday_reopen_reason = p_reason
  WHERE id = p_user_id;

  -- Log workday reopening
  INSERT INTO workday_history (id, user_id, admin_id, action, reason, reopened_at, created_at)
  VALUES (UUID(), p_user_id, p_admin_id, 'reopened', p_reason, NOW(), NOW());

  COMMIT;
END //

DELIMITER ;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
