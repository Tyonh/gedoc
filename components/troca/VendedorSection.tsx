// src/components/troca/VendedorSection.tsx
interface Props {
  vendedor: string;
  setVendedor: (v: string) => void;
}

export default function VendedorSection({ vendedor, setVendedor }: Props) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        4. Responsável (Assinatura)
      </h2>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Vendedor / Técnico Responsável:
        </label>
        <select
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-md outline-none focus:ring-2 focus:ring-orange-500"
          required>
          <option value="">Selecione o responsável</option>
          <option value='{"nome":"BRUNO LIMA","imagem":"BRUNO.png"}'>
            BRUNO LIMA
          </option>
          <option value='{"nome":"XAVIER FREITAS","imagem":"Xavier.png"}'>
            XAVIER FREITAS
          </option>
          <option value='{"nome":"RAFAEL BRILHANTE","imagem":"RBrilhante.png"}'>
            RAFAEL BRILHANTE
          </option>
          {/* Pode adicionar os outros vendedores aqui igual ao orçamento */}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          A assinatura deste responsável aparecerá no rodapé do documento.
        </p>
      </div>
    </section>
  );
}
