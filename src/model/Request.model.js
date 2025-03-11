
import { Schema, model } from "mongoose"


const requestSchema = new Schema({
    invoiceNumber: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: { type: String, required: true },
    branchType: { type: String, required: true },
    destination: { type: String, default: "وزارة العدل" },
    firstWitnesses: { userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, status: { type: Boolean } },
    secWitnesses: { userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, status: { type: Boolean } },
    Sheikh: { userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, status: { type: Boolean } },
    orderNumber: { type: Number, required: true },
    orderStatus: { type: String },
    picOfReq: { type: { secure_url: String, public_id: String }, required: true },
    statusWitnesses: String,
    givenNumber: String,
    givenExpier: Date,
    docAuthenticationNumber: String,
    feeStatus: { type: Boolean, default: false }
}, { timestamps: true })

const Requset = model("Requset", requestSchema);
export default Requset
