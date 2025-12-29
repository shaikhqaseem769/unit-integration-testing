const express = require("express");
const { createToDo, getToDos, getTodoById, updateTodo } = require("../controllers/todo.controller");
const router = express.Router();

router.post('/', createToDo);
router.get('/', getToDos)
router.get('/:id', getTodoById)
router.put('/:id', updateTodo)
module.exports = router