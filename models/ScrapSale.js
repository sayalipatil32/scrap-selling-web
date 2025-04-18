import { Schema, model, models } from 'mongoose';

const scrapSaleSchema = new Schema({
  scrapType: { type: String, required: true },
  kilos: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: String,
  sellerId: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default models.ScrapSale || model('ScrapSale', scrapSaleSchema);