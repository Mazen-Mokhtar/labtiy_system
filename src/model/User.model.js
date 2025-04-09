import { model, Schema } from "mongoose";
import validator from "validator"
import { messageSystem } from "../utils/messages/index.js";
const userSchema = new Schema(
    {
        userName:
        {
            type: String,
            minlength: 2,
            maxlength: 60,
            required: true
        },
        email:
        {
            type: String,
            required: true,
            validate:
            {
                validator: validator.isEmail,
                message: messageSystem.errors.email.invalid
            }
        },
        password:
        {
            type: String,
            minlength: 8,
            validate: {
                validator: validator.isStrongPassword,
                message: messageSystem.errors.password.weak
            }
        },
        phone:
        {
            type: String,
            required: true
        },
        area: { type: String, required: true },
        typeShe5: { type: String },
        Tribe:
        {
            type: String, default: function () {
                const name = this.userName.split(" ")
                return name[name.length - 1]
            }
        },
        responseSpeed: { type: String },
        customerReviews: [{ type: Schema.Types.ObjectId, ref: "User" }],
        role:
        {
            type: String,
            enum: ["shahd", "she5", "afrad"],
            default: "afrad"
        },
        signaturePic: { type: { secure_url: String, public_id: String } },
        confirmEmail:
        {
            type: Boolean,
            default: false
        },
        myRequests: [{ type: Schema.Types.ObjectId, ref: "Requset" }],
        isDeleted:
        {
            type: Boolean,
            default: false
        },
        confirmCode: {
            type: String
        }
    }, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {

            if (ret.DOB) { ret.DOB = ret.DOB.toLocaleDateString("en-GB") }
            return ret
        }
    }
})

const User = model("User", userSchema);
export default User;