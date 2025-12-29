const ToDoController = require("../../controllers/todo.controller");
const TodoModel = require("../../models/todo.models");
const httpMocks = require("node-mocks-http");
const newTodo = require("../mock-data/new-todo.json");
const allTodos = require("../mock-data/all-todos.json");

TodoModel.create = jest.fn();
TodoModel.find = jest.fn();
TodoModel.findById = jest.fn();
TodoModel.findByIdAndUpdate = jest.fn();

let req, res, next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

describe("ToDoController.getTodoById", () => {
  beforeEach(() => {
    req.params.id = "695152e2977f3d1210584a10";
  });
  it("should have a function getTodoById", () => {
    expect(typeof ToDoController.getTodoById).toBe("function");
  });

  it("should called Todoodel.findById with route parameter id", async () => {
    TodoModel.findById.mockResolvedValue();
    await ToDoController.getTodoById(req, res, next);
    expect(TodoModel.findById).toHaveBeenCalledWith(req.params.id);
  });

  it("should return 200 status code and return todo", async () => {
    TodoModel.findById.mockResolvedValue(allTodos[0]);

    await ToDoController.getTodoById(req, res, next);

    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual(allTodos[0]);
    expect(res.statusCode).toBe(200);
  });

  it("should handle error", async () => {
    const errorMessage = { message: "Request id is required!" };

    TodoModel.findById.mockRejectedValue(errorMessage);
    await ToDoController.getTodoById(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

describe("TodoController.updateTodo", () => {
  beforeEach(() => {
    req.params.id = "695152e2977f3d1210584a10";
  });

  it("should have updateTodo function", () => {
    expect(typeof ToDoController.updateTodo).toBe("function");
  });

  it("should update todo using TodoModel.findByIdAndUpdate", async () => {
    req.body = newTodo;

    TodoModel.findByIdAndUpdate.mockResolvedValue(newTodo);

    await ToDoController.updateTodo(req, res, next);

    expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      newTodo
    );
  });

  it("should return updated todo", async () => {
    req.body = newTodo;

    TodoModel.findByIdAndUpdate.mockResolvedValue(newTodo);

    await ToDoController.updateTodo(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual(newTodo);
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle error", async () => {
    const errorMessage = {message: "Something went wrong"};
    TodoModel.findByIdAndUpdate.mockRejectedValue(errorMessage);
    await ToDoController.updateTodo(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });

  it("should handle 404", async () => {
    TodoModel.findByIdAndUpdate.mockResolvedValue(null);
    await ToDoController.updateTodo(req, res, next);
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
    // expect(res._getJSONData()).toStrictEqual(null)
  })

});

describe("ToDocontroller.getToDos", () => {
  it("should have a geToDos function", () => {
    expect(typeof ToDoController.getToDos).toBe("function");
  });

  it("should call TodoModel.find({})", async () => {
    await ToDoController.getToDos(req, res, next);
    expect(TodoModel.find).toHaveBeenCalledWith({});
  });

  it("should return 200 status code and all todos", async () => {
    TodoModel.find.mockReturnValue(allTodos);
    await ToDoController.getToDos(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(TodoModel.find).toHaveBeenCalled();
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual(allTodos);
  });

  it("sould handled errors in get all todos", async () => {
    const errorMessage = { message: "Error in finding todos" };
    const rejectedPromise = Promise.reject(errorMessage);

    TodoModel.find.mockReturnValue(rejectedPromise);
    await ToDoController.getToDos(req, res, next);
    // expect(res.statusCode).toBe(500);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });

  it("should return 404 when todo is not found", async () => {
    req.params.id = "695152e2977f463d210584a10";

    TodoModel.findById.mockResolvedValue(null);

    await ToDoController.getTodoById(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual({
      message: "Todo not found",
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("ToDoController.createToDo", () => {
  beforeEach(() => {
    req.body = newTodo;
  });

  it("Should have a create todo function", () => {
    expect(typeof ToDoController.createToDo).toBe("function");
  });

  it("Should call ToDoModel.create method", async () => {
    await ToDoController.createToDo(req, res, next);
    expect(TodoModel.create).toHaveBeenCalledWith(newTodo);
  });

  it("Should return 201 response code", async () => {
    await ToDoController.createToDo(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("Should return json response", async () => {
    TodoModel.create.mockReturnValue(newTodo);
    await ToDoController.createToDo(req, res, next);
    expect(res._getJSONData()).toStrictEqual(newTodo);
  });

  it("Should handle errors", async () => {
    const errorMessage = {
      message: "Status is missing!",
    };

    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.create.mockReturnValue(rejectedPromise);

    await ToDoController.createToDo(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});
