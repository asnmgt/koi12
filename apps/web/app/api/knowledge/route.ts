import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RID } from "rid-lib";

export async function POST(req: NextRequest) {
  const { title, content } = await req.json();
  const rid = new RID("Knowledge", { title });

  const knowledge = await prisma.knowledge.create({
    data: {
      rid: rid.toString(),
      title,
      content,
    },
  });

  return NextResponse.json(knowledge);
}
