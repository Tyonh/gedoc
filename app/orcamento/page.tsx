"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Importando os componentes (vamos criá-los abaixo)
import ClientSection from "@/components/orcamento/ClientSection";
import ProductsSection from "@/components/orcamento/ProductsSection";
import ConditionsSection from "@/components/orcamento/ConditionsSection";
import ObservationsSection from "@/components/orcamento/ObservationsSection";

import { ItemProduto, ItemCondicao, ItemObservacao } from "@/types/orcamento";

export default function OrcamentoPage() {
  const [isGerando, setIsGerando] = useState(false);

  // --- ESTADOS DO FORMULÁRIO (O que antes ficava solto no HTML) ---
  const [clienteNome, setClienteNome] = useState("");
  const [vendedor, setVendedor] = useState("");

  const [produtos, setProdutos] = useState<ItemProduto[]>([
    { id: "inicial", nomeCompleto: "", quantidade: 1, valorUnitario: 0 },
  ]);

  const [condicoes, setCondicoes] = useState<ItemCondicao[]>([]);
  const [observacoes, setObservacoes] = useState<ItemObservacao[]>([]);

  // --- FUNÇÃO DE ENVIO ---
  async function handleGerarOrcamento(e: FormEvent) {
    e.preventDefault();
    setIsGerando(true);

    // Monta o objeto exatamente como a sua API (antigo FormData) espera
    const payload = {
      cliente_nome: clienteNome,
      vendedor: vendedor,
      produto_nome: produtos.map((p) => p.nomeCompleto),
      quantidade: produtos.map((p) => p.quantidade),
      valor_unitario: produtos.map((p) => p.valorUnitario),
      condicao_pagamento: condicoes.map((c) => c.texto),
      valor_condicao: condicoes.map((c) => c.valor),
      observacao: observacoes.map((o) => o.texto),
    };

    try {
      // Faz a chamada para a nossa nova API do Next.js
      const response = await fetch("/api/documentos/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF");

      // Lógica para fazer o download do PDF recebido
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orcamento_${clienteNome || "cliente"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Erro ao gerar o orçamento. Tente novamente.");
      console.error(error);
    } finally {
      setIsGerando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gerador de Orçamento
            </h1>
          </div>
        </div>

        <form onSubmit={handleGerarOrcamento} className="space-y-6">
          {/* 1. DADOS DO CLIENTE */}
          <ClientSection
            clienteNome={clienteNome}
            setClienteNome={setClienteNome}
          />

          {/* 2. PRODUTOS */}
          <ProductsSection produtos={produtos} setProdutos={setProdutos} />

          {/* 3. CONDIÇÕES COMERCIAIS E VENDEDOR */}
          <ConditionsSection
            vendedor={vendedor}
            setVendedor={setVendedor}
            condicoes={condicoes}
            setCondicoes={setCondicoes}
          />

          {/* 4. OBSERVAÇÕES */}
          <ObservationsSection
            observacoes={observacoes}
            setObservacoes={setObservacoes}
          />

          {/* BOTÃO SUBMIT */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={isGerando}
              className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                isGerando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-md"
              }`}>
              {isGerando ? "Processando PDF..." : "Gerar Orçamento (PDF)"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
