const express = require('express');
const todoRoutes = require('./routes/todo.routes')

const app = express();
app.use(express.json());


app.use('/todos', todoRoutes)

app.use((err, req, res, next) => {
   
  if (err.name === 'ValidationError') {
    return res.status(500).json({
      message: err.message
    });
  }

  return res.status(500).json({
    message: 'Internal Server Error',
  });
});

module.exports = app;
