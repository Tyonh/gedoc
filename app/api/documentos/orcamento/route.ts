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
const PUBLIC_DIR = path.join(process.cwd(), "templates", "public");

// --- FUNÇÃO DE DOWNLOAD DE IMAGEM ---
async function downloadImagemTemporaria(url: string): Promise<string | null> {
  const urlLimpa = url.trim();
  const tempFilePath = path.join(
    os.tmpdir(),
    `img_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
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
    // Pega os dados vindos do frontend (JSON)
    const dados = await request.json();

    let {
      cliente_nome,
      cliente_cnpj,
      cliente_email,
      vendedor,
      condicao_pagamento,
      valor_condicao,
      observacao,
    } = dados;

    let vendedorInfo = { nome: "", imagem: "" };

    // 1. Processar Cliente
    if (cliente_nome) {
      const dbCli = await openClientesDb();
      const row = await dbCli.get(
        "SELECT id_cliente, email FROM clientes WHERE nome = ? COLLATE NOCASE LIMIT 1",
        [cliente_nome],
      );
      if (row) {
        if (!cliente_cnpj) cliente_cnpj = row.id_cliente;
        if (row.email) cliente_email = row.email;
      }
      await dbCli.close();
    }

    // 2. Processar Vendedor
    try {
      const parsed = JSON.parse(vendedor);
      vendedorInfo.nome = parsed.nome || "";
      vendedorInfo.imagem = parsed.imagem || "";
    } catch {
      vendedorInfo.nome = vendedor;
    }

    // 3. Processar Itens
    const produtos = Array.isArray(dados.produto_nome)
      ? dados.produto_nome
      : [];
    const valores = Array.isArray(dados.valor_unitario)
      ? dados.valor_unitario
      : [];
    const quantidades = Array.isArray(dados.quantidade) ? dados.quantidade : [];

    const itensValidos = produtos
      .map((nome, i) => ({
        nomeCompleto: nome,
        qtd: parseInt(quantidades[i] || "1"),
        valor: parseFloat(valores[i] || "0"),
      }))
      .filter((p) => p.nomeCompleto && p.nomeCompleto.trim() !== "");

    // Geração do HTML da tabela e imagens
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

      itensHtml += `
        <tr>
            <td style="width:60px; text-align:center; padding:5px;">${imgTag}</td>
            <td style="vertical-align:middle; text-align:center;">${codigo}</td>
            <td style="vertical-align:middle;">${nome}</td>
            <td style="text-align:center; vertical-align:middle;">${item.qtd}</td>
            <td style="vertical-align:middle;">R$ ${item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="vertical-align:middle;">R$ ${(item.qtd * item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>`;
    }
    await dbProd.close();

    // 4. Carregar Templates e Assets
    const htmlTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
    const cssContent = await fs.readFile(STYLE_PATH, "utf8").catch(() => "");
    const logoBuffer = await fs.readFile(LOGO_PATH).catch(() => null);
    const logoBase64 = logoBuffer
      ? `data:image/png;base64,${logoBuffer.toString("base64")}`
      : "";

    // 5. Imagem do Vendedor (Correção de layout centralizada)
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

    // 6. Lógica de Condições de Pagamento e Totais
    const totalItens = itensValidos.reduce(
      (acc, it) => acc + it.qtd * it.valor,
      0,
    );
    const arrayCondicoes = Array.isArray(condicao_pagamento)
      ? condicao_pagamento
      : condicao_pagamento
        ? [condicao_pagamento]
        : [];
    const arrayValores = Array.isArray(valor_condicao)
      ? valor_condicao
      : valor_condicao
        ? [valor_condicao]
        : [];

    let listaCondicoes = arrayCondicoes
      .map((texto: string, i: number) => ({
        texto: texto,
        valorInput: parseFloat(arrayValores[i] || "0"),
      }))
      .filter((item: any) => item.texto && item.texto.trim() !== "");

    listaCondicoes.sort((a: any, b: any) => {
      if (a.valorInput === 0 && b.valorInput > 0) return -1;
      if (a.valorInput > 0 && b.valorInput === 0) return 1;
      return 0;
    });

    const htmlCondicoesFinal =
      listaCondicoes.length > 0
        ? listaCondicoes
            .map((item: any, index: number) => {
              const valorFinal =
                item.valorInput > 0 ? item.valorInput : totalItens;
              return `
        <div class="resumo-flex" style="margin-top: 0px; margin-bottom: 2px;">
            <div class="condicoes-box"><span class="titulo-condicao">CONDIÇÃO ${index + 1}:</span><div class="valor-condicao">${item.texto.trim()}</div></div>
            <div class="total-box"><span class="total-label">TOTAL:</span><span class="total-value">R$ ${valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
        </div>`;
            })
            .join("")
        : `<div class="resumo-flex"><div class="condicoes-box"></div><div class="total-box"><span class="total-label">TOTAL:</span><span class="total-value">R$ ${totalItens.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div></div>`;

    // Processar Observações
    const arrayObservacoes = Array.isArray(observacao)
      ? observacao
      : observacao
        ? [observacao]
        : [];
    const htmlObservacoes = arrayObservacoes
      .filter((obs: string) => obs.trim() !== "")
      .map((obs: string, idx: number) => `<li>${idx + 5}. ${obs.trim()}</li>`)
      .join("");

    // 7. Substituições HTML e Script (CSS REAL do Flexbox + Rodapé Automático)
    const cssOverride = `
      .page-container {
        display: flex !important;
        flex-direction: column !important;
        min-height: 285mm; /* Altura base para 1 página */
        padding-bottom: 0 !important;
      }
      .vendedor-info-section {
        margin-top: auto !important; /* ISSO empurra para o fim da última página */
        width: 100%;
        page-break-inside: avoid;
        padding-bottom: 10px;
        text-align: center;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .page-container { box-shadow: none; margin: 0; width: 100%; }
      }
    `;

    let finalHtml = htmlTemplate
      .replace("</head>", `<style>${cssContent}\n${cssOverride}</style></head>`)
      .replace(/src=".*?logo\.png"/g, `src="${logoBase64}"`)
      .replace("{{cliente_nome}}", cliente_nome || "")
      .replace("{{cliente_cnpj}}", cliente_cnpj || "")
      .replace("{{cliente_email}}", cliente_email || "")
      .replace("{{vendedor_nome}}", vendedorInfo.nome || "")
      .replace("{{vendedor_info}}", vendedorImgHtml)
      .replace("{{area_condicoes_pagamento}}", htmlCondicoesFinal)
      .replace("{{data}}", new Date().toLocaleDateString("pt-BR"))
      .replace("{{itens}}", itensHtml)
      .replace("{{observacoes_adicionais}}", htmlObservacoes)
      .replace("{{condicao_pagamento}}", "")
      .replace("{{condicoes_adicionais_boxes}}", "")
      .replace("{{total}}", "");

    // 8. Gerar PDF
    const browser = await puppeteer.launch({
      headless: "new", // ou true, se tiver usando versão nova do puppeteer
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(finalHtml, { waitUntil: "load", timeout: 0 });

    // Script REAL para calcular o número de páginas A4 exatas (evita pulos)
    await page.evaluate(() => {
      const container = document.querySelector(
        ".page-container",
      ) as HTMLElement;
      if (!container) return;

      const pageHeightMM = 280; // 1mm a menos que o A4 para garantir

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

    // 9. Retornar PDF como resposta para Download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orcamento_${(cliente_nome || "cliente").replace(/[^a-z0-9]/gi, "_")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro NextJS API:", error);
    return NextResponse.json(
      { message: "Erro interno", erro: error.message },
      { status: 500 },
    );
  }
}
