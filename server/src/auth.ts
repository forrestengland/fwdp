import argon2 from 'argon2';
import { Pool } from 'pg';

import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import { authenticateToken, AuthenticatedRequest } from './authenticateToken';
import { resend } from './resend';

import { Router } from 'express';

const router = Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432
});

export async function sendVerificationEmail(email: string, token: string) {

  const verificationUrl = `${process.env.APP_URL}/api/verify-email?token=${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from: "My Test Site <no-reply@updates.pierceforrestengland.com>",
    to: [email],
    subject: "Verify your email address",
    html: `<div>Verify your email</div>
    <div>thanks for signing up!
    Click the link below to verify your email address.
    </div>
    <div>
    <a href="${verificationUrl}">Verify email</a>
    </div>
    <div>this link expires in 24 hours</div>`
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
  
  return data;
}

export async function hashPassword(password: string) {

  const hash = await argon2.hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
  return hash;
}

/* TODO - make sure user is logged in */
router.patch('/email-change', async (req: Request, res: Response) => {

  const reqData = req.body;
  console.log('email change request:', reqData);
  res.status(200).json({ status: 'ok' });      
});

// email verification endpoint
router.get('/verify-email', async (req: Request, res: Response) => {

  const email_token = req.query.token;

  if (typeof email_token !== "string") {
    return res.status(400).send("Invalid verification link");
  }

  const email_token_hash = crypto.createHash("sha256").update(email_token).digest("hex");

  try {
    const result = await pool.query("SELECT user_id FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > NOW()", [email_token_hash]);
    if (result.rows.length === 0) {
      return res.status(400).send("This verification link is invalid or has expired");
      const user_id = result.rows[0].user_id;
    }
    await pool.query("UPDATE users SET email_verified_at = NOW()", []);
    const query = "DELETE FROM email_verification_tokens WHERE token_hash = $1";
    await pool.query(query, [email_token_hash]);
    res.redirect(`${process.env.APP_URL}/email-verified`);
  } catch (error: unknown) {
    console.log('error verifying user: ', error);
    res.json({status: 'failed'});
    return;
  }
});

// health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// new user registration
router.post('/register', async (req: Request, res: Response) => {

  const reqData = req.body;
  console.log('registration request:', reqData);

  const hash = await hashPassword(reqData.password);
  console.log('hash:',hash);

  // need to store the registration in the database
  let user_id = null;
  try {
    const result = await pool.query("INSERT INTO users (email,password_hash) VALUES($1,$2) RETURNING id", [req.body.email, hash]);
    // get generated user id
    user_id = result.rows[0].id;
  } catch (error: unknown) {
    console.log('error creating user: ', error);
    res.json({status: 'failed'});
    return;
  }

  // create the email verification token
  const email_token = crypto.randomBytes(32).toString("hex");
  // hash it
  const email_token_hash = crypto.createHash("sha256").update(email_token).digest("hex");
  // add to database
  try {
    const result = await pool.query("INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES($1,$2, NOW() + INTERVAL '24 hours')", [user_id, email_token_hash]);
  } catch (error: unknown) {
    console.log('error creating user token: ', error);
    res.json({status: 'failed'});
    return;
  }

  await sendVerificationEmail(req.body.email, email_token);

  res.json({status: 'ok', message: 'Account created. Check your email'});
});

// user login
router.post('/login', async (req: Request, res: Response) => {

  const reqData = req.body;
  console.log('login request:', reqData);

  const password = reqData.password;
  const email = reqData.email;
  let userid = '';

  try {
    const query = `SELECT id,password_hash FROM users WHERE EMAIL = '${email}' AND email_verified_at IS NOT NULL`;
    console.log(query);
    
    const result = await pool.query(query);
    
    if (result.rows.length < 1) {
      res.json({status: 'failed', message: 'email not registered or not validated'});
      return;
    }
    
    const dbhash = result.rows[0].password_hash;
    const match = await argon2.verify(dbhash, password);
    
    if (!match) {
      res.json({status: 'failed', message: 'wrong password'});
      return;
    }

    userid = result.rows[0].id; 
  } catch (error: unknown) {
    console.log('error checking user: ', error);
    res.json({status: 'failed'})
    return;
  }

  // generate json web token
  const payload = {userid: userid, email: email};
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, {expiresIn: '1h'});
  
  res.json({status: 'ok', token: token});
});

// user message
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  res.json({status: 'ok', message: `hello ${req.user?.email}, you are authenticated`});
});

export default router;
