import * as UserController from "./controllers/userController";

export const appRouter = (router: any)  => {
      // **** ROOT ROUTE **** //
    // GET for root
    router.get("/api/users", UserController.getUsers);

    router.post("/api/users/create", UserController.createUser);
    router.post("/api/users/login", UserController.loginUser);
};