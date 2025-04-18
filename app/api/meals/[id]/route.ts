import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { name, description, calories, datetime, type } = body;

  try {
    const { db } = await connectToDatabase();

    await db.collection("meals").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          calories,
          datetime: new Date(datetime),
          type,
        },
      }
    );

    return NextResponse.json({ message: "Refeição atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar refeição:", error);
    return NextResponse.json({ error: "Erro ao atualizar refeição" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("meals").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Refeição não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Refeição excluída com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir refeição:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}