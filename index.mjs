//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "dotenv/config";
import authRouter from "./auth/auth.routes.js";
import path from 'path'
import cookieParser from "cookie-parser";
import { protect } from "./auth/auth.middleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "bookmyticket",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter)

app.use(express.static(__dirname + "/public"));

app.get("/", protect, (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//get all seats
app.get("/seats", protect, async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name", protect, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    const userId = req.user.id;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)

    const sql = "SELECT * FROM seats where id = $1 and isbooked = FALSE FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }
    //if we get the row, we are safe to update
    // const sqlU = "update seats set isbooked = TRUE, name = $2 where id = $1";
    // const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    const sqlU = "update seats set isbooked = TRUE, name = $2, user_id = $3 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name, userId]);

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    // res.send(500);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/lock/:id", protect, async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  const conn = await pool.connect();

  try {
    await conn.query("BEGIN");

    const result = await conn.query(
      `SELECT * FROM seats 
       WHERE id = $1 
       AND isbooked = false 
       AND (locked_by IS NULL OR locked_at < NOW() - INTERVAL '30 seconds')
       FOR UPDATE`,
      [id]
    );

    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      return res.status(409).json({
        error: "Seat is currently locked by another user",
      });
    }

    await conn.query(
      `UPDATE seats 
       SET locked_by = $2, locked_at = NOW() 
       WHERE id = $1`,
      [id, userId]
    );

    await conn.query("COMMIT");
    res.json({ message: "Seat locked" });

  } catch (err) {
    await conn.query("ROLLBACK");
    res.status(500).json({ error: "Error locking seat" });
  } finally {
    conn.release();
  }
});



app.put("/unlock/:id", protect, async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  await pool.query(
    `UPDATE seats 
     SET locked_by = NULL, locked_at = NULL 
     WHERE id = $1 AND locked_by = $2`,
    [id, userId]
  );

  res.json({ message: "Seat released" });
});




app.listen(port, () => console.log("Server starting on port: " + port));
