import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { useAuth } from './AuthContext';
import { apiCall } from './Api.tsx';

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
  const [todoEditId, setTodoEditId] = useState('');
  const [todoEditTitle, setTodoEditTitle] = useState('');
  const navigate = useNavigate();
  const { loading, token, logout, login } = useAuth();
  const todoTitleEditRef = useRef<HTMLInputElement>(null);

  async function submitTodoEditTitle() {

    console.log(`submiting todo edit title ${todoEditTitle} for todo ${todoEditId}`);

    const apiArgs = {
      uri: `/api/todos/edit-title`,
      method: 'PATCH',
      data: {id: todoEditId, title: todoEditTitle},
      token: token,
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      const msg = 'error updating title';
      console.log(msg, e);
      setMessage(msg);
      return;
    }
      
    console.log('got todo title patch response: ', responseData);
    setTodoEditId('');
    fetchTodos();
  }

  function handleTodoEditKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key == 'Enter') {
      event.preventDefault();
      submitTodoEditTitle();
    }
  }

  function todoEditTitleChanged(title: string) {
    setTodoEditTitle(title);
  }

  function todoEditClicked(id: string) {
    console.log(`todo edit clicked ${id}`);
    setTodoEditId(id);
  }

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
      logout: logout,
      login: login
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
    setListId('default');
  }

  async function fetchLists() {

    console.log('fetching lists');

    const apiArgs = {
      uri: '/api/todos/lists',
      method: 'GET',
      token: token,
      data: null,
      logout: logout,
      login: login
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

    // default uri - all from default list
    let uri = '/api/todos/todos';
    
    if (listId != 'default') {
      
      // not default list - request from list - all view
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

    const apiArgs = {
      uri: uri,
      method: "GET",
      data: null,
      token: token,
      logout: logout,
      login: login // pass login so we can set a new access token if it expires
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      const msg = 'error fetching todos';
      console.log(msg, e);
      setMessage(msg);
    }

    console.log('got todos: ', responseData);

    if (responseData?.todos)
      setTodos(responseData.todos);
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

    const apiArgs = {
      uri: `/api/todos/todos/${id}`,
      method: "PATCH",
      data: {completed: checked},
      token: token,
      logout: logout,
      login: login
    };

    try {
      await apiCall(apiArgs);
    } catch (e: any) {
      const message = "Error changing completion";
      console.log(message, e);
      setMessage(message);
      return;
    }

    console.log('todo completion toggled: ', checked);
    fetchTodos();
  }

  async function todoDeleteClicked(id: string) {

    console.log('todo delete clicked: ', id);

    const apiArgs = {
      uri: `/api/todos/todos/${id}`,
      method: 'DELETE',
      data: null,
      token: token,
      login: login,
      logout: logout
    };

    let responseData = null;

    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      const msg = "Error deleting todo";
      console.log(msg, e);
      setMessage(msg);
    }

    if (responseData.status == 'ok') {
      console.log('todo deleted');
      fetchTodos();
    } else {
      console.log('todo deletion not ok');
      setMessage(responseData.message);
    }
  }

  async function newListClicked(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    console.log('new list clicked');

    const apiArgs = {
      uri: '/api/todos/new-list',
      method: 'POST',
      token: token,
      data: {title: newListTitle},
      logout: logout,
      login: login
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

    const apiArgs = {
      uri: "/api/todos/todos-new",
      method: "POST",
      data: {title: newTitle, list: listId},
      token: token,
      login: login,
      logout: logout
    };

    let responseData = null;

    // send request to api to create todo
    try {
      responseData = await apiCall(apiArgs);
    } catch (e: any) {
      const msg = 'Error creating todo';
      console.log(msg, e);
      setMessage(msg);
      return;
    }

    console.log('todo created: ', responseData);
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

  useEffect(() => {
    if (todoTitleEditRef.current) todoTitleEditRef.current.focus();
  }, [todoEditId]);

  return (
    <div className="todo-container-main">
      <div className="todo-container-lists">
	<h2>Lists</h2>
	<div className="todo-lists">
	<div className="message-container edit-container">
	  <form onSubmit={(e) => newListClicked(e)}>
	  <input className="edit-input" type="text" onChange={(e) => setNewListTitle(e.currentTarget.value)} value={newListTitle} />
	    <button type="submit" className="create-btn edit-btn button-inline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>
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
	    <button className="edit-btn" onClick={() => listDeleteClicked(list.id)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
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
	<div className="message-container edit-container">
	  <form onSubmit={newTodoClicked}>
	  <input type="text" className="edit-input" onChange={(e) => setNewTitle(e.currentTarget.value)} value={newTitle} />
	    <button type="submit" className="create-btn edit-btn button-inline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>

	  </form>
	</div>
	{todos.map((todo) => (
	  <div key={todo.id} className="todo-container">
	    <div>
	      <input className="todo-toggle" type="checkbox" checked={todo.completed} onChange={(e) => todoCompletionChanged(todo.id, e)} />
	      {todoEditId == todo.id ?
		<input ref={todoTitleEditRef} type="text" onChange={(e) => todoEditTitleChanged(e.currentTarget.value)} defaultValue={todo.title} onKeyDown={handleTodoEditKeydown} /> :
		<span>{todo.title}</span>}
	    </div>
	    <div>
		{todo.completed && <span>Completed {formatDistanceToNow(parseISO(todo.completed_at))} ago - </span>}	      
	      <span>Created {formatDistanceToNow(parseISO(todo.created_at))} ago</span>
	      <button className="edit-btn" onClick={() => todoEditClicked(todo.id)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>
	      <button className="edit-btn" onClick={() => todoDeleteClicked(todo.id)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
	    </div>
	    </div>
	))}
      </div>
      </div>
    </div>
  );
}
