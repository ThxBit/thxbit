CREATE DATABASE IF NOT EXISTS autotrade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autotrade;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userNumber INT NOT NULL,
  googleToken VARCHAR(255) NOT NULL,
  apiKey VARCHAR(255) NOT NULL,
  apiSecret VARCHAR(255) NOT NULL,
  testnet TINYINT DEFAULT 1
);

INSERT INTO users (userNumber, googleToken, apiKey, apiSecret, testnet) VALUES
  (1, 'sampleToken1', 'apiKey1', 'secret1', 1),
  (2, 'sampleToken2', 'apiKey2', 'secret2', 0);
