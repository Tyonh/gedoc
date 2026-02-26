import { Plus, Trash2 } from "lucide-react";
import { ItemObservacao } from "@/types/orcamento";

interface Props {
  observacoes: ItemObservacao[];
  setObservacoes: (o: ItemObservacao[]) => void;
}

export default function ObservationsSection({
  observacoes,
  setObservacoes,
}: Props) {
  const adicionarObservacao = () => {
    setObservacoes([
      ...(observacoes || []),
      { id: Math.random().toString(), texto: "" },
    ]);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        4. Observações Adicionais
      </h2>

      <div className="space-y-3">
        {observacoes?.map((obs, index) => (
          <div
            key={obs.id}
            className="relative flex gap-4 p-3 bg-gray-50 border rounded-lg items-center">
            <input
              type="text"
              value={obs.texto}
              onChange={(e) => {
                setObservacoes(
                  (observacoes || []).map((o) =>
                    o.id === obs.id ? { ...o, texto: e.target.value } : o,
                  ),
                );
              }}
              placeholder={`Digite a observação ${index + 1}`}
              className="w-full p-2 border rounded-md outline-none bg-white"
            />

            <button
              type="button"
              onClick={() =>
                setObservacoes(
                  (observacoes || []).filter((o) => o.id !== obs.id),
                )
              }
              className="text-red-500 hover:text-red-700 px-2"
              title="Remover Observação">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarObservacao}
        className="mt-4 flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 bg-purple-50 px-4 py-2 rounded-lg">
        <Plus size={20} /> Adicionar Observação
      </button>
    </section>
  );
}
