import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Array, required: true }, // array of {sender, text}
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
