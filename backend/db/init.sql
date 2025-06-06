-- init.sql

-- ========================================
-- Drop existing tables (reverse dependency order)
-- ========================================
DROP TABLE IF EXISTS
  `audit_logs`,
  `system_logs`,
  `notifications`,
  `reservation_tables`,
  `reservations`,
  `store_closures`,
  `tables`,
  `layout_assignments`,
  `layouts`,
  `course_availabilities`,
  `courses`,
  `admin_user_roles`,
  `roles`,
  `admin_users`,
  `stores`;

-- ========================================
-- stores
-- ========================================
CREATE TABLE `stores` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `prefecture` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `website_url` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- admin_users
-- ========================================
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- roles
-- ========================================
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- admin_user_roles (junction)
-- ========================================
CREATE TABLE `admin_user_roles` (
  `user_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `store_id` INT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`,`store_id`),
  KEY `idx_aur_role_id` (`role_id`),
  KEY `idx_aur_store_id` (`store_id`),
  CONSTRAINT `fk_aur_user` FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`),
  CONSTRAINT `fk_aur_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  CONSTRAINT `fk_aur_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- courses
-- ========================================
CREATE TABLE `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `store_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `duration_minutes` SMALLINT UNSIGNED NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `max_people` INT UNSIGNED DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `effective_from` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_store_active` (`store_id`,`is_active`),
  KEY `idx_courses_store_effective` (`store_id`,`effective_from`),
  CONSTRAINT `fk_courses_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- course_availabilities
-- ========================================
CREATE TABLE `course_availabilities` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED NOT NULL,
  `store_id` INT UNSIGNED NOT NULL,
  `date` DATE DEFAULT NULL,
  `weekday` TINYINT DEFAULT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `priority` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ca_course_active` (`course_id`,`is_active`),
  KEY `idx_ca_store_date` (`store_id`,`date`),
  KEY `idx_ca_store_weekday` (`store_id`,`weekday`),
  CONSTRAINT `fk_ca_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`),
  CONSTRAINT `fk_ca_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- layouts
-- ========================================
CREATE TABLE `layouts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `store_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_layouts_store` (`store_id`),
  CONSTRAINT `fk_layouts_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- layout_assignments
-- ========================================
CREATE TABLE `layout_assignments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `store_id` INT UNSIGNED NOT NULL,
  `layout_id` INT UNSIGNED NOT NULL,
  `date` DATE DEFAULT NULL,
  `weekday` TINYINT DEFAULT NULL,
  `is_holiday` TINYINT(1) NOT NULL DEFAULT 0,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `effective_from` DATE DEFAULT NULL,
  `assignment_group_id` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_la_store_date` (`store_id`,`date`),
  KEY `idx_la_store_weekday` (`store_id`,`weekday`),
  KEY `idx_la_layout` (`layout_id`),
  CONSTRAINT `fk_la_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`),
  CONSTRAINT `fk_la_layout` FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- tables
-- ========================================
CREATE TABLE `tables` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `layout_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) DEFAULT NULL,
  `seat_type` VARCHAR(50) NOT NULL DEFAULT 'table',
  `max_capacity` INT UNSIGNED NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tables_layout` (`layout_id`),
  CONSTRAINT `fk_tables_layout` FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- store_closures
-- ========================================
CREATE TABLE `store_closures` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `store_id` INT UNSIGNED NOT NULL,
  `type` ENUM('weekly','monthly_date','one_time','yearly') NOT NULL,
  `weekday` TINYINT DEFAULT NULL,
  `day_of_month` TINYINT DEFAULT NULL,
  `nth_week` TINYINT DEFAULT NULL,
  `month` TINYINT DEFAULT NULL,
  `date` DATE DEFAULT NULL,
  `closure_group_id` CHAR(36) DEFAULT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sc_store_type` (`store_id`,`type`),
  KEY `idx_sc_store_date` (`store_id`,`date`),
  CONSTRAINT `fk_sc_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- reservations
-- ========================================
CREATE TABLE `reservations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reservation_number` VARCHAR(36) NOT NULL,
  `store_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `reservation_date` DATE NOT NULL,
  `datetime_start` DATETIME NOT NULL,
  `datetime_end` DATETIME NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `num_people` INT UNSIGNED NOT NULL,
  `seat_type` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `memo` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_res_reservation_number` (`reservation_number`),
  KEY `idx_res_store_date_status` (`store_id`,`reservation_date`,`status`),
  KEY `idx_res_date_time` (`datetime_start`,`datetime_end`),
  CONSTRAINT `fk_res_store` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`),
  CONSTRAINT `fk_res_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- reservation_tables
-- ========================================
CREATE TABLE `reservation_tables` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reservation_id` BIGINT UNSIGNED NOT NULL,
  `table_id` INT UNSIGNED NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rt_reservation` (`reservation_id`),
  KEY `idx_rt_table` (`table_id`),
  KEY `idx_rt_table_time` (`table_id`,`start_time`,`end_time`),
  CONSTRAINT `fk_rt_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`),
  CONSTRAINT `fk_rt_table` FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- notifications
-- ========================================
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reservation_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('email','sms') NOT NULL,
  `status` ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sent_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_reservation` (`reservation_id`),
  KEY `idx_notif_status` (`status`),
  CONSTRAINT `fk_notif_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- system_logs
-- ========================================
CREATE TABLE `system_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` ENUM('DEBUG','INFO','WARN','ERROR') NOT NULL,
  `message` TEXT NOT NULL,
  `context` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_syslog_level` (`level`),
  KEY `idx_syslog_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- audit_logs
-- ========================================
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) DEFAULT NULL,
  `target_id` BIGINT UNSIGNED DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
