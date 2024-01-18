import mongoose from "mongoose";

const ticketSchema = mongoose.Schema({
  title: { type: String, required: true, min: 3 },
  ticket_price: {
    value: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["Eur", "USD", "GBP"] },
  },
  from_location: { type: String, required: true, min: 3 },
  to_location: { type: String, required: true, min: 3 },
  to_location_photo_url: { type: String, required: true, min: 3 },
});

export default mongoose.model("Ticket", ticketSchema);
