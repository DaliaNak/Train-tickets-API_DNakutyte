import express from "express";
import { GET_ALL_TICKETS, INSERT_TICKET } from "../controllers/ticket.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/tickets", auth, GET_ALL_TICKETS);

router.post("/tickets", auth, INSERT_TICKET);

export default router;
