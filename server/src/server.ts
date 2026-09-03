import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';

import authRouter from './auth';
import todosRouter from './todos';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware to parse JSON payloads
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/todos', todosRouter);

// start listening for traffic
app.listen(PORT, () => {
  console.log(`fwdp server running on port ${PORT}`);
});
