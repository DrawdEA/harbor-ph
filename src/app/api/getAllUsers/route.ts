import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET() {
	const data = await prisma.user.findMany();
	return NextResponse.json(data);
}
