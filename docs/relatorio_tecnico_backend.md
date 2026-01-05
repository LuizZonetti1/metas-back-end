# Relatório Técnico — Backend (Node.js + Express + TypeScript + Prisma)

**Projeto:** metas-back-end  
**Data:** 2026-01-04  
**Stack:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcryptjs, yup

---

## 1. Visão geral da arquitetura adotada

### 1.1 Padrão Controller → Service → Repository
O projeto segue o padrão clássico de camadas:

- **Controller**: camada HTTP. Recebe `Request/Response`, valida input (yup), extrai contexto (ex.: `req.userId`) e delega para Services.
- **Service**: camada de regra de negócio e orquestração. Decide *o que fazer*, valida condições de domínio e monta o retorno.
- **Repository**: camada de persistência. Encapsula operações do Prisma Client e concentra as consultas ao banco.

Na prática, o fluxo aparece consistentemente em rotas como:
- `GET /dashboard` → `DashboardController` → `GetDashboardService` → `GoalRepository` → Prisma → DB
- `POST /goals/occurrences/:id/complete` → `GoalController` → `CompleteGoalOccurrenceService` → `GoalOccurrenceRepository` → Prisma → DB

### 1.2 Separação de responsabilidades
- **HTTP e validação de payload** ficam nos Controllers (`yup`), para manter Services independentes do Express.
- **Regras de negócio** ficam nos Services (ex.: ownership, alternância de status da ocorrência, cálculo de dashboard).
- **Acesso a dados** fica nos Repositories (`UserRepository`, `GoalRepository`, `GoalOccurrenceRepository`).
- **Cross-cutting concerns** (autenticação) ficam em `middlewares/`.
- **Regras utilitárias** de data ficam em `utils/`.

### 1.3 Justificativa do uso de cada camada
- **Controller**: reduz acoplamento do domínio com o framework HTTP; facilita troca de validação, documentação e versionamento de rotas.
- **Service**: centraliza regras e orquestração; evita “fat controllers” e permite reuso (ex.: dashboard, listagem por período).
- **Repository**: evita duplicação de queries Prisma, melhora testabilidade e permite evolução (caching, query optimization, transações).

> Observação arquitetural: em `CreateGoalService` existe uma escrita direta via `prisma.goalOccurrence.create(...)` (bypass do Repository), o que quebra um pouco a pureza do padrão. Isso é simples de corrigir criando um método no `GoalOccurrenceRepository`.

---

## 2. Descrição detalhada das funcionalidades implementadas

### 2.1 Autenticação com JWT (cadastro, login e middleware)

#### Cadastro (`POST /users/create`)
- Valida: `name`, `email`, `password` (mín. 6) via yup.
- Service: `CreateUserService`.
- Persistência: `UserRepository.create()`.
- Segurança: senha é hasheada com `bcrypt.hash(password, 6)`.
- Retorna: `{ id, name, email }` (não retorna hash da senha).

#### Login (`POST /users/auth`)
- Valida: `email`, `password`.
- Service: `AuthUserService`.
- Fluxo:
  - Busca usuário por email.
  - Compara senha com bcrypt.
  - Emite JWT com `sub = user.id`, expira em `7d`.
- Retorna: `{ user: { id, name, email }, token }`.

#### Middleware (`authMiddleware`)
- Exige header `Authorization: Bearer <token>`.
- Verifica `process.env.JWT_SECRET`.
- Faz `jwt.verify(...)` e injeta `req.userId = decoded.sub`.
- Falhas:
  - Sem token: `401`.
  - Token inválido/expirado: `401`.
  - `JWT_SECRET` ausente: `500`.

**Rotas protegidas**: `GET /goals`, `GET /goals/:id`, `POST /goals/create`, `POST /goals/occurrences/:id/complete`, `GET /dashboard`.

### 2.2 Criação de usuários
- Centralizada em `CreateUserService` + `UserRepository`.
- Garante unicidade de email (regra + índice `@unique` no Prisma).

### 2.3 Criação de metas (goals)
- Endpoint: `POST /goals/create`.
- Controller valida `title`, `description?`, `frequency` (`GoalFrequency` enum).
- Service: `CreateGoalService`.
- Repository: `GoalRepository.create()`.
- Meta nasce com `status = ACTIVE`.

### 2.4 Criação automática de ocorrências (goal occurrences)
- No estado atual do código, a automação implementada é **mínima**:
  - Ao criar uma meta, o sistema cria **a primeira ocorrência imediatamente** com:
    - `date = new Date()`
    - `status = NOT_COMPLETED`

Não há, até o momento, uma rotina que gere ocorrências futuras com base em `frequency` (ex.: diariamente/semana/mês).

> Isso não invalida o modelo: o banco já está preparado para representar recorrência através de ocorrências (`GoalOccurrence` com `@@unique([goalId, date])`). Falta apenas a estratégia de geração.

### 2.5 Conclusão de ocorrência (complete / uncomplete)
- Endpoint: `POST /goals/occurrences/:id/complete`.
- Service: `CompleteGoalOccurrenceService`.
- Regras:
  - Busca ocorrência por id (`GoalOccurrenceRepository.findById`) incluindo a meta (`include: { goal: true }`).
  - **Ownership**: se `occurrence.goal.userId !== req.userId` → erro.
  - Alterna status:
    - Se `COMPLETED` → atualiza para `NOT_COMPLETED`.
    - Se `NOT_COMPLETED` → atualiza para `COMPLETED`.

### 2.6 Listagem de metas por período
- Endpoint: `GET /goals?start=...&end=...`.
- Controller converte `start`/`end` para `Date` (se ausentes, usa `new Date()`).
- Service: `ListGoalsService`.
- Repository: `GoalRepository.findByUserAndDateRange`.

**Importante (estado atual):** o Repository **ignora** `startDate`/`endDate` e retorna todas as metas do usuário, incluindo todas as ocorrências (`include: { occurrences: true }`) sem filtro.

### 2.7 Dashboard (daily / weekly / monthly)
- Endpoint: `GET /dashboard?period=daily|weekly|monthly` (default: `daily`).
- Service: `GetDashboardService`.
- Datas: usa `getDateRange(period)`.
- Busca metas via `GoalRepository.findByUserAndDateRange(...)`.
- Cálculo:
  - Soma todas as ocorrências retornadas como `total`.
  - Conta `COMPLETED` como `completed`.
  - `pending = total - completed`.
  - `percentage = round(completed/total*100)`.
- Retorno:
  - `period`
  - `range` (start/end)
  - `summary`
  - `goals` (com occurrences).

**Importante (estado atual):** como não há filtro por período no Repository, o dashboard pode contabilizar ocorrências fora do intervalo.

---

## 3. Explicação das principais regras de negócio

### 3.1 Como funciona a recorrência das metas
- A recorrência é modelada por:
  - `Goal.frequency` (DAILY/WEEKLY/MONTHLY/YEARLY)
  - múltiplas linhas em `GoalOccurrence` representando a execução da meta em datas específicas.

Na implementação atual:
- O sistema registra ao menos **uma ocorrência inicial** no momento da criação.
- A lógica de “criar todas as ocorrências esperadas do período” ainda não está implementada.

### 3.2 Por que metas não armazenam status diretamente
O status de “concluída” é um atributo dependente de **tempo**.

Se `Goal` armazenasse `completed=true/false`, haveria ambiguidade:
- Concluída *quando*? Hoje? Esta semana? No mês?
- Como manter histórico e indicadores sem sobrescrever o passado?

Por isso, o design correto (e já adotado) é:
- A meta é a definição (título, frequência, dono, etc.).
- As ocorrências são o histórico de execução por data.

### 3.3 Como o status é derivado a partir das ocorrências
O status “visível” de uma meta em um período deve ser calculado a partir das suas ocorrências naquele intervalo.

Exemplos de derivação (conceitual):
- **Meta diária (hoje):** status = ocorrência do dia (COMPLETED/NOT_COMPLETED).
- **Meta semanal:** status pode ser % concluída, ou concluída se todas as ocorrências esperadas do período estão COMPLETED.

No código atual, esse raciocínio já aparece no dashboard, que calcula `completed/total` percorrendo ocorrências.

### 3.4 Regra de criação de ocorrências
Regras implementadas:
- Ao criar uma meta, cria-se uma ocorrência inicial para `new Date()` com `NOT_COMPLETED`.
- Unicidade por meta+data: `@@unique([goalId, date])` (impede duplicidade no mesmo dia).

Regras desejáveis (e sugeridas para evolução):
- Gerar ocorrências “faltantes” no momento de consulta do período (lazy generation) ou via job (cron).
- Normalizar `date` para “dia” (00:00:00) para evitar colisões por timestamp diferente no mesmo dia.

### 3.5 Regra de segurança (userId + ownership)
A propriedade é garantida de duas formas:
- **Por filtro**: `GoalRepository.findByIdAndUserId(goalId, userId)`.
- **Por validação explícita**: ao completar ocorrência, confere `occurrence.goal.userId`.

Isso impede que um usuário, mesmo autenticado, modifique dados de outro usuário.

---

## 4. Explicação detalhada do tratamento de datas

### 4.1 Normalização de início e fim de período
O util `getDateRange(period)` define limites em horário local:
- **daily**: 00:00:00.000 → 23:59:59.999
- **weekly**: domingo 00:00:00.000 → sábado 23:59:59.999 (baseado em `getDay()`; 0 = domingo)
- **monthly**: primeiro dia do mês 00:00:00.000 → último dia do mês 23:59:59.999

Isso cria um “intervalo fechado” conveniente para queries do tipo:
- `date >= startDate AND date <= endDate`

### 4.2 Problema de datas com timestamps (ISO / UTC)
Em APIs, é comum receber e enviar datas em ISO (UTC), enquanto o servidor roda em timezone local.

Riscos práticos:
- `new Date("2026-01-04")` pode ser interpretado como UTC e convertido para local, “deslocando” o dia.
- `setHours(0,0,0,0)` normaliza em horário local; se o DB armazena em UTC, a fronteira pode não bater.
- Ocorrências com `new Date()` guardam timestamp completo; duas ocorrências no mesmo “dia lógico” mas com horários diferentes podem quebrar filtros por dia.

### 4.3 Por que a lógica de datas fica no Service/Utils
- Controllers devem focar em HTTP e validação, sem carregar regras temporais complexas.
- Services são o lugar adequado para:
  - decidir o período;
  - normalizar limites;
  - executar queries com filtros corretos;
  - garantir consistência entre endpoints (listagem e dashboard).

O projeto já iniciou bem esse caminho centralizando o intervalo em `utils/dateRange.ts`.

### 4.4 Impacto disso no dashboard e nas consultas
Hoje, o intervalo calculado (`startDate/endDate`) é produzido corretamente, mas:
- `GoalRepository.findByUserAndDateRange` ainda não aplica filtro de datas.

Impactos:
- Dashboard pode contabilizar ocorrências fora do período.
- Listagem por intervalo não reflete `start/end`.

Query sugerida (conceitual) para corrigir:
- Buscar metas do usuário e incluir apenas ocorrências dentro do range:
  - `occurrences: { where: { date: { gte: startDate, lte: endDate } } }`

---

## 5. Fluxo completo de uma requisição típica

### Exemplo: concluir uma ocorrência
1. **Request**: `POST /goals/occurrences/:id/complete` com `Authorization: Bearer <token>`.
2. **Middleware**: `authMiddleware`
   - valida token;
   - injeta `req.userId`.
3. **Controller**: `GoalController.completeOccurrence`
   - lê `occurrenceId` e `userId`;
   - chama service.
4. **Service**: `CompleteGoalOccurrenceService.execute`
   - busca ocorrência;
   - valida ownership;
   - alterna status.
5. **Repository**: `GoalOccurrenceRepository`
   - `findById` e `update`.
6. **Prisma**: executa `SELECT/UPDATE`.
7. **Database**: PostgreSQL persiste a mudança.
8. **Response**: ocorrência atualizada.

### Exemplo: dashboard
1. **Request**: `GET /dashboard?period=weekly`.
2. **Middleware**: autentica e injeta `req.userId`.
3. **Controller**: `DashboardController.index`.
4. **Service**: `GetDashboardService.execute`
   - calcula range via `getDateRange`;
   - carrega metas e ocorrências;
   - calcula totais e %.
5. **Repository/Prisma/DB**: consulta.

---

## 6. Estrutura final de pastas do projeto

- `src/app.ts`: criação do Express app, middlewares globais e handler de erro.
- `src/server.ts`: bootstrap do servidor e porta.
- `src/routes/`: definição das rotas HTTP.
- `src/controller/`: Controllers (camada HTTP).
- `src/services/`: Services (regras de negócio e orquestração).
- `src/repository/`: Repositories (acesso a dados com Prisma).
- `src/middlewares/`: middlewares (ex.: autenticação JWT).
- `src/utils/`: utilitários (ex.: cálculo de intervalos de datas).
- `src/database/prisma.ts`: inicialização do Prisma Client (adapter pg).
- `prisma/`: schema e migrations.
- `docs/`: documentação do projeto.

---

## 7. Pontos fortes da implementação atual

- Arquitetura em camadas bem definida (Controller/Service/Repository).
- Autenticação com JWT simples, funcional e consistente.
- Boas práticas básicas de segurança: hash de senha com bcrypt, expiração do token.
- Modelagem adequada para histórico (ocorrências) e suporte à recorrência via enum.
- Constraint de unicidade em ocorrência (`goalId + date`), evitando duplicidades.
- Tipagem do `req.userId` via extensão de tipos do Express.

---

## 8. Pontos de melhoria e possíveis evoluções futuras

### 8.1 Correções e ajustes imediatos (alto impacto)
- **Filtro de período nas queries**: implementar de fato o `startDate/endDate` no `GoalRepository.findByUserAndDateRange` (impacta `/goals` e `/dashboard`).
- **Normalização da data da ocorrência**: ao criar ocorrência, persistir a data “normalizada” (00:00) para metas diárias, evitando múltiplos timestamps no mesmo dia.
- **Erro de digitação no controller**: em `UserController.create`, o retorno usa `error.mensage` (provável bug) e pode mascarar mensagens do yup.
- **Consistência do padrão**: mover `prisma.goalOccurrence.create` para `GoalOccurrenceRepository` ou criar um método de domínio.

### 8.2 Recorrência e automação (streaks, cron jobs)
- **Criação automática de ocorrências** (core da recorrência):
  - *Lazy generation*: ao consultar um período, criar ocorrências faltantes no intervalo.
  - *Eager generation (cron)*: job diário/semanal que “materializa” ocorrências futuras.
- **Streaks**:
  - calcular sequência de dias/semana consecutivos COMPLETED por meta;
  - armazenar cache de streak (opcional) para performance.

### 8.3 Soft delete e histórico
- **Soft delete** em `Goal` e/ou `GoalOccurrence` (ex.: `deletedAt`):
  - preserva histórico;
  - facilita auditoria e restauração.

### 8.4 Testes automatizados
- Introduzir testes em camadas:
  - Unitários: Services (regras de negócio).
  - Integração: rotas críticas (auth, completar ocorrência, dashboard).
- Testcontainers/Postgres local ou banco em memória (dependendo da estratégia).

### 8.5 DTOs e contrato com frontend
- Definir DTOs explícitos por endpoint:
  - reduz “vazamento” do modelo Prisma direto para o frontend;
  - permite evoluir banco sem quebrar o contrato;
  - melhora documentação (OpenAPI/Swagger no futuro).

### 8.6 Divergências vs documento de requisitos
O documento em `docs/requisitos_e_regras_de_negocio_sistema_de_gerenciamento_de_metas.md` cita itens ainda não refletidos no schema/código atual, como:
- prioridade, data de início, edição/exclusão, login Google.

Recomendação: manter o relatório técnico fiel ao implementado (este documento) e criar um backlog de implementação alinhado ao requisito.

---

## Apêndice A — Modelos principais (Prisma)

- `User`: usuários com `email` único e `password` obrigatório (migração tornou obrigatório).
- `Goal`: meta com `frequency` e `status` (ACTIVE/ARCHIVED) e relacionamento com `User`.
- `GoalOccurrence`: ocorrência com `date` e `status` (COMPLETED/NOT_COMPLETED), unicidade por `goalId + date`.

---

## Apêndice B — Endpoints atuais

- `GET /health`
- `POST /users/create`
- `POST /users/auth`
- `GET /goals` (auth)
- `GET /goals/:id` (auth)
- `POST /goals/create` (auth)
- `POST /goals/occurrences/:id/complete` (auth)
- `GET /dashboard?period=daily|weekly|monthly` (auth)
