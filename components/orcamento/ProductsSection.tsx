// src/components/orcamento/ProductsSection.tsx
import { Plus, Trash2 } from "lucide-react";
import { ItemProduto } from "@/types/orcamento";

interface ProductsSectionProps {
  produtos: ItemProduto[];
  setProdutos: (produtos: ItemProduto[]) => void;
}

export default function ProductsSection({
  produtos,
  setProdutos,
}: ProductsSectionProps) {
  // Função para ADICIONAR uma nova linha (Substitui o cloneNode antigo)
  const adicionarProduto = () => {
    const novoProduto: ItemProduto = {
      id: Math.random().toString(36).substr(2, 9), // ID aleatório
      nomeCompleto: "",
      quantidade: 1,
      valorUnitario: 0,
    };
    setProdutos([...produtos, novoProduto]); // Adiciona na lista
  };

  // Função para REMOVER uma linha (Substitui o .closest('.item-produto').remove())
  const removerProduto = (idParaRemover: string) => {
    if (produtos.length === 1) return; // Evita remover se só tiver 1
    const novaLista = produtos.filter((p) => p.id !== idParaRemover);
    setProdutos(novaLista);
  };

  // Função para ATUALIZAR o valor que o usuário digita no input
  const atualizarProduto = (
    id: string,
    campo: keyof ItemProduto,
    valor: string | number,
  ) => {
    const novaLista = produtos.map((p) => {
      if (p.id === id) {
        return { ...p, [campo]: valor };
      }
      return p;
    });
    setProdutos(novaLista);
  };

  // Calcula o total ao vivo
  const totalGeral = produtos.reduce(
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

      {/* LISTA DE PRODUTOS DINÂMICA */}
      <div className="space-y-4">
        {produtos?.map((produto, index) => (
          <div
            key={produto.id}
            className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 border rounded-lg items-end">
            {/* Botão de Remover (A lixeirinha) */}
            {produtos.length > 1 && (
              <button
                type="button"
                onClick={() => removerProduto(produto.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm"
                title="Remover Item">
                <Trash2 size={18} />
              </button>
            )}

            <div className="md:col-span-8">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Produto {index + 1}
              </label>
              <input
                type="text"
                value={produto.nomeCompleto}
                onChange={(e) =>
                  atualizarProduto(produto.id, "nomeCompleto", e.target.value)
                }
                placeholder="Ex: 50501 - LUM LED PUBL VIA TG 50W..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

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
        ))}
      </div>

      {/* Botão de Adicionar */}
      <button
        type="button"
        onClick={adicionarProduto}
        className="mt-4 flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition bg-blue-50 px-4 py-2 rounded-lg">
        <Plus size={20} /> Adicionar Produto
      </button>
    </section>
  );
}
