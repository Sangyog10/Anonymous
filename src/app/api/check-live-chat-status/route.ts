import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
        return Response.json(
            {
                success: false,
                message: "Username is required",
            },
            { status: 400 }
        );
    }

    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
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
                isLiveChatActive: user.isLiveChatActive,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking live chat status", error);
        return Response.json(
            {
                success: false,
                message: "Error checking live chat status",
            },
            { status: 500 }
        );
    }
}
