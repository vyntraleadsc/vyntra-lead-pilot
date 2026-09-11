# Leads por região, lojas e painel de vendedores

## O que será feito

- Manter todos os clientes e leads como dados fictícios de demonstração.
- Criar no Lovable Cloud uma base de leads com cidade, estado, região, loja e vendedor responsável.
- Cadastrar as lojas **Lages/SC**, **Três Passos/RS** e **Santa Rosa/RS** e preencher os leads fictícios com cidades coerentes de cada região.
- Atualizar o quiz para perguntar primeiro o estado e depois a cidade do cliente.
- Definir automaticamente a região e a loja correta a partir das respostas do quiz.
- Adicionar ao painel do gestor seletores de estado, região e loja, além dos filtros já existentes.
- Permitir que o gestor selecione leads filtrados e os envie para um vendedor.
- Completar o painel do vendedor com sua carteira, prioridades, estado, cidade, loja, próximos contatos e ações já disponíveis.
- Preservar a troca entre Gestor e Vendedor para facilitar a demonstração, sem exigir contas reais nesta etapa.

## Regras de encaminhamento

- Respostas de cidades de Santa Catarina serão vinculadas à região e loja de **Lages/SC**.
- Respostas do Rio Grande do Sul serão vinculadas a **Três Passos/RS** ou **Santa Rosa/RS**, conforme a cidade escolhida.
- O lead carregará essas respostas em sua ficha, na listagem e no painel do vendedor.
- Redistribuições feitas pelo gestor atualizarão imediatamente a carteira do vendedor e ficarão persistidas.

## Dados e segurança

- A base conterá apenas nomes, contatos e respostas fictícias.
- A estrutura ficará pronta para receber leads reais futuramente, sem integrar WhatsApp, crédito ou fontes externas agora.
- O acesso continuará como demonstração local; autenticação individual de vendedores fica fora desta etapa.

## Validação

- Conferir o quiz completo para SC e RS, incluindo cidades das três lojas.
- Confirmar filtros por estado, região e loja no painel do gestor.
- Confirmar envio de leads ao vendedor e atualização da carteira.
- Confirmar persistência após recarregar e funcionamento em desktop e celular.
