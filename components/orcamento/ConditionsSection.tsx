import { Plus, Trash2 } from "lucide-react";
import { ItemCondicao } from "@/types/orcamento";

interface Props {
  vendedor: string;
  setVendedor: (v: string) => void;
  condicoes: ItemCondicao[];
  setCondicoes: (c: ItemCondicao[]) => void;
  totalGeral: number; // Recebe o total geral da página principal
}

export default function ConditionsSection({
  vendedor,
  setVendedor,
  condicoes,
  setCondicoes,
  totalGeral,
}: Props) {
  const adicionarCondicao = () => {
    setCondicoes([
      ...(condicoes || []),
      { id: Math.random().toString(), texto: "", valor: 0 },
    ]);
  };

  const atualizarCondicao = (
    id: string,
    campo: keyof ItemCondicao,
    valor: any,
  ) => {
    setCondicoes(
      (condicoes || []).map((c) =>
        c.id === id ? { ...c, [campo]: valor } : c,
      ),
    );
  };

  const opcoesCondicoes = [
    "À vista",
    "Boleto - 30d",
    "Boleto - 45d",
    "Boleto - 30/60d",
    "Boleto - 30/60/90d",
    "Boleto - 30/60/90/120d",
    "Cartao de Debito",
    "Cartao de Credito S/Juros",
    "Cartao de Credito 1x/Juros",
    "Cartao de Credito 2x/Juros",
    "Cartao de Credito 3x/Juros",
    "Boleto - c/Entrada",
    "Cartao de Debito c/Entrada",
  ];

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        3. Condições Comerciais
      </h2>

      {/* VENDEDOR */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Vendedor:
        </label>
        <select
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          required>
          <option value="">Selecione o vendedor</option>
          <option value='{"nome": "Marcondes Mateus", "imagem": "MARCONDES.png"}'>
            Marcondes Mateus
          </option>
          <option value='{"nome": "Aldoberto Pinheiro", "imagem": "PINHEIRO.png"}'>
            Aldoberto Pinheiro
          </option>
          <option value='{"nome": "Bruno Windson", "imagem": "BRUNO.png"}'>
            Bruno Windson
          </option>
          <option value='{"nome": "Cleide Cordeiro", "imagem": "CLEIDY.png"}'>
            Cleide Cordeiro
          </option>
          <option value='{"nome": "Nadia Rodrigues", "imagem": "NADIA.png"}'>
            Nadia Rodrigues
          </option>
          <option value='{"nome": "Johns Alexandre", "imagem": "JOHNS.png"}'>
            Johns Alexandre
          </option>
          <option value='{"nome": "Ramon", "imagem": "Ramon.png"}'>
            Ramon
          </option>
          <option value='{"nome": "Brito", "imagem": "Brito.png"}'>
            Brito
          </option>
          <option value='{"nome": "Nonato Viana", "imagem": "Nonato.png"}'>
            Nonato Viana
          </option>
          <option value='{"nome": "Xavier Freitas", "imagem": "Xavier.png"}'>
            Xavier Freitas
          </option>
          <option value='{"nome": "Joelson Leal", "imagem": "Joelson.png"}'>
            Joelson Leal
          </option>
          <option value='{"nome": "Rafael Brilhante", "imagem": "RBrilhante.png"}'>
            Rafael Brilhante
          </option>
          <option value='{"nome": "Sheila", "imagem": "Sheila.png"}'>
            Sheila
          </option>
        </select>
      </div>

      {/* LISTA DE CONDIÇÕES */}
      <div className="space-y-3">
        {condicoes?.map((condicao, index) => (
          <div
            key={condicao.id}
            className="relative flex flex-col md:flex-row gap-4 p-4 bg-gray-50 border rounded-lg">
            {/* Oculta o botão de lixeira da primeira condição para não ficarem sem nenhuma */}
            {index > 0 && (
              <button
                type="button"
                onClick={() =>
                  setCondicoes(condicoes.filter((c) => c.id !== condicao.id))
                }
                className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            )}

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {index === 0
                  ? "Condição Principal"
                  : `Condição Extra ${index + 1}`}
              </label>
              <input
                type="text"
                list="opcoes-condicoes"
                value={condicao.texto}
                onChange={(e) =>
                  atualizarCondicao(condicao.id, "texto", e.target.value)
                }
                placeholder="Ex: Cartão de Crédito"
                className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                required={index === 0} // A primeira condição é obrigatória
              />
              <datalist id="opcoes-condicoes">
                {opcoesCondicoes.map((op) => (
                  <option key={op} value={op} />
                ))}
              </datalist>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {index === 0 ? "Valor (Soma dos Produtos)" : "Valor Fixo"}
              </label>
              <input
                type="number"
                value={index === 0 ? totalGeral : condicao.valor}
                onChange={(e) => {
                  if (index !== 0) {
                    atualizarCondicao(
                      condicao.id,
                      "valor",
                      parseFloat(e.target.value) || 0,
                    );
                  }
                }}
                disabled={index === 0} // Trava o input da primeira condição
                className={`w-full p-2 border rounded-md outline-none ${
                  index === 0
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed font-bold"
                    : "focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarCondicao}
        className="mt-4 flex items-center gap-2 text-green-600 font-bold hover:text-green-800 bg-green-50 px-4 py-2 rounded-lg transition">
        <Plus size={20} /> Adicionar Condição Extra
      </button>
    </section>
  );
}
