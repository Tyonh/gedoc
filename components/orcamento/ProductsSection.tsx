// src/components/orcamento/ProductsSection.tsx
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { ItemProduto } from "@/types/orcamento";

interface ProductsSectionProps {
  produtos: ItemProduto[];
  setProdutos: (produtos: ItemProduto[]) => void;
}

interface ProdutoSugestao {
  codigo: string;
  nome: string;
}

// --- SUB-COMPONENTE: LINHA DO PRODUTO (Isola o Autocomplete de cada linha) ---
function ProductRow({
  produto,
  index,
  podeRemover,
  removerProduto,
  atualizarProduto,
}: {
  produto: ItemProduto;
  index: number;
  podeRemover: boolean;
  removerProduto: (id: string) => void;
  atualizarProduto: (
    id: string,
    campo: keyof ItemProduto,
    valor: string | number,
  ) => void;
}) {
  const [sugestoes, setSugestoes] = useState<ProdutoSugestao[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha o Autocomplete se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setMostrarSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce para buscar na API
  useEffect(() => {
    const buscarProdutos = async () => {
      if (produto.nomeCompleto.trim().length < 2 || !mostrarSugestoes) {
        setSugestoes([]);
        return;
      }

      setCarregando(true);
      try {
        // Usa a rota /api/produtos baseado na sua estrutura de pastas
        const res = await fetch(
          `/api/produtos?search=${encodeURIComponent(produto.nomeCompleto)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSugestoes(data);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setCarregando(false);
      }
    };

    const timeoutId = setTimeout(buscarProdutos, 300);
    return () => clearTimeout(timeoutId);
  }, [produto.nomeCompleto, mostrarSugestoes]);

  const selecionarProduto = (codigo: string, nome: string) => {
    // Formata do jeito que o seu gerador de PDF espera (Código - Nome)
    const nomeFormatado = `${codigo} - ${nome}`;
    atualizarProduto(produto.id, "nomeCompleto", nomeFormatado);
    setMostrarSugestoes(false);
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 border rounded-lg items-end">
      {/* Botão de Remover */}
      {podeRemover && (
        <button
          type="button"
          onClick={() => removerProduto(produto.id)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm border border-gray-100"
          title="Remover Item">
          <Trash2 size={18} />
        </button>
      )}

      {/* Input de Busca (Autocomplete) */}
      <div className="md:col-span-8 relative" ref={wrapperRef}>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Produto {index + 1}
        </label>

        <div className="relative">
          <input
            type="text"
            value={produto.nomeCompleto}
            onChange={(e) => {
              atualizarProduto(produto.id, "nomeCompleto", e.target.value);
              setMostrarSugestoes(true);
            }}
            onFocus={() => {
              if (produto.nomeCompleto.length >= 2) setMostrarSugestoes(true);
            }}
            placeholder="Ex: 50501 - LUM LED PUBL VIA..."
            className="w-full pl-3 pr-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {carregando ? (
              <Loader2 size={16} className="text-blue-500 animate-spin" />
            ) : (
              <Search size={16} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Caixa Suspensa de Sugestões */}
        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {sugestoes.map((item) => (
              <li
                key={item.codigo}
                onClick={() => selecionarProduto(item.codigo, item.nome)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-gray-700 transition text-sm flex flex-col">
                <span className="font-bold text-gray-900">{item.codigo}</span>
                <span className="text-gray-600 truncate">{item.nome}</span>
              </li>
            ))}
          </ul>
        )}

        {mostrarSugestoes &&
          produto.nomeCompleto.length >= 2 &&
          sugestoes.length === 0 &&
          !carregando && (
            <div className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-3 text-center text-gray-500 text-sm italic">
              Nenhum produto encontrado.
            </div>
          )}
      </div>

      {/* Input de Quantidade */}
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Qtd
        </label>
        <input
          type="number"
          min="1"
          value={produto.quantidade}
          onChange={(e) =>
            atualizarProduto(
              produto.id,
              "quantidade",
              parseInt(e.target.value) || 0,
            )
          }
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      {/* Input de Valor */}
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          V. Unitário (R$)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={produto.valorUnitario}
          onChange={(e) =>
            atualizarProduto(
              produto.id,
              "valorUnitario",
              parseFloat(e.target.value) || 0,
            )
          }
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ProductsSection({
  produtos,
  setProdutos,
}: ProductsSectionProps) {
  const adicionarProduto = () => {
    const novoProduto: ItemProduto = {
      id: Math.random().toString(36).substr(2, 9),
      nomeCompleto: "",
      quantidade: 1,
      valorUnitario: 0,
    };
    setProdutos([...(produtos || []), novoProduto]);
  };

  const removerProduto = (idParaRemover: string) => {
    if (produtos.length === 1) return;
    const novaLista = produtos.filter((p) => p.id !== idParaRemover);
    setProdutos(novaLista);
  };

  const atualizarProduto = (
    id: string,
    campo: keyof ItemProduto,
    valor: string | number,
  ) => {
    const novaLista = (produtos || []).map((p) => {
      if (p.id === id) {
        return { ...p, [campo]: valor };
      }
      return p;
    });
    setProdutos(novaLista);
  };

  const totalGeral = (produtos || []).reduce(
    (acc, p) => acc + p.quantidade * p.valorUnitario,
    0,
  );

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          2. Itens do Orçamento
        </h2>
        <span className="text-lg font-bold text-gray-800">
          Total: R${" "}
          {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-4">
        {produtos?.map((produto, index) => (
          <ProductRow
            key={produto.id}
            produto={produto}
            index={index}
            podeRemover={produtos.length > 1}
            removerProduto={removerProduto}
            atualizarProduto={atualizarProduto}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarProduto}
        className="mt-4 flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition bg-blue-50 px-4 py-2 rounded-lg">
        <Plus size={20} /> Adicionar Produto
      </button>
    </section>
  );
}
