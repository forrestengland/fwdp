import { Router } from 'express';
import { pool } from './db';
import { authenticateToken, AuthenticatedRequest } from './authenticateToken';

const router = Router();

router.post('/todos-new', authenticateToken, async (req: Request, res: Response) => {

  //  console.log('user from token: ', req.user);
  const user_id = req.user.userid;
  const title = req.body.title;
  let todo_id = '';

  try {
    const response = await pool.query('INSERT INTO todos (user_id,title) VALUES($1,$2) RETURNING id', [user_id,title]);
    todo_id = response.rows[0].id;
  } catch (e: unknown) {
    console.log('error adding todo: ', e);
    res.json({ status: 'failed', message: 'error adding todo'});
    return;
  }

  res.json({ status: 'ok', todo_id: todo_id});
});

router.get('/todos', authenticateToken, async (req: Request, res: Response) => {

  const user_id = req.user.userid;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed FROM todos WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.patch('/todos/:id', authenticateToken, (req: Request, res: Response) => {
});

router.delete('/todos/:id', authenticateToken, (req: Request, res: Response) => {
});

export default router;
