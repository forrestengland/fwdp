import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { useAuth } from './AuthContext';
import apiCall from './Api.tsx'

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
  const [newListTitle, setNewListTitle] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [lists, setLists] = useState<TodoItem[]>([]);
  const [view, setView] = useState('all');
  const [listId, setListId] = useState('default');
  const navigate = useNavigate();
  const { loading, token, logout } = useAuth();

  function defaultListClicked() {
    console.log('default list clicked');
    setListId('default');
  }

  function listClicked(id: string) {
    setListId(id);
  }

  async function listDeleteClicked(id: string) {

    console.log(`delete list ${id} requested`);

    const apiArgs = {
      uri: `/api/todos/lists/${id}`,
      method: 'DELETE',
      data: null,
      token: token,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      const msg = 'error deleting list';
      console.log(msg, e);
      setMessage(msg);
      return;
    }
      
    console.log('got list delete response: ', responseData);
    fetchLists();
  }

  async function fetchLists() {

    console.log('fetching lists');

    const apiArgs = {
      uri: '/api/todos/lists',
      method: 'GET',
      token: token,
      data: null,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      console.log('error getting lists: ', e);
      setMessage('error getting lists');
      return;
    }
      
    console.log('got lists: ', responseData);
    setLists(responseData.lists);
  }

  async function fetchTodos() {

    console.log('fetching todos');

    let resData = null;
    let uri = '/api/todos/todos';
    if (listId != 'default') {
      uri = `/api/todos/todos-from-list/${listId}`;
      if (view == 'incomplete') {
	uri = `/api/todos/todos-incomplete-from-list/${listId}`;
      } else if (view == 'complete') {
	uri = `/api/todos/todos-complete-from-list/${listId}`;
      }
    } else {
      // incomplete default todos
      if (view == 'incomplete') {
	uri = '/api/todos/todos-incomplete';
      } else if (view == 'complete') { // complete default todos
	uri = '/api/todos/todos-complete';
      }
    }

    try {
      const response = await fetch(uri,{
	method: 'GET',
	headers: {
	  'Authorization': `Bearer ${token}`
	}
      });

      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	logout();
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
  }

  function viewIncompleteClicked() {
    console.log('view incomplete clicked');
    setView('incomplete');
  }

  function viewCompleteClicked() {
    console.log('view complete clicked');
    setView('complete');
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
	logout();
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
	logout();
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
      fetchTodos();
    } else {
      console.log('todo deletion not ok');
      setMessage(reqData.message);
    }
  }

  async function newListClicked(e) {

    e.preventDefault();

    console.log('new list clicked');

    const apiArgs = {
      uri: '/api/todos/new-list',
      method: 'POST',
      token: token,
      data: {title: newListTitle},
      logout: logout,
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      console.log('error creating list: ', e);
      setMessage('error creating list');
      return;
    }

    console.log('new list created:', responseData);
    fetchLists();
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
	body: JSON.stringify({title: newTitle, list: listId})
      });
      if (response.status == 401 || response.status == 403) {
	setMessage('Session expired. please log in again');
	logout();
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
	fetchLists();
	fetchTodos();
      }
    }
  }, [loading]);

  useEffect(() => {
    fetchTodos();
  }, [view]);

  useEffect(() => {
    fetchTodos();
  }, [listId]);

  return (
    <div className="todo-container-main">
      <div className="todo-container-lists">
	<h2>Lists</h2>
	<div className="todo-lists">
	<div className="message-container">
	  <form onSubmit={(e) => newListClicked(e)}>
	  <label>New: </label>
	  <input type="text" onChange={(e) => setNewListTitle(e.currentTarget.value)} value={newListTitle} />
	    <button type="submit" className="button-inline">Create</button>
	  </form>
	</div>

	  <div key="default" onClick={defaultListClicked} className={listId == 'default' ? "todo-container-selected" : "todo-container"}>
	    <div>
	      <span>Default</span>
	    </div>
	  </div>

	  {lists.map((list) => (
	    <div key={list.id} className={listId == list.id ? "todo-container-selected" : "todo-container"} onClick={() => listClicked(list.id)}>
	    <div>
	      <span>{list.title}</span>
	    </div>
	    <button onClick={() => listDeleteClicked(list.id)}>🗑️</button>
	  </div>
	  ))}
	</div>
      </div>
      <div className="todo-container-todos">
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
      </div>
    </div>
  );
}
