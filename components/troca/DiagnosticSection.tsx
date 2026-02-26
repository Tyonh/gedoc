// src/components/troca/DiagnosticSection.tsx
interface Props {
  relato: string;
  setRelato: (r: string) => void;
  tipoTroca: "ENTRADA" | "SAIDA";
}

export default function DiagnosticSection({
  relato,
  setRelato,
  tipoTroca,
}: Props) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        3.{" "}
        {tipoTroca === "ENTRADA"
          ? "Relato do Defeito (Para o Técnico)"
          : "Relatório de Saída / Conserto"}
      </h2>
      <p className="text-sm text-gray-500 mb-3">
        {tipoTroca === "ENTRADA"
          ? "Descreva com o máximo de detalhes o problema relatado pelo cliente."
          : "Descreva o que foi feito no produto (ex: Troca de placa, limpeza, produto substituído por um novo)."}
      </p>

      <textarea
        value={relato}
        onChange={(e) => setRelato(e.target.value)}
        rows={4}
        placeholder="Digite os detalhes técnicos aqui..."
        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none resize-y"
        required
      />
    </section>
  );
}
