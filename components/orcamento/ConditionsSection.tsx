import { Plus, Trash2 } from "lucide-react";
import { ItemCondicao } from "@/types/orcamento";

interface Props {
  vendedor: string;
  setVendedor: (v: string) => void;
  condicoes: ItemCondicao[];
  setCondicoes: (c: ItemCondicao[]) => void;
}

export default function ConditionsSection({
  vendedor,
  setVendedor,
  condicoes,
  setCondicoes,
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
    "Boleto - 30/60d",
    "Cartao de Credito S/Juros",
    "Cartao de Credito 1x/Juros",
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
          <option value='{"nome":"BRUNO LIMA","imagem":"BRUNO.png"}'>
            BRUNO LIMA
          </option>
          <option value='{"nome":"XAVIER FREITAS","imagem":"Xavier.png"}'>
            XAVIER FREITAS
          </option>
          <option value='{"nome":"RAFAEL BRILHANTE","imagem":"RBrilhante.png"}'>
            RAFAEL BRILHANTE
          </option>
        </select>
      </div>

      {/* LISTA DE CONDIÇÕES */}
      <div className="space-y-3">
        {condicoes?.map((condicao, index) => (
          <div
            key={condicao.id}
            className="relative flex flex-col md:flex-row gap-4 p-4 bg-gray-50 border rounded-lg">
            <button
              type="button"
              onClick={() =>
                setCondicoes(condicoes.filter((c) => c.id !== condicao.id))
              }
              className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <Trash2 size={18} />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Condição {index + 1}
              </label>
              <input
                type="text"
                list="opcoes-condicoes"
                value={condicao.texto}
                onChange={(e) =>
                  atualizarCondicao(condicao.id, "texto", e.target.value)
                }
                placeholder="Ex: Cartão de Crédito"
                className="w-full p-2 border rounded-md outline-none"
              />
              <datalist id="opcoes-condicoes">
                {opcoesCondicoes.map((op) => (
                  <option key={op} value={op} />
                ))}
              </datalist>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Valor Fixo (0 = Total)
              </label>
              <input
                type="number"
                value={condicao.valor}
                onChange={(e) =>
                  atualizarCondicao(
                    condicao.id,
                    "valor",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border rounded-md outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarCondicao}
        className="mt-4 flex items-center gap-2 text-green-600 font-bold hover:text-green-800 bg-green-50 px-4 py-2 rounded-lg">
        <Plus size={20} /> Adicionar Condição
      </button>
    </section>
  );
}
