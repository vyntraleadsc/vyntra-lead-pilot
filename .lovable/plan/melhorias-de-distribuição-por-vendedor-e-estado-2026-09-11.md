# Melhorias de distribuição por vendedor e estado

## O que será feito

- Adicionar o estado de origem a todas as oportunidades fictícias, distribuídas entre Rio Grande do Sul e Santa Catarina.
- Incluir filtro de estado na tela de Oportunidades, junto aos filtros atuais.
- Exibir o estado de cada lead na tabela e no painel de detalhes.
- Permitir selecionar um ou vários leads na tabela.
- Criar uma barra de ação para enviar todos os leads selecionados a um vendedor escolhido.
- Manter a troca individual de responsável já existente no painel do lead.
- Atualizar a tela de Distribuição para mostrar a carteira por estado e oferecer acesso claro à distribuição manual.
- Persistir todas as redistribuições no estado local e mostrar confirmação da ação.

## Comportamento esperado

1. O gestor filtra por **RS**, **SC** ou visualiza ambos.
2. Marca os leads desejados, individualmente ou todos os resultados visíveis.
3. Escolhe um vendedor e confirma **Enviar leads**.
4. A tabela, os totais dos vendedores e os demais painéis refletem imediatamente a nova distribuição.

## Validação

- Testar filtro RS/SC, seleção individual, seleção em massa e redistribuição.
- Confirmar persistência após recarregar a página.
- Conferir o fluxo em desktop e celular sem sobreposição ou rolagem lateral da página.
