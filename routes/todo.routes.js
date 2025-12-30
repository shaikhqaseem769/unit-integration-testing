const express = require("express");
const { createToDo, getToDos, getTodoById, updateTodo, deleteTodo } = require("../controllers/todo.controller");
const router = express.Router();

router.post('/', createToDo);
router.get('/', getToDos)
router.get('/:id', getTodoById)
router.put('/:id', updateTodo)
router.delete('/:id', deleteTodo)
module.exports = router