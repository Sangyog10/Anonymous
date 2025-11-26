// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/Verificationemails";
// import { ApiResponse } from "@/types/apiResponse";

// export async function sendVerificationEmail(
//   email: string,
//   username: string,
//   verifyCode: string
// ): Promise<ApiResponse> {
//   try {
//     await resend.emails.send({
//       from: "noreply <onboarding@resend.dev>",
//       to: email,
//       subject: "Mystery Message Verification Code",
//       react: VerificationEmail({ username, otp: verifyCode }),
//     });
//     return { success: true, message: "Verification email sent successfully." };
//   } catch (emailError) {
//     console.error("Error sending verification email:", emailError);
//     return { success: false, message: "Failed to send verification email." };
//   }
// }

import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/apiResponse";
import VerificationEmail from "../../emails/Verificationemails";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const emailHtml = await render(
      VerificationEmail({ username, otp: verifyCode })
    );

    await transporter.sendMail({
      from: `"Mystery App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Mystery Message Verification Code",
      html: emailHtml,
    });

    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError: unknown) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}
