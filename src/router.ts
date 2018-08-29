import * as UsersController from "./controllers/usersController";
import * as WagersController from "./controllers/wagersController";
import * as BetsController from "./controllers/betsController";
import * as AdminController from "./controllers/adminController";

export const appRouter = (router: any)  => {
  // ****************************** //
  // *********** USERS ************ //
  // ****************************** //
  router.post("/api/users/signup", UsersController.createUser);
  router.post("/api/users/login", UsersController.loginUser);

  router.put("/api/users/:userId/password", UsersController.updateUserPassword);
  router.put("/api/users/:userId/update", UsersController.updateUserInformation);

  router.delete("/api/users/:userId/logout", UsersController.logoutUser);
  router.delete("/api/users/:userId/delete", UsersController.deleteUser);

  // ********************************* //
  // ************ GROUPS ************* //
  // ********************************* //

  // ********************************* //
  // ************ WAGERS ************* //
  // ********************************* //
  router.get("/api/wagers/:wagerId", WagersController.getWager);
  router.get("/api/wagers", WagersController.getAllWagers);

  router.post("/api/wagers/create", WagersController.createWager);
  router.post("/api/wagers/:wagerId/options/create", WagersController.createWagerOption);

  router.put("/api/wagers/:wagerId/update", WagersController.updateWagerDetails);

  // ********************************* //
  // ************ BETS ************* //
  // ********************************* //
  router.get("/api/bets/:betId", WagersController.getWager);
  router.get("/api/bets", WagersController.getAllWagers);

  router.post("/api/bets/create", WagersController.createWager);

  router.put("/api/bets/:betId/update", WagersController.updateWagerDetails);

  // ************************************* //
  // ************ ADMIN USER ************* // 
  // ************************************* //
  router.get("/admin/users", AdminController.adminGetUsers);

  router.post("/admin/users/:userId/update", AdminController.adminUpdateUser);

  router.delete("/admin/users/:userId/delete", AdminController.adminDeleteUser);
  // router.delete("/admin/wagers/:wagerId/delete", AdminController.adminDeleteWagerAndOptions);
};