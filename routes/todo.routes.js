const express = require("express");
const { createToDo, getToDos } = require("../controllers/todo.controller");
const router = express.Router();

router.post('/', createToDo);
router.get('/', getToDos)
module.exports = router