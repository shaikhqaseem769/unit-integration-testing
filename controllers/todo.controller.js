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

exports.getToDos = async (req, res, next) => {
    try {
        const todos = await TodoModel.find({});
        return res.status(200).json(todos)
    } catch (err) {
        next(err)
    }
}

exports.getTodoById = async(req, res, next) => {
   try {
    const todo = await TodoModel.findById(req.params.id);
    if(!todo){
        return res.status(404).json({ message: "Todo not found" });
    }
    return res.status(200).json(todo)
    // return res.status(200).json({message: 'fetching  todo', todo})
   } catch (err) {
        next(err)
   }
}

exports.updateTodo = async (req, res, next) => {
    try {
        const updated = await TodoModel.findByIdAndUpdate(req.params.id, req.body);
        if(!updated){
            return res.status(404).json()
        }
        // console.log('updated', updated)
       return res.status(200).json(updated)
    } catch (err) {
        next(err)
    }
}