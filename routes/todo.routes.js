const express = require("express");
const { createToDo, getToDos, getTodoById } = require("../controllers/todo.controller");
const router = express.Router();

router.post('/', createToDo);
router.get('/', getToDos)
router.get('/:id', getTodoById)
module.exports = router