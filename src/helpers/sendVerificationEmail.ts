import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/Verificationemails";
import { ApiResponse } from "@/types/apiResponse";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Anaynomous msg | Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: false, message: "Verificaton email sent successfully" };
  } catch (error) {
    console.error("Error sending Verification Email", error);
    return { success: false, message: "Failed to send verificaton email" };
  }
};
