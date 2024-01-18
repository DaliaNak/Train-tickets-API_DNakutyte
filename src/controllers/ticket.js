import TicketModel from "../models/ticket.js";

const GET_ALL_TICKETS = async (req, res) => {
  try {
    const tickets = await TicketModel.find();
    return res.status(200).json({ tickets: tickets });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

const INSERT_TICKET = async (req, res) => {
  try {
    const ticket = new TicketModel({
      title: req.body.title,
      ticket_price: {
        value: req.body.ticket_price.value,
        currency: req.body.ticket_price.currency,
      },
      from_location: req.body.from_location,
      to_location: req.body.to_location,
      to_location_photo_url: req.body.to_location_photo_url,
    });

    const response = await ticket.save();

    return res
      .status(201)
      .json({ message: "Ticket was added", response: response });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong on the server." });
  }
};

export { GET_ALL_TICKETS, INSERT_TICKET };
