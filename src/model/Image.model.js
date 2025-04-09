import { Schema, model } from "mongoose";

const ImageSchema = new Schema({
    givenNumber: { type: String, required: true },
    imageUrl: { type: String, required: true }, // رابط الصورة الأصلية للـ thumbnail
    qrSourceUrlShkikh: { type: String, required: true }, // أول URL للـ QR Code
    qrSourceUrlFirstWitnesses: { type: String }, // تاني URL للـ QR Code
    qrSourceUrlSecWitnesses: { type: String }, // تالت URL للـ QR Code
    qrCodeUrl1: { type: String }, // رابط أول QR Code
    qrCodeUrl2: { type: String }, // رابط تاني QR Code
    qrCodeUrl3: { type: String }, // رابط تالت QR Code
    pdfUrl: { type: String }, // رابط الـ PDF الناتج
    createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
});

const ImageModel = model('Image', ImageSchema);
export default ImageModel