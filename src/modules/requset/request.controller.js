import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import { confirmReq, details,  elshahada , getReqs, orderNumber, sendRequest } from "./request.service.js";
import { fileValid, uploadFile } from "../../utils/multer/multer.cloud.js";
import * as schema from "./requset.valid.js";
const router = Router();
router.post("/", uploadFile([...fileValid.image, ...fileValid.document]).single("picOfReq"), asyncHandler(sendRequest))
router.put("/", asyncHandler(getReqs))
router.patch("/confirm", asyncHandler(confirmReq))
router.get("/orderNumber", asyncHandler(orderNumber))
router.put("/shahada", asyncHandler(elshahada))
router.put("/details/:id", asyncHandler(details))
export default router