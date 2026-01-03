/**
 * Todo Controller
 * ----------------
 * Responsibilities:
 * - Handle request/response lifecycle
 * - Call model layer
 * - Return consistent API responses
 * - Forward errors to global error handler
 */

const TodoModel = require("../models/todo.models");

/**
 * Centralized response helper
 * Ensures all API responses follow the same structure
 *
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {String} message - Human readable message
 * @param {Object|Array} data - Response payload (always valid)
 */
const sendResponse = (res, status, message, data) => {
  return res.status(status).json({
    message,
    data,
  });
};

/**
 * Create a new Todo
 * POST /todos
 */
exports.createToDo = async (req, res, next) => {
  try {
    const todo = await TodoModel.create(req.body);

    // 201 = Resource successfully created
    return sendResponse(
      res,
      201,
      "Todo created successfully",
      todo
    );
  } catch (err) {
    // Forward error to global error handler
    next(err);
  }
};

/**
 * Get all Todos
 * GET /todos
 */
exports.getToDos = async (req, res, next) => {
  try {
    const todos = await TodoModel.find({});

    // Always return array (even if empty)
    return sendResponse(
      res,
      200,
      "Todos fetched successfully",
      todos
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get Todo by ID
 * GET /todos/:id
 */
exports.getTodoById = async (req, res, next) => {
  try {
    const todo = await TodoModel.findById(req.params.id);

    // Handle not-found case
    if (!todo) {
      return sendResponse(
        res,
        404,
        "Todo not found",
        {}
      );
    }

    return sendResponse(
      res,
      200,
      "Todo fetched successfully",
      todo
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Update Todo by ID
 * PUT /todos/:id
 */
exports.updateTodo = async (req, res, next) => {
  try {
    const updatedTodo = await TodoModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );

    // Handle not-found case
    if (!updatedTodo) {
      return sendResponse(
        res,
        404,
        "Todo not found",
        {}
      );
    }

    return sendResponse(
      res,
      200,
      "Todo updated successfully",
      updatedTodo
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Todo by ID
 * DELETE /todos/:id
 */
exports.deleteTodo = async (req, res, next) => {
  try {
    const deletedTodo = await TodoModel.findByIdAndDelete(req.params.id);

    // Handle not-found case
    if (!deletedTodo) {
      return sendResponse(
        res,
        404,
        "Todo not found",
        {}
      );
    }

    /**
     * NOTE:
     * We use 200 instead of 204 because:
     * - You want to return a message + data
     * - 204 must NOT contain a response body
     */
    return sendResponse(
      res,
      200,
      "Todo deleted successfully",
      {}
    );
  } catch (err) {
    next(err);
  }
};
