import { Schema, model, models } from 'mongoose';

const scrapTransactionSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'ScrapCategory', required: true },
  kilos: { type: Number, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  clerkUserId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'completed' 
  },
  paymentMethod: String
});

export default models.ScrapTransaction || model('ScrapTransaction', scrapTransactionSchema);