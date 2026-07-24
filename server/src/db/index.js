import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Neon!
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    };

// creating new connection. means this is just a set-up we are saying node.js that if we say to connect use this credentials and connect with postgres
const pool = new Pool(poolConfig)

// adding a sensor that whenever my node.js connects with the postgres this function executes.
pool.on("connect", () => {
    console.log(`Haha, connected to posgres.`)
})
pool.on("error", (error) => {
    console.error(`Hey, something went wrong ${error}`)
})

export { pool };