import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TodosProps {
  token: string;
}

export default function Todos({ token }: TodosProps) {

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
    setMessage('ToDo created successfully');
  }

  useEffect(() => {
    fetchTodos();
  }, []);  

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token]);

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
	    <div key={todo.id} className="message-container">
	      <span>{todo.title}</span>
	    </div>
	))}
      </div>
    </>
  );
}
