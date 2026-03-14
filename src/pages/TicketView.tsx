import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { useRef, useState } from 'react';
import { generatePdf } from '../utils/pdfGenerator';

export default function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, clients, checklistItems, companyLogo, companyData, companySignature } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const ticket = tickets.find(t => t.id === id);
  const client = clients.find(c => c.id === ticket?.clientId);

  if (!ticket) {
    return <div className="p-8 text-center text-gray-500">Ordem de Serviço não encontrada.</div>;
  }

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);
    try {
      const dateStr = new Date(ticket.date).toLocaleDateString('pt-BR').replace(/\//g, '-');
      const safeName = client?.name ? client.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') : 'Tarefa';
      const fileName = `OS_${ticket.type}_${safeName}_${dateStr}.pdf`;

      await generatePdf(element, fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente usar o botão "Imprimir" no topo da página como alternativa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col print:bg-white print:text-black print:p-0">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden print:hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {isGenerating && (
          <div className="fixed inset-0 bg-[#004a7c]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black uppercase tracking-widest text-sm">Gerando Ordem de Serviço...</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">Detalhes da Ordem de Serviço</h1>
          </div>
          <div className="flex gap-3">
            <Link 
              to={`/tickets/${ticket.id}/edit`}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 backdrop-blur-md"
            >
              <Edit className="w-4 h-4" /> Editar
            </Link>
            <button 
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 backdrop-blur-md"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/20 backdrop-blur-md shadow-lg"
            >
              <Download className="w-4 h-4" /> {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        <div 
          ref={printRef} 
          className="bg-white/5 backdrop-blur-md text-white rounded-3xl border border-white/10 shadow-2xl p-8 print:bg-white print:text-black print:shadow-none print:border-none print:p-0"
        >
        {/* Cabeçalho do Relatório */}
        <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-start break-inside-avoid print:border-gray-800">
          <div className="flex items-center gap-4">
            {companyLogo && (
              <img src={companyLogo} alt="Logo da Empresa" className="h-16 w-auto object-contain print:brightness-0" />
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                {ticket.osNumber && (
                  <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs font-bold tracking-wider border border-white/10 print:bg-gray-200 print:text-gray-800 print:border-gray-300">
                    {ticket.osNumber}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-white uppercase print:text-gray-900">
                  {ticket.title || 'Relatório de Manutenção'}
                </h2>
              </div>
              <p className="text-white/60 font-medium mt-1 print:text-gray-500">
                {ticket.type === 'CORRETIVA' ? 'Manutenção Corretiva' : 'Manutenção Preventiva / Checklist'}
                {ticket.maintenanceCategory && ` • ${ticket.maintenanceCategory}`}
                {ticket.maintenanceSubcategory && ` - ${ticket.maintenanceSubcategory}`}
              </p>
              {companyData && (
                <div className="mt-2 text-sm text-white/40 print:text-gray-500">
                  <p className="font-bold text-white/60 print:text-gray-700">{companyData.name}</p>
                  <p>CNPJ: {companyData.document} | Tel: {companyData.phone}</p>
                  <p>{companyData.email}</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/40 print:text-gray-500">Data da OS</p>
            <p className="font-bold text-white print:text-gray-900">{new Date(ticket.date).toLocaleDateString('pt-BR')}</p>
            <p className="text-sm text-white/40 mt-2 print:text-gray-500">Técnico Responsável</p>
            <p className="font-bold text-white print:text-gray-900">{ticket.technician}</p>
          </div>
        </div>

        {/* Informações do Cliente */}
        {client && (
          <div className="mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 print:bg-transparent print:border-gray-300 break-inside-avoid">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-3 print:text-gray-400">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 print:text-gray-500">Nome / Condomínio</p>
                <p className="font-medium text-white print:text-gray-900">{client.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 print:text-gray-500">CNPJ / CPF</p>
                <p className="font-medium text-white print:text-gray-900">{client.document || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 print:text-gray-500">Responsável</p>
                <p className="font-medium text-white print:text-gray-900">{client.contactPerson || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 print:text-gray-500">Telefone</p>
                <p className="font-medium text-white print:text-gray-900">{client.phone}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 print:text-gray-500">E-mail</p>
                <p className="font-medium text-white print:text-gray-900">{client.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-white/40 print:text-gray-500">Endereço</p>
                <p className="font-medium text-white print:text-gray-900">{client.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Específico */}
        {ticket.type === 'CORRETIVA' ? (
          <div className="space-y-6">
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-400 print:border-gray-200">Problema Relatado</h3>
              <p className="text-white/80 whitespace-pre-wrap print:text-gray-800">{ticket.reportedProblem}</p>
            </div>

            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-400 print:border-gray-200">Relato da Ordem de Serviço</h3>
              <p className="text-white/80 whitespace-pre-wrap print:text-gray-800">{ticket.serviceReport}</p>
            </div>

            {ticket.productsForQuote && (
              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 print:bg-transparent print:border-gray-300 break-inside-avoid">
                <h3 className="text-xs font-black text-amber-400/60 uppercase tracking-widest mb-2 print:text-gray-500">Produtos para Orçamento</h3>
                <p className="text-amber-200 whitespace-pre-wrap print:text-gray-800">{ticket.productsForQuote}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 print:text-gray-400 print:border-gray-200">Resultados do Checklist</h3>
            
            <div className="overflow-hidden border border-white/10 rounded-2xl print:border-gray-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 text-white/60 print:bg-gray-100 print:text-gray-700">
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 print:border-gray-200">Tarefa</th>
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 w-24 text-center print:border-gray-200">Status</th>
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 print:border-gray-200">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200">
                  {ticket.checklistResults?.map(result => {
                    const item = checklistItems.find(i => i.id === result.taskId);
                    if (!item) return null;
                    
                    return (
                      <tr key={result.taskId} className="break-inside-avoid">
                        <td className="p-3 text-white/80 font-medium print:text-gray-900">{item.task}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                            result.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400 print:border print:border-emerald-800 print:text-emerald-800' :
                            result.status === 'NOK' ? 'bg-red-500/20 text-red-400 print:border print:border-red-800 print:text-red-800' :
                            'bg-white/5 text-white/40 print:border print:border-gray-800 print:text-gray-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-3 text-white/40 print:text-gray-600">{result.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Observações Gerais */}
        {ticket.observations && (
          <div className="mt-8 break-inside-avoid">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-400 print:border-gray-200">Observações Gerais</h3>
            <p className="text-white/80 whitespace-pre-wrap print:text-gray-800">{ticket.observations}</p>
          </div>
        )}

        {/* Fotos do Serviço */}
        {ticket.images && ticket.images.length > 0 && (
          <div className="mt-8 break-inside-avoid">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 border-b border-white/5 pb-1 print:text-gray-400 print:border-gray-200">Fotos do Serviço</h3>
            <div className="grid grid-cols-2 gap-4">
              {ticket.images.map((img, index) => (
                <div key={index} className="rounded-2xl overflow-hidden border border-white/10 print:border-gray-200">
                  <img src={img} alt={`Foto ${index + 1}`} className="w-full h-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assinaturas */}
        <div className="mt-16 pt-8 grid grid-cols-2 gap-8 break-inside-avoid">
          <div className="text-center">
            <div className="flex flex-col items-center mb-2">
              <div className="h-16 flex items-end justify-center w-full relative">
                {companySignature && (
                  <img src={companySignature} alt="Assinatura" className="max-h-full max-w-full object-contain mb-[-8px] relative z-10 print:brightness-0" />
                )}
              </div>
              <div className="border-t border-white/20 w-3/4 mx-auto print:border-gray-400"></div>
            </div>
            <p className="font-bold text-white print:text-gray-900">{ticket.technician}</p>
            <p className="text-xs text-white/40 uppercase tracking-widest print:text-gray-500">Técnico Responsável</p>
          </div>
          <div className="text-center">
            <div className="h-16"></div>
            <div className="border-t border-white/20 w-3/4 mx-auto mb-2 print:border-gray-400"></div>
            <p className="font-bold text-white print:text-gray-900">{client?.name || 'Cliente'}</p>
            <p className="text-xs text-white/40 uppercase tracking-widest print:text-gray-500">Cliente / Síndico(a)</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
