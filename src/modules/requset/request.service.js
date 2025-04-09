import ImageModel from "../../model/Image.model.js";
import Requset from "../../model/Request.model.js"
import User from "../../model/User.model.js"
import { cloud } from "../../utils/multer/cloudinary.js";
import Randomstring from "randomstring";
import axios from "axios";
import fs from "node:fs"
// import PDFDocument from 'pdfkit';
import QRCode from "qrcode"
import path from "node:path"
import { fileURLToPath } from "url";
import * as fontkit from 'fontkit';
import { PDFDocument, rgb } from 'pdf-lib';
import { messageSystem } from "../../utils/index.js";
import sharp from "sharp";
import moment from "moment-hijri";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function generateCustomString() {
    const letters = Randomstring.generate({ length: 5, charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
    const numbers = Randomstring.generate({ length: 6, charset: "0123456789" });
    return `${letters}-${numbers}`;
}


export const sendRequest = async (req, res, next) => {
    const { userId, documentType, branchType, firstWitnesses, secWitnesses, Sheikh, orderNumber } = req.body;
    const { secure_url, public_id } = await cloud().uploader.upload(req.file.path, { folder: "MOSTAQL" })
    const generateNum = generateCustomString();
    const dateExpier = new Date(); // تاريخ اليوم الحالي
    dateExpier.setMonth(dateExpier.getMonth() + 1); // إضافة شهر

    const data = {
        userId,
        documentType,
        branchType,
        firstWitnesses: { userId: firstWitnesses },
        secWitnesses: { userId: secWitnesses },
        Sheikh: { userId: Sheikh }, orderNumber, picOfReq: { secure_url, public_id },
        docAuthenticationNumber: generateNum,
        givenExpier: dateExpier
    }
    const requset = await Requset.create(data)
    await Promise.all([
        User.updateOne({ _id: firstWitnesses }, { $push: { myRequests: requset._id } }),
        User.updateOne({ _id: secWitnesses }, { $push: { myRequests: requset._id } }),
        User.updateOne({ _id: userId }, { $push: { myRequests: requset._id } }),


    ]);
    return res.status(201).json({ success: true, message: "Created Successfully" })
}

export const getReqs = async (req, res, next) => {
    const { id } = req.body
    const user = await User.findById(id)
    // console.log(user)
    if (!user) {
        return next(new Error("User Not Found"))
    }
    if (user.confirmEmail) {
        return next(new Error("Please Active Account Frist"))
    }
    let respons = [];
    if (user.role == "afrad") {
        await user.populate([{
            path: "myRequests",
            select: "orderNumber documentType branchType firstWitnesses secWitnesses Sheikh createdAt picOfReq docAuthenticationNumber",
            populate: [{ path: "firstWitnesses.userId", select: "userName status" }, { path: "secWitnesses.userId", select: "userName status" }, { path: "Sheikh.userId", select: "userName status" }],
            options: { sort: { createdAt: -1 } }
        }])
        // console.log(user.myRequests)
        const myUser = user.toObject()
        respons = myUser.myRequests;
        for (let request of respons) {
            if (request.docAuthenticationNumber) {
                const imageData = await ImageModel.findOne({ givenNumber: request.docAuthenticationNumber });
                // console.log(imageData)
                if (imageData) {
                    request.pdfUrl = imageData.pdfUrl;
                    console.log(request)

                }
            }
        }
    } else if (user.role == "shahd") {
        await user.populate([{
            path: "myRequests",
            select: "orderNumber userId documentType createdAt picOfReq",
            populate: [{ path: "userId", select: "userName" }],
            options: { sort: { createdAt: -1 } }
        }])
        respons = user.myRequests

    } else if (user.role == "she5") {

        await user.populate([{
            path: "myRequests",
            select: "orderNumber userId firstWitnesses secWitnesses documentType createdAt picOfReq Tribe docAuthenticationNumber givenExpier Sheikh destination",
            populate: [
                { path: "userId", select: "userName" },
                { path: "firstWitnesses.userId", select: "userName phone" },
                { path: "secWitnesses.userId", select: "userName phone" },
                { path: "Sheikh.userId", select: "userName phone" },

            ],
            options: { sort: { createdAt: -1 } }
        }])
        // console.log(user.myRequests);
        const myUser = user.toObject()
        respons = myUser.myRequests;

        respons = respons.map((obj) => {
            // console.log(obj);

            if (obj.firstWitnesses.status && obj.secWitnesses.status) {
                obj.success = true
                return obj
            } else {
                obj.success = false
                return obj
            }
        })
    } else {
        return next(new Error("Server Error"))
    }
    res.status(200).json({ success: true, data: respons });
}


export const confirmReq = async (req, res, next) => {
    const { userId, reqId, status } = req.body;
    const requset = await Requset.findById(reqId)
    const user = await User.findByIdAndUpdate({ _id: userId }, { $pull: { myRequests: requset._id } }, { new: true });
    // console.log(requset)
    if (!user)
        return next(new Error(messageSystem.user.notFound, { cause: 404 }))
    if (!requset) return next(new Error("Requset Not Found"))
    if (requset.firstWitnesses.userId.toString() === userId) {
        requset.firstWitnesses.status = status
    } else if (requset.secWitnesses.userId.toString() === userId) {
        requset.secWitnesses.status = status
        console.log("__________________");

    } else if (requset.Sheikh.userId.toString() === userId) {
        console.log("________________");

        if (status) {
            requset.Sheikh.status = status;
            const currentDate = requset.givenExpier
            requset.feeStatus = true;
            console.log("__________________");

            // جلب البيانات من الـ populate
            await requset.populate([
                { path: "userId", select: "signaturePic userName phone" },
                { path: "firstWitnesses.userId", select: "signaturePic userName phone" },
                { path: "secWitnesses.userId", select: "signaturePic userName phone" },
                { path: "Sheikh.userId", select: "signaturePic userName phone" },
            ]);

            const imageUrl = requset.picOfReq.secure_url;
            const qrSourceUrlShkikh = user.signaturePic.secure_url;
            let qrSourceUrlFirstWitnesses = null;
            let qrSourceUrlSecWitnesses = null;
            const newImage = new ImageModel({
                givenNumber: requset.docAuthenticationNumber,
                imageUrl,
                qrSourceUrlShkikh,
                qrSourceUrlFirstWitnesses,
                qrSourceUrlSecWitnesses,
            });
            if (requset.firstWitnesses.status === true) {
                qrSourceUrlFirstWitnesses = requset.firstWitnesses.userId.signaturePic.secure_url;

                if (!qrSourceUrlFirstWitnesses || typeof qrSourceUrlFirstWitnesses !== 'string') {
                    throw new Error('Invalid QR source URL for first witness');
                }

                await QRCode.toFile('qr2.png', qrSourceUrlFirstWitnesses);
                const qrResult2 = await cloud().uploader.upload('qr2.png', { folder: 'qrcodes' });
                newImage.qrCodeUrl2 = qrResult2.secure_url;
                fs.unlinkSync('qr2.png');
            }

            if (requset.secWitnesses.status === true) {
                qrSourceUrlSecWitnesses = requset.secWitnesses.userId.signaturePic.secure_url;

                if (!qrSourceUrlSecWitnesses || typeof qrSourceUrlSecWitnesses !== 'string') {
                    throw new Error('Invalid QR source URL for second witness');
                }

                await QRCode.toFile('qr3.png', qrSourceUrlSecWitnesses);
                const qrResult3 = await cloud().uploader.upload('qr3.png', { folder: 'qrcodes' });
                newImage.qrCodeUrl3 = qrResult3.secure_url;
                fs.unlinkSync('qr3.png');
            }
            console.log({
                imageUrl,
                qrSourceUrlFirstWitnesses,
                qrSourceUrlSecWitnesses,
                qrSourceUrlShkikh
            });

            // 1. حفظ البيانات الأولية في MongoDB
            await newImage.save();
            console.log(1);

            // 2. إنشاء Thumbnail من imageUrl
            const getPublicId = (url) => {
                const parts = url.split('/');
                const uploadIndex = parts.indexOf('upload');
                return parts.slice(uploadIndex + 2).join('/').split('.')[0];
            };
            const thumbnailUrl = cloud().url(getPublicId(imageUrl), {
                width: 300,
                height: 300,
                crop: 'scale',
                quality: 100,
                fetch_format: 'png'
            });
            console.log(2);
            console.log(thumbnailUrl)

            // try {   // 3. إنشاء الـ QR Codes باستخدام qrcode
            //     const thumbnailResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
            //     console.log('Thumbnail fetched successfully, size:', thumbnailResponse.data.length);
            // } catch (error) {
            //     console.error('Error fetching thumbnail:', error.message);
            // }cloudinary

            const qrCodePath1 = 'qr1.png';
            const qrCodePath2 = 'qr2.png';
            const qrCodePath3 = 'qr3.png';

            let qrResult1 = null;
            let qrResult2 = null;
            let qrResult3 = null;
            await QRCode.toFile(qrCodePath1, qrSourceUrlShkikh);
            console.log(3);

            if (fs.existsSync(qrCodePath1)) {
                qrResult1 = await cloud().uploader.upload(qrCodePath1, { folder: 'qrcodes' });
                newImage.qrCodeUrl1 = qrResult1.secure_url;
            }

            // Upload QR2 if exists
            if (fs.existsSync(qrCodePath2)) {
                qrResult2 = await cloud().uploader.upload(qrCodePath2, { folder: 'qrcodes' });
                newImage.qrCodeUrl2 = qrResult2.secure_url;
            }

            // Upload QR3 if exists
            if (fs.existsSync(qrCodePath3)) {
                qrResult3 = await cloud().uploader.upload(qrCodePath3, { folder: 'qrcodes' });
                newImage.qrCodeUrl3 = qrResult3.secure_url;
            }
            console.log(4);

            try {
                console.log("Step 4: Defining QR Code URLs");
                const qrCodeUrl1 = qrResult1 ? qrResult1.secure_url : null;
                const qrCodeUrl2 = qrResult2 ? qrResult2.secure_url : null;
                const qrCodeUrl3 = qrResult3 ? qrResult3.secure_url : null;

                // تحميل النموذج الأصلي
                console.log("Step 5: Loading PDF template");
                const templatePath = path.join(__dirname, 'وي.pdf');
                if (!fs.existsSync(templatePath)) {
                    throw new Error('Template PDF not found at: ' + templatePath);
                }
                const pdfBytes = fs.readFileSync(templatePath);
                const pdfDoc = await PDFDocument.load(pdfBytes);

                // إضافة fontkit لـ pdf-lib
                console.log("Step 6: Registering fontkit");
                pdfDoc.registerFontkit(fontkit);

                // إضافة خط عربي
                console.log("Step 7: Embedding Arabic font");
                const fontPath = path.join(__dirname, 'fonts', 'Arial.ttf');
                if (!fs.existsSync(fontPath)) {
                    throw new Error('Font file not found at: ' + fontPath);
                }
                const fontBytes = fs.readFileSync(fontPath);
                const arabicFont = await pdfDoc.embedFont(fontBytes);

                console.log("Step 8: Drawing text on PDF");
                const page = pdfDoc.getPage(0);
                page.drawText(`${requset.createdAt.toLocaleDateString('ar-EG')}`, {
                    x: 663.00,
                    y: 269.00,
                    size: 12,
                    font: arabicFont,
                    color: rgb(0, 0, 0),
                });
                console.log(5); // هذا السطر يجب أن يظهر الآن إذا نجح كل شيء
            } catch (error) {
                console.error("Error in PDF generation:", error.message, error.stack);
                throw error; // إعادة رمي الخطأ لمعالجته في المستوى الأعلى
            }

            // إضافة الـ QR Codes
            if (qrCodeUrl1) {
                try {
                    const qrImage1 = await axios.get(qrCodeUrl1, { responseType: 'arraybuffer' }).then(res => res.data);
                    const qrPng1 = await pdfDoc.embedPng(qrImage1);
                    page.drawImage(qrPng1, { x: 305, y: 62.00, width: 45, height: 45 });
                    console.log("QR1 added successfully");
                } catch (error) {
                    console.error("Failed to add QR1:", error.message);
                }
            } else {
                console.log("qrCodeUrl1 is null, skipping QR1");
            }

            if (qrSourceUrlFirstWitnesses && qrCodeUrl2) {
                try {
                    const qrImage2 = await axios.get(qrCodeUrl2, { responseType: 'arraybuffer' }).then(res => res.data);
                    const qrPng2 = await pdfDoc.embedPng(qrImage2);
                    page.drawImage(qrPng2, { x: 390, y: 62.00, width: 45, height: 45 });
                    console.log("QR2 added successfully");
                } catch (error) {
                    console.error("Failed to add QR2:", error.message);
                }
            } else {
                console.log("qrCodeUrl2 or qrSourceUrlFirstWitnesses is null, skipping QR2");
            }

            if (qrSourceUrlSecWitnesses && qrCodeUrl3) {
                try {
                    const qrImage3 = await axios.get(qrCodeUrl3, { responseType: 'arraybuffer' }).then(res => res.data);
                    const qrPng3 = await pdfDoc.embedPng(qrImage3);
                    page.drawImage(qrPng3, { x: 467, y: 62.00, width: 45, height: 45 });
                    console.log("QR3 added successfully");
                } catch (error) {
                    console.error("Failed to add QR3:", error.message);
                }
            } else {
                console.log("qrCodeUrl3 or qrSourceUrlSecWitnesses is null, skipping QR3");
            }

            console.log(6); // نقطة تتبع جديدة

        const qrPng1 = await pdfDoc.embedPng(qrImage1);
        if (qrSourceUrlFirstWitnesses) {
            const qrImage2 = await axios.get(newImage.qrCodeUrl2, { responseType: 'arraybuffer' }).then(res => res.data);
            const qrPng2 = await pdfDoc.embedPng(qrImage2);
            page.drawImage(qrPng2, { x: 390, y: 62.00, width: 45, height: 45 });
        }
        if (qrSourceUrlSecWitnesses) {
            const qrImage3 = await axios.get(newImage.qrCodeUrl3, { responseType: 'arraybuffer' }).then(res => res.data);
            const qrPng3 = await pdfDoc.embedPng(qrImage3);
            page.drawImage(qrPng3, { x: 467, y: 62.00, width: 45, height: 45 });
        }
        console.log(7);

        page.drawImage(qrPng1, { x: 305, y: 62.00, width: 45, height: 45 });
        page.drawImage(qrPng2, { x: 390, y: 62.00, width: 45, height: 45 });
        page.drawImage(qrPng3, { x: 467, y: 62.00, width: 45, height: 45 });

        // إضافة الـ Thumbnail
        try {
            // التحقق من عنوان URL
            if (!thumbnailUrl || !thumbnailUrl.startsWith('http')) {
                throw new Error('عنوان URL للصورة المصغرة غير صالح');
            }

            // جلب الصورة باستخدام axios
            const thumbnailResponse = await axios.get(thumbnailUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'Accept': 'image/*',
                    'Cache-Control': 'no-cache'
                }
            });

            let thumbnailImage = Buffer.from(thumbnailResponse.data);
            console.log('حجم المخزن المؤقت للصورة:', thumbnailImage.length);

            const magicNumbers = thumbnailImage.toString('hex', 0, 8);
            console.log('الأرقام السحرية:', magicNumbers);

            let thumbnailEmbedded;

            if (magicNumbers.startsWith('89504e47')) {
                // PNG
                thumbnailEmbedded = await pdfDoc.embedPng(thumbnailImage);
            } else if (magicNumbers.startsWith('ffd8ff')) {
                // JPEG - التحقق من صلاحية JPEG وإصلاحه إذا لزم الأمر
                try {
                    thumbnailEmbedded = await pdfDoc.embedJpg(thumbnailImage);
                } catch (jpegError) {
                    console.log('الصورة JPEG تالفة، يتم إصلاحها باستخدام sharp:', jpegError.message);
                    thumbnailImage = await sharp(thumbnailImage)
                        .jpeg() // تحويل إلى JPEG صالح
                        .toBuffer();
                    thumbnailEmbedded = await pdfDoc.embedJpg(thumbnailImage);
                }
            } else {
                // تنسيق غير مدعوم، تحويله إلى PNG
                console.log('تنسيق غير مدعوم، يتم التحويل إلى PNG:', magicNumbers);
                thumbnailImage = await sharp(thumbnailImage)
                    .png()
                    .toBuffer();
                thumbnailEmbedded = await pdfDoc.embedPng(thumbnailImage);
            }

            page.drawImage(thumbnailEmbedded, {
                x: 70,
                y: 230.33,
                width: 150,
                height: 150
            });
        } catch (error) {
            console.error('خطأ في معالجة الصورة المصغرة:', {
                message: error.message || 'خطأ غير محدد',
                url: thumbnailUrl,
                stack: error.stack || 'لا يوجد تتبع للخطأ'
            });
            throw new Error('فشل في تضمين الصورة المصغرة: ' + (error.message || 'خطأ غير محدد'));
        }

        // إضافة البيانات بدل "الثراجة"
        let yPosition = 600;
        page.drawText(`${requset.userId.userName}`, {
            x: 663.00,
            y: 430.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        page.drawText(`${requset.docAuthenticationNumber}`, {
            x: 663.00,
            y: 321.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(`${currentDate.toLocaleDateString('ar-EG')}`, {
            x: 663.00,
            y: 218.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(`${requset.Sheikh.userId.userName || 'غير متوفر'}`, {
            x: 663.00,
            y: 61.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        page.drawText(`${requset.documentType || 'غير متوفر'}`, {
            x: 663.00,
            y: 375.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(`${requset.firstWitnesses.userId.userName || 'غير متوفر'}`, {
            x: 663.00,
            y: 167.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(` ${requset.secWitnesses.userId.userName || 'غير متوفر'}`, {
            x: 663.00,
            y: 113.00,
            size: 12,
            font: arabicFont,
            color: rgb(0, 0, 0),
        });

        // حفظ الـ PDF المعدل
        const pdfBytesModified = await pdfDoc.save();
        fs.writeFileSync('output.pdf', pdfBytesModified);
        console.log(9);

        console.log('PDF generated at:', 'output.pdf');
        const stats = fs.statSync('output.pdf');
        console.log('حجم الملف:', stats.size, 'بايت');
        const pdfResult = await cloud().uploader.upload('output.pdf', {
            resource_type: 'raw',
            folder: 'pdfs',
        });
        const pdfUrl = pdfResult.secure_url;
        console.log('Uploaded PDF URL:', pdfUrl);

        newImage.qrCodeUrl1 = qrCodeUrl1;
        newImage.qrCodeUrl2 = qrCodeUrl2;
        newImage.qrCodeUrl3 = qrCodeUrl3;
        newImage.pdfUrl = pdfUrl;
        await newImage.save();

        fs.unlinkSync('output.pdf');
        fs.unlinkSync(qrCodePath1);
        fs.unlinkSync(qrCodePath2);
        fs.unlinkSync(qrCodePath3);
    } else {
        requset.Sheikh.status = false;
    }
} else {
    return next(new Error("Server Error"))
    }

console.log(requset);
if (requset.secWitnesses.status != undefined && requset.firstWitnesses.status != undefined && requset.Sheikh.status == undefined) {

    await User.updateOne({ _id: requset.Sheikh.userId }, { $addToSet: { myRequests: requset._id } })
}
await requset.save()

let respons = [];
if (user.role == "afrad") {
    await user.populate([{
        path: "myRequests",
        select: "orderNumber documentType branchType firstWitnesses secWitnesses Sheikh createdAt picOfReq",
        populate: [{ path: "firstWitnesses.userId", select: "userName status" }, { path: "secWitnesses.userId", select: "userName status" }, { path: "Sheikh.userId", select: "userName status" }]
    }])
    respons = user.myRequests;
} else if (user.role == "shahd") {
    await user.populate([{
        path: "myRequests",
        select: "orderNumber userId documentType createdAt picOfReq",
        populate: [{ path: "userId", select: "userName" }]
    }])
    console.log({ user });
    console.log({ Data: user.myRequests });

    respons = user.myRequests
} else if (user.role == "she5") {
    console.log("fgfgfg");

    await user.populate([{
        path: "myRequests",
        select: "orderNumber userId firstWitnesses secWitnesses documentType createdAt picOfReq",
        populate: [{ path: "userId", select: "userName" }]
    }])
    console.log(user.myRequests);
    const myUser = user.toObject()
    respons = myUser.myRequests;

    respons = respons.map((obj) => {
        console.log(obj);

        if (obj.firstWitnesses.status && obj.secWitnesses.status) {
            obj.success = true
            return obj
        } else {
            obj.success = false
            return obj
        }
    })
} else {
    return next(new Error("Server Error"))
}

await user.save()


return res.status(200).json({ success: true, data: respons })

}


export const orderNumber = async (req, res, next) => {
    const count = await Requset.countDocuments()
    return res.status(200).json({ success: true, orderNumber: count + 1 })
}


export const elshahada = async (req, res, next) => {

    const { search, id } = req.body;
    console.log({ search, id });
    if (!search || !id)
        return next(new Error("plz enter all data"))
    const cheak = await User.findById(id);
    if (cheak.role != "hkoma")
        return next(new Error(messageSystem.user.notAuthorized, { cause: 401 }))
    const shada = await ImageModel.findOne({ givenNumber: search }).select("pdfUrl");
    if (!shada)
        return next(new Error("لا يوجد شهاده ب هذه الرقم التصديق", { cause: 404 }))
    return res.status(200).json({ success: true, data: shada })

}


export const details = async (req, res, next) => {
    const { id } = req.params;
    const { token } = req.headers;
    const user = await User.findById(token);
    if (!user)
        return next(new Error(messageSystem.user.notFound, { cause: 404 }))
    const request = await Requset.findById(id)
        .select("destination documentType branchType userId firstWitnesses secWitnesses docAuthenticationNumber givenExpier createdAt Sheikh picOfReq")
        .populate([
            { path: "userId", select: "area Tribe userName" },
            { path: "firstWitnesses.userId", select: "userName phone" },
            { path: "secWitnesses.userId", select: "userName phone" },
            { path: "Sheikh.userId", select: "userName _id" }
        ]).lean();
    if (!request)
        return next(new Error("Requset Not Found", { cause: 404 }))
    console.log(request);

    if (request.Sheikh.userId._id.toString() !== token)
        return next(new Error(messageSystem.user.notAuthorized, { cause: 401 }))
    if (request.firstWitnesses.status && request.secWitnesses.status)
        request.success = true
    else
        request.success = false

    const startDate = request.createdAt ? new Date(request.createdAt).toLocaleDateString("en-GB") : "غير متوفر";
    const endDate = request.givenExpier ? new Date(request.givenExpier).toLocaleDateString("en-GB") : "غير متوفر";
    // تحويلها إلى هجري
    const startHijri = moment(startDate, "DD/MM/YYYY").format("iYYYY-iMM-iDD هـ");
    const endHijri = moment(endDate, "DD/MM/YYYY").format("iYYYY-iMM-iDD هـ");

    // تنسيق النتيجة النهائية 

    request.validity = `${startHijri} - ${endHijri} / ${startDate} - ${endDate}`;

    return res.status(200).json({ success: true, data: request })


}   