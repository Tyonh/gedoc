// src/app/page.tsx
import Link from "next/link";
import { Calculator, ArrowLeftRight, Search, Factory } from "lucide-react";

export default function Home() {
  const modulos = [
    {
      nome: "Orçamento",
      rota: "/orcamento",
      icone: <Calculator size={48} className="text-blue-600 mb-4" />,
      descricao: "Gerador de orçamentos para clientes",
      corHover: "hover:border-blue-500 hover:shadow-blue-100",
    },
    {
      nome: "Troca de Produto",
      rota: "/troca",
      icone: <ArrowLeftRight size={48} className="text-orange-600 mb-4" />,
      descricao: "Documento para devoluções e trocas",
      corHover: "hover:border-orange-500 hover:shadow-orange-100",
    },
    {
      nome: "Amostra de Produto",
      rota: "/amostra",
      icone: <Search size={48} className="text-green-600 mb-4" />,
      descricao: "Solicitação e envio de amostras",
      corHover: "hover:border-green-500 hover:shadow-green-100",
    },
    {
      nome: "Produto p/ Produção",
      rota: "/producao",
      icone: <Factory size={48} className="text-purple-600 mb-4" />,
      descricao: "Ordem de serviço para fabricação",
      corHover: "hover:border-purple-500 hover:shadow-purple-100",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        {/* Cabeçalho */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gerenciador de Documentos
          </h1>
          <p className="text-gray-500">Selecione o módulo que deseja acessar</p>
        </header>

        {/* Grid de Módulos (Os 4 quadrados) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modulos.map((modulo, index) => (
            <Link
              href={modulo.rota}
              key={index}
              className={`bg-white p-8 rounded-2xl border-2 border-transparent shadow-sm transition-all duration-300 flex flex-col items-center text-center group cursor-pointer ${modulo.corHover}`}>
              {modulo.icone}
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900">
                {modulo.nome}
              </h2>
              <p className="text-gray-500 mt-2">{modulo.descricao}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
