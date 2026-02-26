// src/app/troca/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

// Reutilizando componentes do Orçamento!
import ClientSection from "@/components/orcamento/ClientSection";
import ObservationsSection from "@/components/orcamento/ObservationsSection";

// Componentes Novos da Troca
import ProductsTrocaSection from "@/components/troca/ProductsTrocaSection";
import DiagnosticSection from "@/components/troca/DiagnosticSection";

import { TipoTroca, ItemTroca } from "@/types/troca";
import { ItemObservacao } from "@/types/orcamento"; // Reaproveitando o tipo

import VendedorSection from "@/components/troca/VendedorSection"; // <-- ADICIONE ESTA LINHA

export default function TrocaPage() {
  const [isGerando, setIsGerando] = useState(false);

  // Alternador: Entrada (Padrão) ou Saída
  const [tipoTroca, setTipoTroca] = useState<TipoTroca>("ENTRADA");

  // Estados
  const [clienteNome, setClienteNome] = useState("");
  const [produtos, setProdutos] = useState<ItemTroca[]>([
    { id: "inicial", nomeCompleto: "", quantidade: 1 },
  ]);
  const [relato, setRelato] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [observacoes, setObservacoes] = useState<ItemObservacao[]>([]);

  async function handleGerarDocumento(e: FormEvent) {
    e.preventDefault();
    setIsGerando(true);

    const payload = {
      tipo_documento: tipoTroca,
      cliente_nome: clienteNome,
      produto_nome: produtos.map((p) => p.nomeCompleto),
      quantidade: produtos.map((p) => p.quantidade),
      relato_tecnico: relato,
      vendedor: vendedor,
      observacao: observacoes.map((o) => o.texto),
    };

    console.log("Dados enviados para PDF de Troca:", payload);
    try {
      const response = await fetch("/api/documentos/troca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF de Troca");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprovante_${tipoTroca}_${clienteNome || "cliente"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Erro ao gerar o documento. Tente novamente.");
    } finally {
      setIsGerando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Módulo de Trocas
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleGerarDocumento} className="space-y-6">
          {/* SELETOR DE ENTRADA / SAÍDA */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Qual é o tipo de movimentação?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setTipoTroca("ENTRADA")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold border-2 transition ${tipoTroca === "ENTRADA" ? "bg-orange-100 border-orange-500 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                <ArrowDownToLine size={20} /> ENTRADA (Receber Cliente)
              </button>
              <button
                type="button"
                onClick={() => setTipoTroca("SAIDA")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold border-2 transition ${tipoTroca === "SAIDA" ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                <ArrowUpFromLine size={20} /> SAÍDA (Devolver Cliente)
              </button>
            </div>
          </section>

          {/* 1. DADOS DO CLIENTE (Reutilizado!) */}
          <ClientSection
            clienteNome={clienteNome}
            setClienteNome={setClienteNome}
          />

          {/* 2. PRODUTOS (Adaptado sem valor) */}
          <ProductsTrocaSection produtos={produtos} setProdutos={setProdutos} />

          {/* 3. RELATO/DIAGNÓSTICO (O novo campo) */}
          <DiagnosticSection
            relato={relato}
            setRelato={setRelato}
            tipoTroca={tipoTroca}
          />

          {/* 4. VENDEDOR (A NOVA SEÇÃO) */}
          <VendedorSection vendedor={vendedor} setVendedor={setVendedor} />

          {/* 5. OBSERVAÇÕES (Reutilizado!) */}
          <ObservationsSection
            observacoes={observacoes}
            setObservacoes={setObservacoes}
          />

          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={isGerando}
              className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${isGerando ? "bg-gray-400" : tipoTroca === "ENTRADA" ? "bg-orange-600 hover:bg-orange-700 shadow-md" : "bg-green-600 hover:bg-green-700 shadow-md"}`}>
              {isGerando
                ? "Processando..."
                : `Gerar Comprovante de ${tipoTroca}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
