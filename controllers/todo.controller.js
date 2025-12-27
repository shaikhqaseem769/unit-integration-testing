const TodoModel = require("../models/todo.models")

exports.createToDo = async (req, res, next) => {
    try {
        const todoModel = await TodoModel.create(req.body);
        res.status(201).json(todoModel)
    } catch (err) {
    //    console.log('err', err.message);
        next(err)
    }
}