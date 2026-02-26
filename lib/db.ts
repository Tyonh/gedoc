// src/lib/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// O process.cwd() pega a raiz do projeto Next.js
const PROD_DB_PATH = path.join(process.cwd(), "produtos.db");
const CLI_DB_PATH = path.join(process.cwd(), "clientes.db");

// Função para abrir conexão com Produtos
export async function openProdutosDb() {
  return open({
    filename: PROD_DB_PATH,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
}

// Função para abrir conexão com Clientes
export async function openClientesDb() {
  return open({
    filename: CLI_DB_PATH,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
}
