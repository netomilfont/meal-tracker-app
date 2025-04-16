import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { Meal } from "../../../models/Meal";
import { WithId, Document } from "mongodb";

// Função POST para adicionar refeição
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, calories, datetime, type } = body;

    if (!name || !description || !calories || !datetime || !type) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("meals");

    const result = await collection.insertOne({
      name,
      description,
      calories: Number(calories),
      datetime: new Date(datetime),
      type,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Refeição adicionada!", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar refeição:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("meals");

    const mealsRaw: WithId<Document>[] = await collection.find({}).toArray();

    const meals: Meal[] = mealsRaw.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      calories: doc.calories,
      datetime: doc.datetime,
      type: doc.type,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Erro ao buscar as refeições:", error);
    return NextResponse.json({ error: "Erro ao buscar as refeições" }, { status: 500 });
  }
}
