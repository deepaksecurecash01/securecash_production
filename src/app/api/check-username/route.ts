import { connectMongo } from "@/utils/connectMongo";
import { NextResponse } from "next/server";
import mongoose, { Model } from "mongoose";

interface IContact {
  Username?: string;
  [key: string]: unknown;
}

interface CheckUsernameRequestBody {
  username?: string;
}

const contactSchema = new mongoose.Schema<IContact>(
  {},
  { collection: "contacts", strict: false },
);
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);

// Escape regex metacharacters so user input is always treated as a literal string.
const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: CheckUsernameRequestBody = await request.json();
    const { username } = body;

    if (!username || username.length < 4) {
      return NextResponse.json({ available: true, tooShort: true });
    }

    await connectMongo();

    const existingUser = await Contact.findOne({
      Username: { $regex: new RegExp(`^${escapeRegex(username)}$`, "i") },
    })
      .select("Username")
      .lean();

    return NextResponse.json(
      { available: !existingUser, exists: !!existingUser },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error: unknown) {
    console.error("[API] Username check error:", error);

    // Fail open — a check error must not block form submission.
    return NextResponse.json({
      available: true,
      error: "Unable to verify username availability",
    });
  }
}
