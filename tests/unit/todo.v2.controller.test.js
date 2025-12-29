/**
 * Import the controller we want to test
 * This contains getToDos and createToDo functions
 */
const ToDoController = require("../../controllers/todo.controller");

/**
 * Import the model layer
 * This will be MOCKED so no real DB is touched
 */
const TodoModel = require("../../models/todo.models");

/**
 * node-mocks-http helps us fake req & res objects
 * so we don't need a real Express server
 */
const httpMocks = require("node-mocks-http");

/**
 * Mock data for testing
 */
const newTodo = require("../mock-data/new-todo.json");
const allTodos = require("../mock-data/all-todos.json");

/**
 * Tells Jest to replace the real TodoModel module with a mock version so no real database code ever runs.
 */
jest.mock("../../models/todo.models");

/**
 * Manually mocking model methods
 * We replace real MongoDB calls with fake functions
 */
TodoModel.create = jest.fn();
TodoModel.find = jest.fn();

/**
 * These represent Express parameters
 */
let req, res, next;

/**
 * Runs before EACH test
 * Fresh request & response objects every time
 */
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();

  /**
   * Reset mocks so previous test calls don't leak
   */
  jest.clearAllMocks();
});

/* ===========================
   GET TODOS TESTS
   =========================== 
*/
describe("ToDoController.getToDos", () => {
  /**
   * Sanity test
   * Ensures function actually exists
   */
  it("should have a getToDos function", () => {
    expect(typeof ToDoController.getToDos).toBe("function");
  });

  /**
   * Tests whether model layer is called correctly
   */
  it("should call TodoModel.find({})", async () => {
    TodoModel.find.mockResolvedValue(allTodos);

    await ToDoController.getToDos(req, res, next);

    /**
     * Confirms DB method was called
     * If controller logic changes, this test will catch it
     */
    expect(TodoModel.find).toHaveBeenCalledWith({});
  });

  /**
   * Happy path test
   * Validates status + response body
   */
  it("should return 200 status code and all todos", async () => {
    /**
     * 🔴 IMPROVEMENT
     * Use mockResolvedValue instead of mockReturnValue
     * because controller uses await
     */
    TodoModel.find.mockResolvedValue(allTodos);

    await ToDoController.getToDos(req, res, next);

    /**
     * Express default status is 200 only if explicitly set
     * Controller MUST call res.status(200)
     */
    expect(res.statusCode).toBe(200);

    /**
     * Verifies DB call happened
     */
    expect(TodoModel.find).toHaveBeenCalledTimes(1);

    /**
     * Ensures response lifecycle finished
     */
    expect(res._isEndCalled()).toBeTruthy();

    /**
     * Validates JSON response
     */
    expect(res._getJSONData()).toStrictEqual(allTodos);
  });

  /**
   * Error handling test
   * Ensures errors are forwarded to middleware
   */
  it("should handle errors in get all todos", async () => {
    const errorMessage = { message: "Error in finding todos" };

    /**
     * Simulate DB failure
     */
    TodoModel.find.mockRejectedValue(errorMessage);

    await ToDoController.getToDos(req, res, next);

    /**
     * Controller should NOT send response here
     * It should pass error to next()
     */
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

/* ===========================
   CREATE TODO TESTS
   =========================== */
describe("ToDoController.createToDo", () => {
  /**
   * Attach body before each test
   */
  beforeEach(() => {
    req.body = newTodo;
  });

  /**
   * Sanity check
   */
  it("should have a createToDo function", () => {
    expect(typeof ToDoController.createToDo).toBe("function");
  });

  /**
   * Verifies DB create call
   */
  it("should call TodoModel.create with request body", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    expect(TodoModel.create).toHaveBeenCalledWith(newTodo);
  });

  /**
   * Status code test
   */
  it("should return 201 response code", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    /**
     * Controller must explicitly set 201
     */
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();
  });

  /**
   * Response body test
   */
  it("should return json response", async () => {
    TodoModel.create.mockResolvedValue(newTodo);

    await ToDoController.createToDo(req, res, next);

    expect(res._getJSONData()).toStrictEqual(newTodo);
  });

  /**
   * Error handling test
   */
  it("should handle errors", async () => {
    const errorMessage = { message: "Status is missing!" };

    TodoModel.create.mockRejectedValue(errorMessage);

    await ToDoController.createToDo(req, res, next);

    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});
