import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getUser,
  getUsers,
  patchUser,
  patchUserStatus,
  postUser,
  removeUser,
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(authenticate, authorize("admin"));
usersRouter.get("/", asyncHandler(getUsers));
usersRouter.post("/", asyncHandler(postUser));
usersRouter.get("/:userId", asyncHandler(getUser));
usersRouter.patch("/:userId", asyncHandler(patchUser));
usersRouter.patch("/:userId/status", asyncHandler(patchUserStatus));
usersRouter.delete("/:userId", asyncHandler(removeUser));
