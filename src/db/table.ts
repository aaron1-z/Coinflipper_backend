export const gameSettlementsTable = `
  CREATE TABLE IF NOT EXISTS settlement (
    settlement_id INT AUTO_INCREMENT PRIMARY KEY,
    round_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    operator_id VARCHAR(255) NOT NULL,
    bet_amount DECIMAL(10, 2) NOT NULL,
    player_choice ENUM('heads', 'tails') NOT NULL,
    winning_result ENUM('heads', 'tails') NOT NULL,
    win_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ); 
`