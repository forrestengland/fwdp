import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { useAuth } from './AuthContext';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at: string;
}

export default function Todos() {

  const [message, setMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [view, setView] = useState('all');
  const navigate = useNavigate();
  const { loading, token } = useAuth();

  async function fetchTodos() {

    console.log('fetching todos');

    let resData = null;
    let uri = '/api/todos/todos';
    if (view == 'incomplete') uri = '/api/todos/todos-incomplete';
    else if (view == 'complete') uri = '/api/todos/todos-complete';

    try {
      const response = await fetch(uri,{
	method: 'GET',
	headers: {
	  'Authorization': `Bearer ${token}`
	}
      });

      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	return;
      }

      resData = await response.json();
      
    } catch (e: unknown) {
      console.log('error loading todos: ', e);
      setMessage('Error loading todos');
      return;
    }

    console.log('got todos: ', resData);

    setTodos(resData.todos);
  }

  function viewAllClicked() {
    console.log('view all clicked');
    setView('all');
    //    fetchTodos();
  }

  function viewIncompleteClicked() {
    console.log('view incomplete clicked');
    setView('incomplete');
    //    fetchTodos();
  }

  function viewCompleteClicked() {
    console.log('view complete clicked');
    setView('complete');
    //    fetchTodos();
  }

  async function todoCompletionChanged(id: string, e: React.ChangeEvent<HTMLInputElement>) {

    const checked = e.currentTarget.checked;

    console.log('todo completion toggled: ', id, checked);

    try {
      const response = await fetch(`/api/todos/todos/${id}`, {
	method: 'PATCH',
	headers: {
	  'Authorization': `Bearer ${token}`,
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({completed: checked})
      });
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	navigate('/');
	return;
      }
    } catch (e: unknown) {
      console.log('error toggling todo completion: ', e);
      setMessage('Error toggling todo completion');
      return;
    }

    console.log('todo completion toggled: ', checked);
    fetchTodos();
    //    setMessage('ToDo updated successfully');
  }

  async function todoDeleteClicked(id: string) {

    console.log('todo delete clicked: ', id);
    let reqData = null;

    try {
      const response = await fetch(`/api/todos/todos/${id}`, {
	method: 'DELETE',
	headers: {
	  'Authorization': `Bearer ${token}`,
	}
      });
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	navigate('/');
	return;
      }
      reqData = await response.json();
    } catch (e: unknown) {
      console.log('error deleting todo: ', e);
      setMessage('Error deleting todo');
      return;
    }

    if (reqData.status == 'ok') {
      console.log('todo deleted');
      //      setMessage('ToDo deleted successfully');
      fetchTodos();
    } else {
      console.log('todo deletion not ok');
      setMessage(reqData.message);
    }
  }

  async function newTodoClicked(e: FormEvent) {

    e.preventDefault();

    console.log('creating todo: ', newTitle);

    // place to store server response json
    let resData = null;

    // send request to api to create todo
    try {
      const response = await fetch('/api/todos/todos-new',{
	method: 'POST',
	headers: {
	  'Authorization': `Bearer ${token}`,
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify({title: newTitle})
      });
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	return;
      }
      resData = await response.json();
    } catch (e: unknown) {
      console.log('error creating todo: ', e);
      setMessage('Error creating todo');
      return;
    }

    console.log('todo created: ', resData);
    setNewTitle('');
    fetchTodos();
  }

  useEffect(() => {
    if (!loading) {
      if (!token) {
	navigate('/');
      } else {
	fetchTodos();
      }
    }
  }, [loading]);

  useEffect(() => {
    fetchTodos();
  }, [view]);

  return (
    <>
      {message && <div className="message-container">{message}</div>}
      <h1>To Do List</h1>
      <div className="todo-view-option">
	{view == 'all' ? <span>All</span> : <a href="#" onClick={viewAllClicked}>All</a>}
	{view == 'incomplete' ? <span>Incomplete</span> : <a href="#" onClick={viewIncompleteClicked}>Incomplete</a>}
	{view == 'complete' ? <span>Complete</span> : <a href="#" onClick={viewCompleteClicked}>Complete</a>}
      </div>
      <div className="content-main">
	<div className="message-container">
	  <form onSubmit={newTodoClicked}>
	  <label>New: </label>
	  <input type="text" onChange={(e) => setNewTitle(e.currentTarget.value)} value={newTitle} />
	    <button type="submit" className="button-inline">Create</button>
	  </form>
	</div>
	{todos.map((todo) => (
	  <div key={todo.id} className="todo-container">
	    <div>
	      <input className="todo-toggle" type="checkbox" checked={todo.completed} onChange={(e) => todoCompletionChanged(todo.id, e)} />
	      <span>{todo.title}</span>
	    </div>
	    <div>
		{todo.completed && <span>Completed {formatDistanceToNow(parseISO(todo.completed_at))} ago - </span>}	      
	      <span>Created {formatDistanceToNow(parseISO(todo.created_at))} ago</span>
	      <button onClick={() => todoDeleteClicked(todo.id)}>🗑️</button>
	    </div>
	    </div>
	))}
      </div>
    </>
  );
}
