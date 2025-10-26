import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    revalidateTag("global");
    return NextResponse.json(
      { message: "Cache revalidated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
