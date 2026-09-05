import { Router, Request, Response } from 'express';
import { pool } from './db';
import { authenticateToken, AuthenticatedRequest } from './authenticateToken';

const router = Router();

router.post('/todos-new', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const listId = req.body.list;
  console.log('listId: ', listId);
  
  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }
  
  const user_id = req.user.userId;
  const title = req.body.title;
  let todo_id = '';

  try {
    let response = null;
    if (listId == 'default') {
      response = await pool.query('INSERT INTO todos (user_id,title) VALUES($1,$2) RETURNING id', [user_id,title]);
    } else {
      response = await pool.query('INSERT INTO todos (user_id,title,list_id) VALUES($1,$2,$3) RETURNING id', [user_id,title,listId]);
    }
    todo_id = response.rows[0].id;
  } catch (e: unknown) {
    console.log('error adding todo: ', e);
    res.json({ status: 'failed', message: 'error adding todo'});
    return;
  }

  res.json({ status: 'ok', todo_id: todo_id});
});

router.get('/todos', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND list_id IS NULL ORDER BY created_at DESC', [user_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/todos-from-list/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const list_id = req.params.id;

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND list_id = $2 ORDER BY created_at DESC', [user_id,list_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/todos-complete-from-list/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const list_id = req.params.id;

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND list_id = $2 AND completed = true ORDER BY created_at DESC', [user_id,list_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/todos-incomplete-from-list/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const list_id = req.params.id;

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND list_id = $2 AND completed = false ORDER BY created_at DESC', [user_id,list_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/todos-incomplete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND completed = false AND list_id IS NULL ORDER BY created_at DESC', [user_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/todos-complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let todos = [];

  try {
    const response = await pool.query('SELECT id,title,completed,created_at,completed_at FROM todos WHERE user_id = $1 AND completed = true AND list_id IS NULL ORDER BY created_at DESC', [user_id]);
    todos = response.rows;
  } catch (e: unknown) {
    console.log('error getting todos: ', e);
    res.json({status: 'failure', message: 'error getting todos'});
    return;
  }

  res.json({ status: 'success', todos: todos});
});

router.get('/lists', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  const user_id = req.user.userId;
  let lists = [];

  try {
    const response = await pool.query('SELECT id,title,created_at FROM todo_lists WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    lists = response.rows;
  } catch (e: unknown) {
    console.log('error getting lists: ', e);
    res.json({status: 'failure', message: 'error getting lists'});
    return;
  }

  res.json({ status: 'success', lists: lists});
});

router.post('/new-list', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    res.json({status: 'failed', message: 'are you logged in?'});
    return;
  }

  console.log(req.body);

  const user_id = req.user.userId;
  const title = req.body.title
  let list = null;

  try {
    const response = await pool.query('INSERT INTO todo_lists (title,user_id) VALUES($1,$2) RETURNING id,created_at', [title,user_id]);
    list = response.rows[0];
  } catch (e: unknown) {
    console.log('error creating list: ', e);
    res.json({status: 'failure', message: 'error creating list'});
    return;
  }

  res.json({ status: 'success', list: list});
});

router.delete('/lists/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const list_id = req.params.id;

  console.log('got list delete:',list_id);

  if (!req.user) {
    res.json({status: 'failure', message: 'are you logged in?'});
    return;
  }
  
  const user_id = req.user.userId;
  
  try {
    // delete list items for this list first
    await pool.query('DELETE FROM todos WHERE list_id = $1 AND user_id = $2', [list_id, user_id]);
    const response = await pool.query('DELETE FROM todo_lists WHERE id = $1 AND user_id = $2', [list_id, user_id]);
  } catch (e: unknown) {
    console.log('error deleting list: ', e);
    res.json({status: 'failure', message: 'error deleting todo'});
    return;
  }

  res.json({status: 'ok', message: 'the list was deleted'});
  
});

router.patch('/todos/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const completed = req.body.completed;

  console.log('got todo completed state change:',id,completed);
  
  try {
    let response = null;
    if (completed) {
      response = await pool.query('UPDATE todos SET completed = true, completed_at = NOW() WHERE id = $1', [id]);
    } else {
      response = await pool.query('UPDATE todos SET completed = false, completed_at = NULL WHERE id = $1', [id]);
    }
  } catch (e: unknown) {
    console.log('error updating todo completion: ', e);
    res.json({status: 'failure', message: 'error changing todo completion'});
    return;
  }

  res.json({status: 'ok', message: 'the todo completion was updated'});
});

router.patch('/edit-title', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const id = req.body.id;
  const title = req.body.title;
  const user_id = req.user?.userId;

  console.log('got todo title change:',id,title);
  
  try {
    let response = null;
    response = await pool.query('UPDATE todos SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [title, id, user_id]);
  } catch (e: unknown) {
    const msg = 'error updating todo title';
    console.log(msg, e);
    res.json({status: 'failure', message: msg});
    return;
  }

  res.json({status: 'ok', message: 'the todo title was updated'});
});

router.delete('/todos/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;

  console.log('got todo delete:',id);
  
  try {
    const response = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  } catch (e: unknown) {
    console.log('error deleting todo: ', e);
    res.json({status: 'failure', message: 'error deleting todo'});
    return;
  }

  res.json({status: 'ok', message: 'the todo was deleted'});
  
});

export default router;
