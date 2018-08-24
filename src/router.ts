import * as UserController from "./controllers/userController";

export const appRouter = (router: any)  => {
  // USER ENPOINTS
  router.post("/api/users/signup", UserController.createUser);
  router.post("/api/users/login", UserController.loginUser);

  router.put("/api/users/:userId/password", UserController.updateUserPassword);
  router.put("/api/users/:userId/update", UserController.updateUserInformation);

  router.delete("/api/users/:userId/logout", UserController.logoutUser);
  router.delete("/api/users/:userId/delete", UserController.deleteUser);

  // ADMIN ENDPOINTS
  router.get("/admin/users", UserController.adminGetUsers);
  
  router.post("/admin/users/:userId/update", UserController.adminUpdateUser);

  router.delete("/admin/users/:userId/delete", UserController.adminDeleteUser);
};