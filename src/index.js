const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksIfUserAccountExists(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username)

  if(!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  )

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const userObj = { 
    id: uuidv4(), 
    name, 
    username, 
    todos: []
  }

  users.push(userObj);

  return response.status(201).json(userObj);

});

app.get('/todos', checksIfUserAccountExists, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksIfUserAccountExists, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksIfUserAccountExists, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const matchingTodo = user.todos.find((todo) => todo.id === id)

  if (!matchingTodo) {
    return response.status(400).json({ error: "You cannot update a non existing todo" });
  }
  
  matchingTodo.title = title;
  matchingTodo.deadline = new Date(deadline);

  return response.status(200).json(matchingTodo);
});

app.patch('/todos/:id/done', checksIfUserAccountExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const matchingTodo = user.todos.find((todo) => todo.id === id)

  if (!matchingTodo) {
    return response.status(400).json({ error: "You cannot mark a non existing todo as done" });
  }

  matchingTodo.done = true;

  return response.status(200).json(matchingTodo);
});

app.delete('/todos/:id', checksIfUserAccountExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const matchingTodo = user.todos.find((todo) => todo.id === id)

  if (!matchingTodo) {
    return response.status(400).json({ error: "You cannot delete a non existing todo" });
  }

  const deletedTodo = user.todos.splice(matchingTodo, 1);

  return response.status(200).json(deletedTodo);
});

module.exports = app;