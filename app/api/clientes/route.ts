import { NextResponse } from "next/server";
import { openClientesDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termo = (searchParams.get("search") || "").toLowerCase().trim();

  // Se o usuário digitou menos de 2 letras, não busca nada para economizar processamento
  if (termo.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const db = await openClientesDb();
    const termoLike = `%${termo}%`;

    // Busca o ID e o Nome do cliente, limitando a 10 resultados para não travar a tela
    const sql =
      "SELECT id_cliente, nome FROM clientes WHERE nome COLLATE NOCASE LIKE ? LIMIT 10";

    const rows = await db.all(sql, [termoLike]);
    await db.close();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro busca clientes:", error);
    return NextResponse.json(
      { message: "Erro busca clientes" },
      { status: 500 },
    );
  }
}
