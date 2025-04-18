import { Schema, model, models } from 'mongoose';

const scrapCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  ratePerKg: { type: Number, required: true },
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.ScrapCategory || model('ScrapCategory', scrapCategorySchema);