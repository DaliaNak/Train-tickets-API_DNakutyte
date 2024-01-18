import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true, min: 3 },
  email: { type: String, required: true, min: 3 },
  password: { type: String, required: true, min: 3 },
  bought_tickets: { type: [String], required: true },
  money_balance: {
    value: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["Eur", "USD", "GBP"] },
  },
});

export default mongoose.model("User", userSchema);
