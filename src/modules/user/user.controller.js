import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as schema from "./user.valid.js";
import { asyncHandler } from "../../utils/index.js";
import { cheakRoleShahd, code, confirmCode, signup, uploadSignature } from "./user.service.js";
import { fileValid, uploadFile } from "../../utils/multer/multer.cloud.js";
const router = Router();

router.patch("/login", validation(schema.code), asyncHandler(code))
router.patch("/confirm", validation(schema.confirmCode), asyncHandler(confirmCode))
router.post("/signup", asyncHandler(signup));
router.post("/cheak", asyncHandler(cheakRoleShahd));
router.post("/signature", uploadFile(fileValid.image).single("imageSignature"), asyncHandler(uploadSignature))
export default router