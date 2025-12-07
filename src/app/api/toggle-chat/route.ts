import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            { status: 401 }
        );
    }

    const userId = user._id;
    const { isLiveChatActive } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isLiveChatActive },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Live chat status updated successfully",
                isLiveChatActive: updatedUser.isLiveChatActive,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating live chat status", error);
        return Response.json(
            {
                success: false,
                message: "Error updating live chat status",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            { status: 401 }
        );
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                isLiveChatActive: foundUser.isLiveChatActive,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching live chat status", error);
        return Response.json(
            {
                success: false,
                message: "Error fetching live chat status",
            },
            { status: 500 }
        );
    }
}
