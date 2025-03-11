import User from "../../model/User.model.js";
import { eventForget } from "../../utils/event/forget-password.js";
import { messageSystem } from "../../utils/index.js";
import { cloud } from "../../utils/multer/cloudinary.js";






export const confirmCode = async (req, res, next) => {
    const { code, id } = req.body;
    const user = await User.findOne({ _id: id, confirmCode: code });
    if (!user) return next(new Error("User Not Found", { cause: 409 }))
    user.confirmCode = undefined
    await user.save()
    return res.status(200).json({ success: true })
}

export const code = async (req, res, next) => {
    const { id } = req.body
    const user = await User.findById(id)
    if (!user) return next(new Error("User Not Found", { cause: 404 }));
    eventForget.emit("forget", { email: user.email, user });
    return res.status(200).json({ success: true, message: messageSystem.user.resetCode })
}


export const signup = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.create(req.body);
    return res.status(201).json({ success: true, message: messageSystem.user.emailActive });
}

export const cheakRoleShahd = async (req, res, next) => {
    const { id, phone } = req.body;
    const user = await User.findOne({ _id: id, phone: phone });
    if (!user) return next(new Error(messageSystem.user.notFound))
    if (user.role !== "shahd")
        return next(new Error(messageSystem.user.notAuthorized))
    return res.status(200).json({ success: true, data: { userName: user.userName } })
}

export const uploadSignature = async (req, res, next) => {
    const { id } = req.body;
    const user = await User.findById(id);
    if (!user)
        return next(new Error(messageSystem.user.notFound, { cause: 404 }))
    if (user.role == "afrad")
        return next(new Error(messageSystem.user.notAuthorized, { cause: 401 }))
    const { secure_url, public_id } = await cloud().uploader.upload(req.file.path, { folder: "MOSTAQL" })
    user.signaturePic = { secure_url, public_id }
    user.save()
    return res.status(200).json({ success: true })
}