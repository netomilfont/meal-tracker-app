import { MongoClient } from "mongodb";


const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI não definida");
const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db();
    return { db };
  } catch (error) {
    console.error("Erro ao conectar no MongoDB", error);
    throw new Error("Erro ao conectar no MongoDB");
  }
}