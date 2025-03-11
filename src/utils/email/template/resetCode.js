export const resetCodeHtml = ({ name, code }) => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رمز التحقق من Mostaql</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Amiri:wght@700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Tajawal', 'Arial', sans-serif; background: #f1f5f9; margin: 0; padding: 40px; direction: rtl;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background: #ffffff; border-radius: 30px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08); overflow: hidden; border: 1px solid #dbeafe;">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 60px 20px; background: linear-gradient(135deg, #1e40af, #60a5fa); position: relative;">
                <div style="position: absolute; top: 20px; right: 20px; width: 70px; height: 70px; background: rgba(255, 255, 255, 0.15); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: 20px; left: 20px; width: 50px; height: 50px; background: rgba(255, 255, 255, 0.25); border-radius: 50%;"></div>
                <h1 style="font-family: 'Amiri', serif; font-size: 36px; color: #ffffff; font-weight: 700; margin: 0; text-shadow: 0 4px 15px rgba(0, 0, 0, 0.25); background: rgba(255, 255, 255, 0.2); padding: 15px 30px; border-radius: 15px; position: relative; z-index: 1;">مرحبًا ${name}!</h1>
                <div style="font-size: 18px; color: #dbeafe; margin-top: 10px; font-weight: 500;">رمز التحقق الخاص بك في Mostaql</div>
            </td>
        </tr>
        <!-- Content -->
        <tr>
            <td align="center" style="padding: 70px 50px; background: #ffffff; color: #1e293b; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #1e40af, #60a5fa);"></div>
                <p style="font-size: 20px; line-height: 1.9; margin: 0 0 30px; padding: 0 20px; color: #475569;">استخدم الرمز التالي لتفعيل حسابك:</p>
                <div style="background: #f0f8ff; color: #1e40af; font-size: 40px; font-weight: 700; padding: 35px 60px; border-radius: 20px; display: inline-block; box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1); letter-spacing: 10px; border: 4px solid #60a5fa; position: relative; transition: transform 0.3s ease;">
                    <span style="position: absolute; top: -20px; left: 30px; background: #1e40af; color: #fff; font-size: 16px; padding: 8px 15px; border-radius: 30px; box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);">رمزك</span>
                    ${code}
                </div>
                <p style="font-size: 18px; color: #60a5fa; margin: 35px 0 0; font-weight: 700; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);"><span style="font-size: 24px;">⏳</span> صالح لمدة 10 دقائق فقط!</p>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td align="center" style="padding: 60px 20px; background: #f9fafb; color: #6b7280; border-top: 1px solid #dbeafe;">
                <p style="font-size: 16px; margin: 0 0 25px;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
                <p style="font-size: 16px; margin: 0 0 25px;">فريق <strong style="color: #1e40af;">Mostaql</strong> معك دائمًا!</p>
                <p style="font-size: 16px; margin: 0;"><a href="mailto:support@Mostaql.com" style="color: #60a5fa; text-decoration: none; font-weight: 700; border-bottom: 2px solid #60a5fa; padding-bottom: 2px; transition: all 0.3s ease;">support@Mostaql.com</a></p>
                <div style="margin-top: 30px;">
                    <span style="font-size: 14px; color: #ffffff; background: #1e40af; padding: 8px 20px; border-radius: 30px; margin: 0 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">تابعنا</span>
                    <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-weight: 500; transition: color 0.3s ease;">تويتر</a>
                    <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-weight: 500; transition: color 0.3s ease;">إنستغرام</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
}