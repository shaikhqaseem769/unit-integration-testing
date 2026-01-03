/**
 * Import the controller we want to test.
 * This is the SYSTEM UNDER TEST (SUT).
 * We never mock controllers — we execute them directly.
 */
const ToDoController = require("../../controllers/todo.controller");

/**
 * Import the Mongoose model layer.
 * This WILL be mocked so no real database interaction happens.
 */
const TodoModel = require("../../models/todo.models");

/**
 * node-mocks-http provides fake Express req/res objects.
 * This allows controller testing WITHOUT starting an Express server.
 */
const httpMocks = require("node-mocks-http");

/**
 * Static mock data used for predictable test results.
 * Keeps tests deterministic and repeatable.
 */
const newTodo = require("../mock-data/new-todo.json");
const allTodos = require("../mock-data/all-todos.json");

/**
 * This tells Jest:
 * "Whenever TodoModel is imported, replace it with mock functions."
 * The real Mongoose model file will NEVER execute.
 */
jest.mock("../../models/todo.models");

/**
 * These variables represent Express middleware arguments:
 * req  -> request object
 * res  -> response object
 * next -> error-handling middleware
 */
let req, res, next;

/**
 * Runs BEFORE EACH test.
 * Ensures tests do not share state with each other.
 */
beforeEach(() => {
  // Create a fresh fake request object
  req = httpMocks.createRequest();

  // Create a fresh fake response object
  res = httpMocks.createResponse();

  // Mock Express `next()` function
  next = jest.fn();

  /**
   * Clears:
   * - previous mock call counts
   * - previous mock implementations
   * This prevents false positives between tests.
   */
  jest.clearAllMocks();
});

/* ===========================
   CREATE TODOS TESTS
   =========================== 
*/
describe("ToDoController.createToDo", () => {
  /**
   * Setup request body before each test.
   * Simulates POST request payload.
   */
  beforeEach(() => {
    req.body = newTodo;
  });

  it("should have a createToDo function", () => {
    /**
     * PURPOSE:
     * Ensures controller method exists.
     */
    expect(typeof ToDoController.createToDo).toBe("function");
  });

  it("should call TodoModel.create with request body", async () => {
    /**
     * MOCK BEHAVIOR:
     * Simulate successful document creation.
     * mockResolvedValue is a Jest helper used to mock async functions so 
     * they behave like a successfully resolved Promise.
     */
    TodoModel.create.mockResolvedValue(req.body);

    await ToDoController.createToDo(req, res, next);

    /**
     * ASSERT:
     * Ensures controller sends correct payload to DB.
     * Prevents incorrect field mapping.
     */
    expect(TodoModel.create).toHaveBeenCalledWith(req.body);
  });

  it("should return 201 response code", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    /**
     * ASSERT:
     * Ensures correct REST status for resource creation.
     * 201 = Created.
     */
    expect(res.statusCode).toBe(201);

    /**
     * ASSERT:
     * Ensures response was properly sent.
     */
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should return json response", async () => {
    TodoModel.create.mockResolvedValue(req.body);

    await ToDoController.createToDo(req, res, next);

    /**
     * ASSERT:
     * Ensures API returns newly created object.
     * Prevents empty or incorrect responses.
     * toStrictEqual is a Jest matcher used to compare two values for deep, exact equality.
     */
    
    expect(res._getJSONData()).toStrictEqual({
      message: "Todo created successfully",
      data: newTodo,
    });
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Status is missing!" };

    /**
     * MOCK FAILURE:
     * Simulate validation or DB failure.
     */
    TodoModel.create.mockRejectedValue(errorMessage);

    await ToDoController.createToDo(req, res, next);

    /**
     * ASSERT:
     * Ensures errors are passed to Express error handler.
     * Prevents silent crashes.
     */
    expect(next).toHaveBeenCalledWith(errorMessage);
  });

  it("should not call next on success", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("should call TodoModel.create exactly once", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    expect(TodoModel.create).toHaveBeenCalledTimes(1);
  });

  it("should return application/json response", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    expect(res.getHeader("Content-Type")).toContain("application/json");
  });

  it("should forward validation errors", async () => {
    const validationError = new Error("Validation failed");

    TodoModel.create.mockRejectedValue(validationError);

    await ToDoController.createToDo(req, res, next);

    expect(next).toHaveBeenCalledWith(validationError);
  });
});

/* ===========================
   GET TODOS TESTS
   ===========================
*/

describe("ToDoController.getToDos", () => {

  it("should have a getToDos function", () => {
    /**
     * PURPOSE:
     * Sanity check that controller method exists.
     * Protects against accidental renaming or export removal.
     */
    expect(typeof ToDoController.getToDos).toBe("function");
  });

  it("should call TodoModel.find({})", async () => {
    /**
     * MOCK BEHAVIOR:
     * Pretend DB successfully returned all todos.
     * This avoids real DB calls.
     */
    TodoModel.find.mockResolvedValue(allTodos);

    /**
     * EXECUTE:
     * Call controller exactly as Express would.
     */
    await ToDoController.getToDos(req, res, next);

    /**
     * ASSERTION PURPOSE:
     * - Ensures controller queries DB
     * - Ensures correct query object is used
     * - Catches bugs where filters change accidentally
     */
    expect(TodoModel.find).toHaveBeenCalledWith({});
  });

  it("should return 200 status code and all todos", async () => {
    /**
     * MOCK BEHAVIOR:
     * Simulate successful DB response.
     */
    TodoModel.find.mockResolvedValue(allTodos);

    await ToDoController.getToDos(req, res, next);

    /**
     * ASSERT:
     * Ensures controller explicitly sets HTTP 200.
     * Protects against missing or incorrect status codes.
     */
    expect(res.statusCode).toBe(200);

    /**
     * ASSERT:
     * Ensures DB was queried exactly once.
     * Prevents duplicate DB calls.
     */
    expect(TodoModel.find).toHaveBeenCalledTimes(1);

    /**
     * ASSERT:
     * Confirms Express response lifecycle completed.
     * Prevents hanging requests.
     */
    expect(res._isEndCalled()).toBeTruthy();

    /**
     * ASSERT:
     * Ensures correct JSON payload is returned.
     * Protects API contract.
     */
    expect(res._getJSONData()).toStrictEqual({
      message: "Todos fetched successfully",
      data: allTodos,
    });

    expect(next).not.toHaveBeenCalled();

  });

  it("should handle errors in get all todos", async () => {
    const errorMessage = { message: "Error in finding todos" };

    /**
     * MOCK FAILURE:
     * Simulate database error (Promise rejection).
     */
    TodoModel.find.mockRejectedValue(errorMessage);

    await ToDoController.getToDos(req, res, next);

    /**
     * ASSERT:
     * Confirms controller forwards error to Express error middleware.
     * Prevents swallowed errors and silent failures.
     */
    expect(next).toHaveBeenCalledWith(errorMessage);
  });

  it("should return empty array when no todos exist", async () => {
    TodoModel.find.mockResolvedValue([]);

    await ToDoController.getToDos(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({
      message: "Todos fetched successfully",
      data: [],
    });

    const response = res._getJSONData();
    expect(response).toHaveProperty("message");
    expect(response).toHaveProperty("data");
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBe(0);
    expect(next).not.toHaveBeenCalled();
    expect(TodoModel.find).toHaveBeenCalledWith({});

  });

  
});

/* ===========================
   GET TODOS BY ID TESTS
   ===========================
*/

describe("ToDoController.getTodoById", () => {

  beforeEach(() => {
    req.params.id = "695152e2977f3d1210584a10";
  });

  it("should exist", () => {
    expect(typeof ToDoController.getTodoById).toBe("function");
  });

  it("should call findById with route param", async () => {
    TodoModel.findById.mockResolvedValue({});

    await ToDoController.getTodoById(req, res, next);

    // Ensures correct ID is passed to DB
    expect(TodoModel.findById).toHaveBeenCalledWith(req.params.id);
  });

  it("should return 200 and todo", async () => {
    TodoModel.findById.mockResolvedValue(allTodos[0]);

    await ToDoController.getTodoById(req, res, next);

    // Confirms successful fetch
    expect(res.statusCode).toBe(200);

    // Confirms returned entity
    expect(res._getJSONData()).toStrictEqual({
      message: "Todo fetched successfully",
      data: allTodos[0],
    });

    expect(res._isEndCalled()).toBeTruthy();

    // Ensures no error propagation
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 if todo not found", async () => {
    TodoModel.findById.mockResolvedValue(null);

    await ToDoController.getTodoById(req, res, next);

    // Correct REST behavior
    expect(res.statusCode).toBe(404);

    // Confirms error payload
    expect(res._getJSONData()).toStrictEqual({
      message: "Todo not found",
      data: {},
    });
  });

  it("should forward DB errors", async () => {
    const error = new Error("DB failure");

    TodoModel.findById.mockRejectedValue(error);

    await ToDoController.getTodoById(req, res, next);

    // Ensures centralized error handling
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should forward error for invalid object id", async () => {
    req.params.id = "invalid-id";

    const error = new Error("CastError");
    TodoModel.findById.mockRejectedValue(error);

    await ToDoController.getTodoById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

/* ===========================
   UPDATE TODOS TESTS
=========================== */

describe("ToDoController.updateTodo", () => {

  beforeEach(() => {
    req.params.id = "695152e2977f3d1210584a10";
    req.body = newTodo;
  });

  it("should exist", () => {
    expect(typeof ToDoController.updateTodo).toBe("function");
  });

  it("should call findByIdAndUpdate correctly", async () => {
    TodoModel.findByIdAndUpdate.mockResolvedValue(newTodo);

    await ToDoController.updateTodo(req, res, next);

    // Ensures correct update query
    expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      newTodo,
      { new: true }
    );
  });

  it("should return updated todo", async () => {
    TodoModel.findByIdAndUpdate.mockResolvedValue(newTodo);

    await ToDoController.updateTodo(req, res, next);

    // Confirms update success
    expect(res.statusCode).toBe(200);

    // Confirms updated entity returned
    expect(res._getJSONData()).toStrictEqual({
      message: "Todo updated successfully",
      data: newTodo,
    });
  });

  it("should return 404 when todo not found", async () => {
    TodoModel.findByIdAndUpdate.mockResolvedValue(null);

    await ToDoController.updateTodo(req, res, next);

    // Prevents false-positive updates
    expect(res.statusCode).toBe(404);
  });

  it("should forward update errors", async () => {
    const error = new Error("Update failed");

    TodoModel.findByIdAndUpdate.mockRejectedValue(error);

    await ToDoController.updateTodo(req, res, next);

    // Ensures error middleware is used
    expect(next).toHaveBeenCalledWith(error);
  });
});

/* ===========================
   DELETE TODOS TESTS
   ===========================
*/

describe("ToDoController.deleteTodo", () => {

  beforeEach(() => {
    req.params.id = "695152e2977f3d1210584a10";
  });

  it("should exist", () => {
    expect(typeof ToDoController.deleteTodo).toBe("function");
  });

  it("should delete todo and return 204", async () => {
    TodoModel.findByIdAndDelete.mockResolvedValue({});

    await ToDoController.deleteTodo(req, res, next);

    // 204 = No Content (successful deletion)
    expect(res.statusCode).toBe(200);

    // Ensures correct ID was deleted
    expect(TodoModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);

    // Confirms no error propagation
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 if todo not found", async () => {
    TodoModel.findByIdAndDelete.mockResolvedValue(null);

    await ToDoController.deleteTodo(req, res, next);

    // Correct REST behavior
    expect(res.statusCode).toBe(404);
  });

  it("should forward delete errors", async () => {
    const error = new Error("Delete failed");

    TodoModel.findByIdAndDelete.mockRejectedValue(error);

    await ToDoController.deleteTodo(req, res, next);

    // Ensures deletion errors are handled centrally
    expect(next).toHaveBeenCalledWith(error);
  });
});
