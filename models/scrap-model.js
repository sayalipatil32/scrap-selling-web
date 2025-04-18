import mongoose from 'mongoose';

const scrapSchema = new mongoose.Schema({
  category: { type: String, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Scrap = mongoose.models.Scrap || mongoose.model('Scrap', scrapSchema);

export default Scrap;
