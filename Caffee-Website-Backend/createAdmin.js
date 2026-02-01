const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createAdmin() {
  const ADMIN_USERNAME = "hamza";
  const ADMIN_PASSWORD = "1234";

  console.log("\n🔐 Creating Admin User...\n");

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Admins table ready");

    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE username = ?",
      [ADMIN_USERNAME]
    );

    if (existing.length > 0) {
      console.log(`⚠️  Admin "${ADMIN_USERNAME}" already exists!`);
      console.log("   To reset password, delete the admin from database first.\n");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.execute(
      "INSERT INTO admins (username, password) VALUES (?, ?)",
      [ADMIN_USERNAME, hashedPassword]
    );

    console.log("╔════════════════════════════════════════╗");
    console.log("║     ✅ ADMIN CREATED SUCCESSFULLY      ║");
    console.log("╠════════════════════════════════════════╣");
    console.log(`║  Username: ${ADMIN_USERNAME.padEnd(26)}║`);
    console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(26)}║`);
    console.log("╠════════════════════════════════════════╣");
    console.log("║  Login at: /admin                      ║");
    console.log("╚════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdmin();
