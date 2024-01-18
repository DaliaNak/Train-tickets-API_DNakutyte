import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import TicketModel from "../models/ticket.js";
import jwt from "jsonwebtoken";

const SIGN_UP = async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  const capitalizeFirstLetter = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const correctedName = req.body.name
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");

  try {
    const user = new UserModel({
      name: correctedName,
      email: req.body.email,
      password: hash,
      bought_tickets: req.body.bought_tickets,
      money_balance: {
        value: req.body.money_balance.value,
        currency: req.body.money_balance.currency,
      },
    });

    if (!req.body.email.includes("@")) {
      return res.status(400).json({
        message: "Invalid email, please include the '@' symbol.",
      });
    }

    if (req.body.password.length < 6 || !/\d/.test(req.body.password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one number.",
      });
    }

    const response = await user.save();

    const accessToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "User was created",
      user: response,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const LOGIN = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        message:
          "Authentication failed. Please ensure you are using a valid email address.",
      });
    }

    const isPasswordMatch = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message:
          "Authentication failed. Please ensure you are using a valid password.",
      });
    }

    const accessToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const UPDATE_JWT = async (req, res) => {
  try {
    const updateToken = req.body.refreshToken;

    if (!updateToken) {
      return res.status(401).json({
        message: "Authentication token is not provided.",
      });
    }

    jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Authentication token is not valid." });
      }
      const newAccessToken = jwt.sign(
        { email: decoded.email, id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      const newRefreshToken = jwt.sign(
        { email: decoded.email, id: decoded.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        newAccessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const GET_ALL_USERS = async (req, res) => {
  try {
    const users = await UserModel.find().sort("name");
    return res.status(200).json({ users: users });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const GET_USER_BY_ID = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    return res.status(200).json({ user: user });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const BUY_TICKET = async (req, res) => {
  try {
    const { userId, ticketId } = req.body;

    if (!userId || !ticketId) {
      return res.status(400).json({
        message: "User Id and ticket Id are required in the request body.",
      });
    }

    const user = await UserModel.findById(userId);
    const ticket = await TicketModel.findById(ticketId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    if (user.bought_tickets.includes(ticketId)) {
      return res
        .status(400)
        .json({ message: "User already bought this ticket" });
    }

    if (user.money_balance.value < ticket.ticket_price.value) {
      return res.status(400).json({
        message: "Insufficient funds.",
      });
    }

    user.money_balance.value -= ticket.ticket_price.value;
    user.bought_tickets.push(ticketId);

    await user.save();

    res.status(200).json({ message: "Ticket purchased successfully" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// const UPDATE_USER = async (req, res) => {
//   try {
//     const user = await UserModel.updateOne(
//       { _id: req.params.id },
//       { ...req.body },
//       { new: true }
//     );

//     if (user.nModified === 0) {
//       return res
//         .status(404)
//         .json({ message: "User not found or modified during the update." });
//     }
//     res.status(200).json({ message: "User updated successfully" });
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({ message: "Something went wrong on the server." });
//   }
// };

export {
  SIGN_UP,
  LOGIN,
  UPDATE_JWT,
  GET_ALL_USERS,
  GET_USER_BY_ID,
  BUY_TICKET,
  // UPDATE_USER,
};
