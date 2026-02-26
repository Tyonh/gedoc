// src/components/troca/ProductsTrocaSection.tsx
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { ItemTroca } from "@/types/troca";

interface Props {
  produtos: ItemTroca[];
  setProdutos: (p: ItemTroca[]) => void;
}

function ProductTrocaRow({
  produto,
  index,
  podeRemover,
  removerProduto,
  atualizarProduto,
}: {
  produto: ItemTroca;
  index: number;
  podeRemover: boolean;
  removerProduto: (id: string) => void;
  atualizarProduto: (
    id: string,
    campo: keyof ItemTroca,
    valor: string | number,
  ) => void;
}) {
  const [sugestoes, setSugestoes] = useState<
    { codigo: string; nome: string }[]
  >([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const buscarProdutos = async () => {
      if (produto.nomeCompleto.trim().length < 2 || !mostrarSugestoes) {
        setSugestoes([]);
        return;
      }
      setCarregando(true);
      try {
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

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 border rounded-lg items-end">
      {podeRemover && (
        <button
          type="button"
          onClick={() => removerProduto(produto.id)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm border border-gray-100">
          <Trash2 size={18} />
        </button>
      )}

      {/* Input de Busca Ocupando mais espaço já que não tem campo de valor */}
      <div className="md:col-span-10 relative" ref={wrapperRef}>
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
            placeholder="Buscar código ou descrição..."
            className="w-full pl-3 pr-10 p-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            required
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {carregando ? (
              <Loader2 size={16} className="text-orange-500 animate-spin" />
            ) : (
              <Search size={16} className="text-gray-400" />
            )}
          </div>
        </div>

        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {sugestoes.map((item) => (
              <li
                key={item.codigo}
                onClick={() => {
                  atualizarProduto(
                    produto.id,
                    "nomeCompleto",
                    `${item.codigo} - ${item.nome}`,
                  );
                  setMostrarSugestoes(false);
                }}
                className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b text-sm flex flex-col">
                <span className="font-bold text-gray-900">{item.codigo}</span>
                <span className="text-gray-600 truncate">{item.nome}</span>
              </li>
            ))}
          </ul>
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
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
          required
        />
      </div>
    </div>
  );
}

export default function ProductsTrocaSection({ produtos, setProdutos }: Props) {
  const adicionarProduto = () => {
    setProdutos([
      ...(produtos || []),
      { id: Math.random().toString(), nomeCompleto: "", quantidade: 1 },
    ]);
  };

  const removerProduto = (id: string) => {
    if (produtos.length > 1) setProdutos(produtos.filter((p) => p.id !== id));
  };

  const atualizarProduto = (
    id: string,
    campo: keyof ItemTroca,
    valor: string | number,
  ) => {
    setProdutos(
      (produtos || []).map((p) => (p.id === id ? { ...p, [campo]: valor } : p)),
    );
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        2. Itens para Troca / Conserto
      </h2>
      <div className="space-y-4">
        {produtos?.map((produto, index) => (
          <ProductTrocaRow
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
        className="mt-4 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-800 bg-orange-50 px-4 py-2 rounded-lg">
        <Plus size={20} /> Adicionar Produto
      </button>
    </section>
  );
}
