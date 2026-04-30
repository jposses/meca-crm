# Guia de Referência: Equipes de Agentes (Agent Teams)

> Fonte: https://code.claude.com/docs/en/agent-teams  
> Claude Code v2.1.32+. Recurso experimental — ativar com `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

---

## Índice

1. [Quando usar equipes de agentes](#quando-usar)
2. [Equipes vs. Subagentes](#equipes-vs-subagentes)
3. [Ativação](#ativacao)
4. [Iniciando uma equipe](#iniciando-uma-equipe)
5. [Controlando a equipe](#controlando-a-equipe)
6. [Arquitetura interna](#arquitetura)
7. [Melhores práticas](#melhores-praticas)
8. [Exemplos de casos de uso](#exemplos)
9. [Limitações conhecidas](#limitacoes)
10. [Solução de problemas](#troubleshooting)

---

## Quando usar

Use equipes quando o trabalho paralelo traz ganho real. Casos ideais:

| Cenário | Por que funciona |
|---|---|
| **Pesquisa e revisão** | Múltiplos ângulos simultâneos sem espera |
| **Novos módulos/features** | Cada agente tem propriedade exclusiva de arquivos |
| **Debug com hipóteses concorrentes** | Teorias testadas em paralelo, convergência mais rápida |
| **Mudanças cross-layer** (front/back/testes) | Cada layer tem seu dono |

**Não use equipes quando:**
- Tarefas são sequenciais e dependentes entre si
- Múltiplos agentes precisariam editar o mesmo arquivo
- Trabalho simples — o overhead de coordenação não compensa
- Subagentes resolvem com menor custo de tokens

---

## Equipes vs. Subagentes

| | Subagentes | Equipes de Agentes |
|---|---|---|
| **Contexto** | Próprio; resultado retorna ao chamador | Próprio; totalmente independente |
| **Comunicação** | Apenas reportam ao agente principal | Mensagens diretas entre si |
| **Coordenação** | Agente principal gerencia tudo | Lista de tarefas compartilhada, auto-coordenação |
| **Ideal para** | Tarefas focadas onde só o resultado importa | Trabalho complexo com discussão e colaboração |
| **Custo de tokens** | Menor — resultados resumidos de volta | Maior — cada agente é uma instância separada |

**Regra prática:** Use subagentes quando só o resultado importa. Use equipes quando os agentes precisam trocar descobertas, se desafiar e coordenar entre si.

---

## Ativação

No `settings.local.json` do projeto (já configurado neste projeto):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Verificar versão mínima:
```bash
claude --version  # requer v2.1.32+
```

---

## Iniciando uma equipe

Descreva a tarefa e a estrutura da equipe em linguagem natural. O lead cria a equipe, instancia os membros e coordena o trabalho.

**Exemplo de prompt eficaz:**
```
Crie uma equipe de agentes para explorar este problema de diferentes ângulos:
um focado em UX, um em arquitetura técnica, um como advogado do diabo.
```

O lead cria automaticamente:
- Uma lista de tarefas compartilhada
- Membros com contexto individuais
- Canal de comunicação entre eles

---

## Controlando a equipe

### Modo de exibição

| Modo | Como funciona | Requisito |
|---|---|---|
| **in-process** (padrão) | Todos no terminal principal; Shift+Down para navegar | Qualquer terminal |
| **split panes** | Cada agente em seu próprio painel | tmux ou iTerm2 |

Configurar modo no `~/.claude/settings.json`:
```json
{
  "teammateMode": "in-process"
}
```

Ou por sessão: `claude --teammate-mode in-process`

### Especificar modelos e tamanho da equipe
```
Crie uma equipe com 4 membros para refatorar estes módulos em paralelo.
Use Sonnet para cada membro.
```

### Exigir aprovação de plano antes da implementação
```
Instancie um agente arquiteto para refatorar o módulo de autenticação.
Exija aprovação do plano antes de fazer qualquer mudança.
```
Fluxo: agente planeia → lead revisa → aprova ou rejeita com feedback → agente implementa.

### Falar diretamente com um membro
- **in-process**: Shift+Down para navegar entre membros → digitar para enviar mensagem
- **split panes**: clicar no painel do membro desejado

### Encerrar um membro
```
Peça ao membro pesquisador para encerrar
```
O lead envia requisição de shutdown. O membro pode aprovar (encerra graciosamente) ou rejeitar com justificativa.

### Limpar a equipe
```
Limpe a equipe
```
**Importante:** Sempre use o lead para fazer a limpeza. Membros não devem rodar cleanup — seu contexto de equipe pode não resolver corretamente, deixando recursos em estado inconsistente.

### Hooks para controle de qualidade

| Hook | Quando dispara | Usar para |
|---|---|---|
| `TeammateIdle` | Membro prestes a ficar ocioso | Validar entregáveis; exit 2 para manter trabalhando |
| `TaskCreated` | Tarefa sendo criada | Validar critérios; exit 2 para bloquear criação |
| `TaskCompleted` | Tarefa sendo marcada como concluída | Verificar qualidade; exit 2 para bloquear conclusão |

---

## Arquitetura

### Componentes

| Componente | Função |
|---|---|
| **Team lead** | Sessão principal que cria a equipe, instancia membros e coordena |
| **Teammates** | Instâncias independentes que executam tarefas atribuídas |
| **Task list** | Lista compartilhada de itens de trabalho que membros reivindicam |
| **Mailbox** | Sistema de mensagens entre agentes |

### Armazenamento local
- **Config da equipe:** `~/.claude/teams/{team-name}/config.json` — não editar manualmente (sobrescrito em cada atualização de estado)
- **Lista de tarefas:** `~/.claude/tasks/{team-name}/`

### Estados de tarefas
`pending` → `in progress` → `completed`

Tarefas com dependências não resolvidas não podem ser reivindicadas. File locking previne race conditions quando múltiplos membros tentam reivindicar a mesma tarefa.

### Contexto de cada membro
- Carrega: CLAUDE.md do projeto, MCP servers, skills
- **Não herda:** histórico de conversa do lead
- Recebe: prompt de instanciação do lead

### Comunicação
- **Entrega automática:** mensagens chegam sem polling
- **Notificação de idle:** membros notificam o lead automaticamente ao terminar
- **Lista compartilhada:** todos veem o status das tarefas
- **Mensagem direta:** por nome do membro (lead atribui nomes na instanciação)

### Usando definições de subagentes como membros
Referencie um tipo de subagente pelo nome ao instanciar:
```
Instancie um membro usando o tipo de agente security-reviewer para auditar o módulo auth.
```
O membro respeita a allowlist de `tools` e `model` da definição. Ferramentas de coordenação de equipe (`SendMessage`, gerenciamento de tarefas) sempre estão disponíveis mesmo com `tools` restrito.

### Permissões
Membros herdam as permissões do lead. Se o lead usa `--dangerously-skip-permissions`, todos os membros também. Pode-se alterar o modo de membros individuais após instanciação, mas não no momento de spawn.

---

## Melhores práticas

### Fornecer contexto suficiente no prompt de instanciação
Membros não herdam o histórico do lead. Inclua detalhes específicos da tarefa:
```
Instancie um revisor de segurança com o prompt: "Revise o módulo de autenticação
em src/auth/ para vulnerabilidades. Foque em manipulação de tokens, gerenciamento
de sessão e validação de entrada. O app usa JWT em cookies httpOnly.
Reporte problemas com classificações de severidade."
```

### Tamanho ideal da equipe
- **Começar com 3-5 membros** — equilíbrio entre trabalho paralelo e coordenação gerenciável
- **~5-6 tarefas por membro** — mantém produtividade sem context switching excessivo
- Escalar apenas quando o trabalho genuinamente se beneficia de paralelismo
- 3 membros focados frequentemente superam 5 dispersos

### Dimensionar tarefas corretamente
| Tamanho | Problema |
|---|---|
| Muito pequeno | Overhead de coordenação supera o benefício |
| Muito grande | Membros trabalham muito sem check-ins; risco de esforço desperdiçado |
| **Ideal** | Unidades autocontidas com entregável claro (uma função, um arquivo de testes, uma revisão) |

### Aguardar membros terminarem
Se o lead começar a implementar tarefas em vez de aguardar:
```
Aguarde seus membros completarem suas tarefas antes de prosseguir
```

### Evitar conflitos de arquivo
Dois membros editando o mesmo arquivo resulta em sobrescrita. Divida o trabalho para que cada membro seja dono de um conjunto diferente de arquivos.

### Monitorar e direcionar
Verifique o progresso, redirecione abordagens que não estão funcionando e sintetize descobertas conforme chegam. Deixar a equipe rodar sem supervisão aumenta o risco de esforço desperdiçado.

### Começar com pesquisa e revisão
Se for a primeira vez usando equipes: tarefas de revisão de PR, pesquisa de biblioteca ou investigação de bug mostram o valor do paralelismo sem os desafios de implementação paralela.

---

## Exemplos

### Revisão de código paralela
```
Crie uma equipe de agentes para revisar o PR #142. Instancie três revisores:
- Um focado em implicações de segurança
- Um verificando impacto de performance
- Um validando cobertura de testes
Que cada um revise e reporte descobertas.
```

### Investigação com hipóteses concorrentes (debug)
```
Usuários reportam que o app encerra após uma mensagem em vez de manter conexão.
Instancie 5 membros para investigar hipóteses diferentes. Faça-os conversar entre si
para tentar refutar as teorias uns dos outros, como um debate científico.
Atualize o doc de descobertas com o consenso que emergir.
```
**Por que funciona:** investigação sequencial sofre de ancoragem — uma vez que uma teoria é explorada, a investigação subsequente é enviesada em direção a ela. Investigadores independentes ativamente tentando refutar uns aos outros têm muito mais chance de encontrar a causa raiz real.

---

## Limitações

| Limitação | Detalhe |
|---|---|
| **Sem retomada com in-process** | `/resume` e `/rewind` não restauram membros in-process; lead pode tentar mensagear membros inexistentes |
| **Status de tarefas pode atrasar** | Membros às vezes falham em marcar tarefas como concluídas, bloqueando dependentes |
| **Shutdown pode ser lento** | Membros terminam a requisição/tool call atual antes de encerrar |
| **Uma equipe por sessão** | Lead só gerencia uma equipe por vez; limpar antes de criar nova |
| **Sem equipes aninhadas** | Membros não podem instanciar suas próprias equipes ou membros |
| **Lead é fixo** | A sessão que cria a equipe é o lead para sempre; sem transferência de liderança |
| **Permissões definidas no spawn** | Não é possível definir modos por-membro no momento de instanciação |
| **Split panes requer tmux ou iTerm2** | Não funciona no terminal integrado do VS Code, Windows Terminal ou Ghostty |

---

## Troubleshooting

### Membros não aparecem
- In-process: pressionar Shift+Down para ciclar pelos membros ativos
- Verificar se a tarefa era complexa o suficiente para justificar uma equipe
- Verificar tmux: `which tmux`
- iTerm2: verificar se `it2` CLI está instalado e Python API ativada

### Muitos prompts de permissão
Pré-aprovar operações comuns nas [configurações de permissão](/en/permissions) antes de instanciar membros.

### Membros parando em erros
- Verificar output com Shift+Down (in-process) ou clicando no painel
- Dar instruções adicionais diretamente, ou instanciar um membro substituto

### Lead encerrando antes de terminar
Dizer ao lead para continuar. Ou: instruí-lo a aguardar membros terminarem antes de prosseguir.

### Sessões tmux órfãs
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## Referências rápidas de prompt

| Objetivo | Prompt |
|---|---|
| Criar equipe | `"Crie uma equipe de agentes com [N] membros para [tarefa]. Cada membro deve focar em [responsabilidade]."` |
| Especificar modelo | `"Use Sonnet para cada membro."` |
| Exigir aprovação de plano | `"Exija aprovação do plano antes de fazer qualquer mudança."` |
| Aguardar membros | `"Aguarde seus membros completarem suas tarefas antes de prosseguir."` |
| Encerrar membro | `"Peça ao membro [nome] para encerrar."` |
| Limpar equipe | `"Limpe a equipe."` |
| Redirecionar membro | Shift+Down → digitar instrução diretamente |
