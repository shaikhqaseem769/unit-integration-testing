const express = require('express');
const todoRoutes = require('./routes/todo.routes')

const app = express();
app.use(express.json());

app.use('/todos', todoRoutes)


// routes
// app.post('/todos', (req, res) => {
//   res.status(201).json(req.body);
// });

module.exports = app;
