import * as UsersController from "./controllers/usersController";
import * as WagersController from "./controllers/wagersController";
import * as BetsController from "./controllers/betsController";
import * as AdminController from "./controllers/adminController";

export const appRouter = (router: any)  => {
  WagersController.initiateStatusUpdates();
  // ****************************** //
  // *********** USERS ************ //
  // ****************************** //
  router.get("/api/users/fetchuser", UsersController.validateUserToken);

  router.post("/api/users/registration", UsersController.checkIfUserExists);
  router.post("/api/users/signup", UsersController.createUser);
  router.post("/api/users/login", UsersController.loginUser);
  router.post("/api/users/validateUsername", UsersController.checkIfUsernameExists);

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
  router.put("/api/wagers/:wagerId/options/:optionId/update", WagersController.updateWagerOptionDetails);

  router.delete("/api/wagers/:wagerId/delete", WagersController.deleteWager);
  router.delete("/api/wagers/:wagerId/options/:optionId/delete", WagersController.deleteWagerOption);

  // ********************************* //
  // ************ BETS ************* //
  // ********************************* //
  // router.get("/api/bets/:betId", BetsController.getBetByID);
  // router.get("/api/bets", BetsController.getBets);
  // router.get("/api/")

  router.post("/api/wagers/:wagerId/bet", BetsController.enterBet);

  // router.put("/api/bets/:betId/update", BetsController.updateBet);

  router.delete("/api/wagers/:wagerId/bet/delete", BetsController.deleteBet);

  // ************************************* //
  // ************ ADMIN USER ************* // 
  // ************************************* //
  router.get("/admin/users", AdminController.adminGetUsers);
  router.get("/admin/users/:userId", AdminController.adminGetUser);
  router.get("/admin/users/:userId/activity", AdminController.adminGetUserActivity);

  router.put("/admin/users/:userId/update", AdminController.adminUpdateUser);

  router.delete("/admin/users/:userId/delete", AdminController.adminDeleteUser);
  router.delete("/admin/wagers/:wagerId/delete", AdminController.adminDeleteWager);
};