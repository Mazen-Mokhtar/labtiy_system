import EventEmitter from "events";
import { sendEmail } from "../email/sendEmail.js";
import { resetCodeHtml } from "../email/template/resetCode.js";
import Randomstring from "randomstring";
export const eventForget = new EventEmitter();
eventForget.on("forget", async ({ email, user }) => {
    try {
        user.confirmCode = Randomstring.generate({ length: 5, charset: "numeric" })
        await user.save();
        console.log({ email, user })
        const html = resetCodeHtml({ name: user.userName, code: user.confirmCode })
        sendEmail({ to: email, html })
    } catch (error) {
        console.log(error.message)
    }

})