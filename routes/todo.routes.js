const express = require("express");
const { createToDo } = require("../controllers/todo.controller");
const router = express.Router();

router.post('/', createToDo);

module.exports = router