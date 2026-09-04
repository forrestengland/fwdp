import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TodosProps {
  token: string;
  loading: boolean;
}

export default function Todos({ token, loading }: TodosProps) {

  const [message, setMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  async function fetchTodos() {

    console.log('fetching todos');

    let resData = null;

    try {
      const response = await fetch('/api/todos/todos',{
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

  async function todoCompletionChanged(id: string, e: FormEvent) {

    const checked = e.target.checked;

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
    //    setMessage('ToDo created successfully');
    fetchTodos();
  }

  useEffect(() => {
    fetchTodos();
  }, []);  

  useEffect(() => {
    if (!loading) {
      if (!token) {
	navigate('/');
      }
    }
  }, [loading]);

  return (
    <>
      {message && <div className="message-container">{message}</div>}
      <h1>To Do List</h1>
      <div className="content-main">
	<div className="message-container">
	  <label>New: </label>
	  <input type="text" onChange={(e) => setNewTitle(e.target.value)} />
	  <button type="submit" onClick={newTodoClicked} className="button-inline">Create</button>
	</div>
	{todos.map((todo) => (
	  <div key={todo.id} className="todo-container">
	    <div>
	      <input className="todo-toggle" type="checkbox" onChange={(e) => todoCompletionChanged(todo.id, e)} />
	      <span>{todo.title}</span>
	    </div>
	    <button onClick={(e) => todoDeleteClicked(todo.id, e)}>🗑️</button>
	    </div>
	))}
      </div>
    </>
  );
}
