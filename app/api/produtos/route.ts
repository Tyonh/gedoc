// src/app/api/produtos/search/route.ts
import { NextResponse } from "next/server";
import { openProdutosDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termo = (searchParams.get("search") || "").toLowerCase().trim();

  if (termo.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const db = await openProdutosDb();
    const termoLike = `%${termo}%`;
    const sql =
      "SELECT codigo, descricao AS nome FROM produtos WHERE descricao COLLATE NOCASE LIKE ? OR codigo LIKE ? LIMIT 10";

    const rows = await db.all(sql, [termoLike, termoLike]);
    await db.close();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro busca produtos:", error);
    return NextResponse.json(
      { message: "Erro busca produtos" },
      { status: 500 },
    );
  }
}
