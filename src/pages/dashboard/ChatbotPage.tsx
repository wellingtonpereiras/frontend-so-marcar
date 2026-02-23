import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function ChatbotPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assistente IA</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Chat inteligente com GPT-4 para ajudar na gestão do seu negócio
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Como usar o Assistente IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                💬 Widget Flutuante
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Clique no botão azul no canto inferior direito de qualquer página para abrir o chat.
                O assistente está sempre disponível para responder suas perguntas!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                🤖 Powered by GPT-4
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Nosso assistente usa inteligência artificial avançada para entender suas perguntas
                e fornecer respostas contextualizadas sobre seu estabelecimento.
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📝 Exemplos de perguntas:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400">•</span>
                  <span>"Quantos agendamentos tenho hoje?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400">•</span>
                  <span>"Quais profissionais estão disponíveis amanhã às 14h?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400">•</span>
                  <span>"Como faço para bloquear um horário?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400">•</span>
                  <span>"Mostre os serviços mais vendidos este mês"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400">•</span>
                  <span>"Qual o faturamento previsto para esta semana?"</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
              <p className="text-sm text-primary-900 dark:text-primary-100">
                <strong>💡 Dica:</strong> Quanto mais específica sua pergunta, melhor será a resposta.
                O assistente tem acesso a todos os dados do seu estabelecimento!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Features */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Recursos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  📊 Consulta de Dados
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pergunte sobre agendamentos, clientes, serviços, profissionais e relatórios.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  🎯 Suporte Contextual
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tire dúvidas sobre como usar funcionalidades específicas do sistema.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  📈 Análises e Insights
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba análises sobre performance, faturamento e tendências do negócio.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  🔄 Disponível 24/7
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  O assistente está sempre disponível, sem horário comercial ou espera.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget está sempre disponível no DashboardLayout */}
    </div>
  );
}
