import { NextResponse } from "next/server";
import fs from "fs/promises";
import puppeteer from "puppeteer";
import path from "path";
import axios from "axios";
import os from "os";
import { openClientesDb, openProdutosDb } from "@/lib/db";

const TEMPLATE_PATH = path.join(process.cwd(), "templates", "template.html");
const STYLE_PATH = path.join(process.cwd(), "templates", "public", "style.css");
const LOGO_PATH = path.join(process.cwd(), "templates", "public", "logo.png");

// Função segura para baixar a imagem para a pasta temporária
async function downloadImagemTemporaria(url: string): Promise<string | null> {
  const urlLimpa = url.trim();
  const tempFilePath = path.join(
    os.tmpdir(),
    `img_troca_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
  );

  try {
    const response = await axios({
      url: urlLimpa,
      method: "GET",
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 20000,
    });
    await fs.writeFile(tempFilePath, response.data);
    const fileContent = await fs.readFile(tempFilePath);
    const contentType = response.headers["content-type"] || "image/jpeg";
    const base64 = `data:${contentType};base64,${fileContent.toString("base64")}`;
    await fs.unlink(tempFilePath);
    return base64;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const dados = await request.json();

    let {
      tipo_documento, // "ENTRADA" ou "SAIDA"
      cliente_nome,
      produto_nome,
      quantidade,
      relato_tecnico,
      vendedor,
      observacao,
    } = dados;

    // 1. Processar Cliente (Busca CNPJ/Email no banco)
    let cliente_cnpj = "";
    let cliente_email = "";
    if (cliente_nome) {
      const dbCli = await openClientesDb();
      const row = await dbCli.get(
        "SELECT id_cliente, email FROM clientes WHERE nome = ? COLLATE NOCASE LIMIT 1",
        [cliente_nome],
      );
      if (row) {
        cliente_cnpj = row.id_cliente;
        cliente_email = row.email || "";
      }
      await dbCli.close();
    }

    // Processar Vendedor (Busca o JSON do select)
    let vendedorInfo = { nome: "", imagem: "" };
    try {
      const parsed = JSON.parse(vendedor);
      vendedorInfo.nome = parsed.nome || "";
      vendedorInfo.imagem = parsed.imagem || "";
    } catch {
      vendedorInfo.nome = vendedor || "Setor Técnico";
    }

    // Processa a Imagem do Vendedor
    let vendedorImgHtml = "";
    if (vendedorInfo.imagem) {
      try {
        const vendedorImgPath = path.join(
          PUBLIC_DIR,
          path.basename(vendedorInfo.imagem),
        );
        const vendedorBuffer = await fs.readFile(vendedorImgPath);
        vendedorImgHtml = `<img src="data:image/png;base64,${vendedorBuffer.toString("base64")}" style="width: 100%; max-height: 150px; object-fit: contain; display: block; margin: 0 auto;">`;
      } catch (e) {
        console.warn("Imagem vendedor não encontrada:", vendedorInfo.imagem);
      }
    }
    // 2. Processar Itens da Troca (SEM VALORES FINANCEIROS)
    const produtos = Array.isArray(produto_nome) ? produto_nome : [];
    const quantidades = Array.isArray(quantidade) ? quantidade : [];

    const itensValidos = produtos
      .map((nome, i) => ({
        nomeCompleto: nome,
        qtd: parseInt(quantidades[i] || "1"),
      }))
      .filter((p) => p.nomeCompleto && p.nomeCompleto.trim() !== "");

    let itensHtml = "";
    const dbProd = await openProdutosDb();

    for (const item of itensValidos) {
      let codigo = "";
      let nome = item.nomeCompleto;

      if (item.nomeCompleto.includes(" - ")) {
        const parts = item.nomeCompleto.split(" - ");
        codigo = parts[0].trim();
        nome = parts.slice(1).join(" - ").trim();
      }

      let imgTag = `<div style="width:50px; height:50px; background:#eee; display:flex; align-items:center; justify-content:center; font-size:9px; color:#999; margin:auto;">S/ FOTO</div>`;

      if (codigo) {
        const row = await dbProd.get(
          "SELECT imagem_url FROM produtos WHERE codigo = ? LIMIT 1",
          [codigo],
        );
        if (row?.imagem_url && row.imagem_url.startsWith("http")) {
          const base64Image = await downloadImagemTemporaria(
            row.imagem_url.trim(),
          );
          if (base64Image) {
            imgTag = `<img src="${base64Image}" alt="${codigo}" style="width:50px; height:50px; object-fit:contain; display:block; margin:auto;" />`;
          }
        }
      }

      // Repare que as colunas de Preço Unitário e Total vão vazias aqui,
      // pois o CSS vai escondê-las completamente da tabela.
      itensHtml += `
        <tr>
            <td style="width:60px; text-align:center; padding:5px;">${imgTag}</td>
            <td style="vertical-align:middle; text-align:center; font-weight:bold;">${codigo}</td>
            <td style="vertical-align:middle;">${nome}</td>
            <td style="text-align:center; vertical-align:middle; font-weight:bold; font-size: 16px;">${item.qtd}</td>
            <td class="esconder-coluna"></td>
            <td class="esconder-coluna"></td>
        </tr>`;
    }
    await dbProd.close();

    // 3. Montar o Box do Relato Técnico
    const tituloRelato =
      tipo_documento === "ENTRADA"
        ? "RELATO DO CLIENTE / MOTIVO DE ANALISE"
        : "RELATÓRIO DE SAÍDA / CONSERTO";
    const corDestaque = tipo_documento === "ENTRADA" ? "#B12B30" : "#22c55e"; // Laranja para entrada, Verde para saída

    const htmlRelatoTecnico = `
      <div style="border: 2px solid ${corDestaque}; border-radius: 8px; margin: 20px 0; padding: 15px; background-color: #fffaf5; page-break-inside: avoid;">
        <h3 style="margin-top: 0; color: ${corDestaque}; font-size: 14px; text-transform: uppercase;">${tituloRelato}</h3>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #333; white-space: pre-wrap;">${relato_tecnico || "Nenhum relato informado."}</p>
      </div>
    `;

    // 4. Observações Padrão
    const arrayObservacoes = Array.isArray(observacao)
      ? observacao
      : observacao
        ? [observacao]
        : [];
    const htmlObservacoes = arrayObservacoes
      .filter((obs: string) => obs.trim() !== "")
      .map((obs: string, idx: number) => `<li>${idx + 1}. ${obs.trim()}</li>`)
      .join("");

    // 5. Carregar Arquivos
    const htmlTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
    const cssContent = await fs.readFile(STYLE_PATH, "utf8").catch(() => "");
    const logoBuffer = await fs.readFile(LOGO_PATH).catch(() => null);
    const logoBase64 = logoBuffer
      ? `data:image/png;base64,${logoBuffer.toString("base64")}`
      : "";

    // 6. A MÁGICA DO CSS DE TROCA
    const tituloDocumento =
      tipo_documento === "ENTRADA"
        ? "COMPROVANTE DE ENTRADA (TROCA)"
        : "COMPROVANTE DE SAÍDA (TROCA)";

    const cssOverride = `
      /* Esconde as colunas 5 (V. Unit) e 6 (V. Total) do cabeçalho e da tabela */
      table th:nth-child(5), table th:nth-child(6) { display: none !important; }
      .esconder-coluna { display: none !important; }
      
      /* Substitui visualmente a palavra ORÇAMENTO se houver no topo pelo título novo */
      .titulo-documento::after { content: "${tituloDocumento}"; font-size: 20px; font-weight: bold; display: block; text-align: center; margin-bottom: 15px; }
      
      /* Ajustes de flexbox para manter o rodapé embaixo se precisarmos depois */
      .page-container { display: flex !important; flex-direction: column !important; min-height: 296mm; padding-bottom: 0 !important; }
      @media print { body { margin: 0; padding: 0; } .page-container { box-shadow: none; margin: 0; width: 100%; } }
    `;

    // 7. Substituições HTML
    let finalHtml = htmlTemplate
      .replace("</head>", `<style>${cssContent}\n${cssOverride}</style></head>`)
      .replace(/src=".*?logo\.png"/g, `src="${logoBase64}"`)
      .replace("{{cliente_nome}}", cliente_nome || "")
      .replace("{{cliente_cnpj}}", cliente_cnpj || "")
      .replace("{{cliente_email}}", cliente_email || "")
      .replace("{{itens}}", itensHtml)
      .replace("{{area_condicoes_pagamento}}", htmlRelatoTecnico) // Trocamos o box de pagamento pelo box de diagnóstico!
      .replace("{{observacoes_adicionais}}", htmlObservacoes)
      .replace("{{data}}", new Date().toLocaleDateString("pt-BR"))
      // Limpamos o resto que não vai ser usado na troca (ex: vendedor, total)
      .replace("{{vendedor_nome}}", vendedorInfo.nome)
      .replace("{{vendedor_info}}", vendedorImgHtml)
      .replace("{{condicao_pagamento}}", "")
      .replace("{{condicoes_adicionais_boxes}}", "")
      .replace("{{total}}", "");

    // 8. Gerar o PDF com Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "load", timeout: 0 });

    await page.evaluate(() => {
      const container = document.querySelector(
        ".page-container",
      ) as HTMLElement;
      if (!container) return;
      const pageHeightMM = 296;
      const div = document.createElement("div");
      div.style.height = "1mm";
      document.body.appendChild(div);
      const pxPerMM = div.offsetHeight || 3.78;
      document.body.removeChild(div);
      const contentHeight = container.scrollHeight;
      const totalPages = Math.ceil(contentHeight / (pageHeightMM * pxPerMM));
      container.style.minHeight = totalPages * pageHeightMM + "mm";
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "0px", left: "20px", right: "20px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="troca_${tipo_documento}_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro NextJS API Troca:", error);
    return NextResponse.json(
      { message: "Erro interno", erro: error.message },
      { status: 500 },
    );
  }
}
