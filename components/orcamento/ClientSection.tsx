import { useState, useEffect, useRef } from "react";
import { User, Search, Loader2 } from "lucide-react";

interface Props {
  clienteNome: string;
  setClienteNome: (nome: string) => void;
}

interface Cliente {
  id_cliente: string;
  nome: string;
}

export default function ClientSection({ clienteNome, setClienteNome }: Props) {
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Referência para detectar clique fora da caixa de sugestões
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o Autocomplete se clicar fora dele
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

  // O "Debounce" nativo do React: só busca 300ms DEPOIS que o usuário parar de digitar
  useEffect(() => {
    const buscarClientes = async () => {
      // Se tiver menos de 2 letras ou o usuário já clicou numa sugestão, limpa a lista
      if (clienteNome.trim().length < 2 || !mostrarSugestoes) {
        setSugestoes([]);
        return;
      }

      setCarregando(true);
      try {
        const res = await fetch(
          `/api/clientes/search?search=${encodeURIComponent(clienteNome)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSugestoes(data);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setCarregando(false);
      }
    };

    const timeoutId = setTimeout(buscarClientes, 300); // 300ms de espera
    return () => clearTimeout(timeoutId); // Cancela a busca anterior se o usuário continuar digitando
  }, [clienteNome, mostrarSugestoes]);

  const selecionarCliente = (nome: string) => {
    setClienteNome(nome);
    setMostrarSugestoes(false); // Esconde a caixinha após escolher
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
        1. Dados do Cliente
      </h2>

      <div className="relative" ref={wrapperRef}>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Nome do Cliente (Busca Automática):
        </label>

        <div className="relative">
          {/* Ícone de Usuário na esquerda */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>

          <input
            type="text"
            value={clienteNome}
            onChange={(e) => {
              setClienteNome(e.target.value);
              setMostrarSugestoes(true); // Volta a mostrar sugestões se ele alterar o texto
            }}
            onFocus={() => {
              if (clienteNome.length >= 2) setMostrarSugestoes(true);
            }}
            placeholder="Ex: João da Silva"
            className="w-full pl-10 pr-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            autoComplete="off"
          />

          {/* Ícone de Lupa ou Carregando na direita */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {carregando ? (
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            ) : (
              <Search size={18} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* CAIXA FLUTUANTE DO AUTOCOMPLETE (Substitui o seu CSS antigo) */}
        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {sugestoes.map((cliente) => (
              <li
                key={cliente.id_cliente}
                onClick={() => selecionarCliente(cliente.nome)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-gray-700 transition">
                {cliente.nome}
              </li>
            ))}
          </ul>
        )}

        {/* Mensagem caso não encontre cliente */}
        {mostrarSugestoes &&
          clienteNome.length >= 2 &&
          sugestoes.length === 0 &&
          !carregando && (
            <div className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500 italic">
              Nenhum cliente encontrado.
            </div>
          )}
      </div>
    </section>
  );
}
