import express from "express";
import {
  SIGN_UP,
  LOGIN,
  UPDATE_JWT,
  GET_ALL_USERS,
  GET_USER_BY_ID,
  BUY_TICKET,
  // UPDATE_USER,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/users/signUp", SIGN_UP);

router.post("/users/login", LOGIN);

router.post("/users/updateJwt", UPDATE_JWT);

router.get("/users", auth, GET_ALL_USERS);

router.get("/users/:id", auth, GET_USER_BY_ID);

router.post("/users/buyTicket", auth, BUY_TICKET);

// router.put("/users/:id", auth, UPDATE_USER);

export default router;
