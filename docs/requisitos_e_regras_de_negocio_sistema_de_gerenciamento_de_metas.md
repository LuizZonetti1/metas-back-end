# Sistema de Gerenciamento de Metas

## 1. Visão Geral do Produto

O Sistema de Gerenciamento de Metas é uma aplicação full stack voltada para o controle, acompanhamento e histórico de metas pessoais, organizadas por diferentes periodicidades (diária, semanal, mensal e anual). O sistema tem como objetivo permitir que usuários definam metas, acompanhem seu progresso ao longo do tempo e gerenciem prioridades, utilizando uma interface clara e uma API REST bem estruturada.

Este documento descreve as **Regras de Negócio**, **Requisitos Funcionais** e **Requisitos Não Funcionais**, servindo como base para desenvolvimento, validação e futura evolução do sistema.

---

## 2. Escopo do Sistema

### 2.1 Dentro do Escopo
- Autenticação de usuários (login e cadastro)
- Autenticação social (Google)
- Gerenciamento de metas por periodicidade
- Registro e consulta de histórico de progresso
- API REST para consumo por frontend

### 2.2 Fora do Escopo (por enquanto)
- Notificações automáticas
- Metas compartilhadas entre usuários
- Gamificação
- Deploy e escalabilidade em produção

---

## 3. Regras de Negócio

### RN-01 — Cadastro de Usuário
- Um usuário deve possuir um email único no sistema.
- Um usuário pode se cadastrar via email/senha ou via provedor externo (Google).
- Um usuário autenticado via Google não é obrigado a possuir senha local.

### RN-02 — Autenticação
- O sistema deve emitir um token JWT válido após login bem-sucedido.
- Rotas protegidas só podem ser acessadas com token válido.
- O token deve identificar unicamente o usuário autenticado.

### RN-03 — Propriedade dos Dados
- Toda meta pertence obrigatoriamente a um único usuário.
- Um usuário só pode visualizar, criar, editar ou excluir suas próprias metas.
- O histórico de progresso pertence à meta e herda a propriedade do usuário.

### RN-04 — Metas
- Uma meta deve possuir obrigatoriamente:
  - Título
  - Periodicidade
  - Prioridade
  - Data de início
- A descrição da meta é opcional.
- A periodicidade da meta deve ser uma das opções:
  - Diária
  - Semanal
  - Mensal
  - Anual

### RN-05 — Prioridade
- Toda meta deve possuir um nível de prioridade.
- A prioridade deve ser classificada internamente por níveis numéricos.
- O sistema deve permitir ordenação de metas por prioridade.

### RN-06 — Histórico de Progresso
- Uma meta pode possuir múltiplos registros de progresso.
- Cada registro de progresso deve estar associado a uma data.
- Um registro de progresso pode indicar:
  - Concluído
  - Não concluído
- O histórico não deve ser apagado automaticamente ao editar a meta.

### RN-07 — Exclusão
- Ao excluir uma meta, todos os registros de progresso associados devem ser removidos.
- Ao excluir um usuário, todas as metas e históricos associados devem ser removidos.

---

## 4. Requisitos Funcionais

### RF-01 — Cadastro de Usuário
- O sistema deve permitir o cadastro de usuários com nome, email e senha.
- O sistema deve validar campos obrigatórios no cadastro.

### RF-02 — Login de Usuário
- O sistema deve permitir login via email e senha.
- O sistema deve permitir login via conta Google.
- O sistema deve retornar token JWT após login válido.

### RF-03 — Gerenciamento de Sessão
- O sistema deve validar o token JWT em rotas protegidas.
- O sistema deve impedir acesso não autenticado a dados sensíveis.

### RF-04 — Criação de Metas
- O sistema deve permitir criar novas metas.
- O sistema deve permitir definir periodicidade e prioridade.

### RF-05 — Edição de Metas
- O sistema deve permitir editar título, descrição, prioridade e datas.

### RF-06 — Exclusão de Metas
- O sistema deve permitir excluir metas existentes.

### RF-07 — Visualização de Metas
- O sistema deve permitir listar metas por:
  - Dia
  - Intervalo semanal
  - Mês e ano
  - Ano

### RF-08 — Registro de Progresso
- O sistema deve permitir registrar progresso de uma meta em uma data específica.
- O sistema deve permitir atualizar o status de progresso.

### RF-09 — Consulta de Histórico
- O sistema deve permitir consultar o histórico de progresso de uma meta.

---

## 5. Requisitos Não Funcionais

### RNF-01 — Arquitetura
- O sistema deve seguir arquitetura baseada em API REST.
- O backend deve ser desacoplado do frontend.

### RNF-02 — Tecnologia
- O backend deve ser desenvolvido em Node.js com TypeScript.
- O frontend deve ser desenvolvido em React com TypeScript.
- O banco de dados deve ser PostgreSQL.

### RNF-03 — Segurança
- Senhas devem ser armazenadas utilizando hash seguro.
- Tokens JWT devem possuir tempo de expiração.
- Rotas protegidas devem exigir autenticação.

### RNF-04 — Manutenibilidade
- O código deve seguir separação de responsabilidades.
- O sistema deve permitir evolução incremental.

### RNF-05 — Usabilidade
- O frontend deve apresentar informações de forma clara e organizada.
- A criação e visualização de metas deve ser intuitiva.

### RNF-06 — Desempenho
- O sistema deve responder às requisições em tempo adequado para uso pessoal.
- Não há exigência inicial de alta concorrência.

### RNF-07 — Portabilidade
- O sistema deve ser executável em ambiente local.
- O sistema deve ser preparado para deploy futuro.

---

## 6. Considerações Finais

Este documento serve como base inicial para o desenvolvimento do sistema. Ele pode (e deve) ser revisado conforme o projeto evolui, novas funcionalidades são adicionadas ou requisitos são refinados.

A prioridade é garantir clareza, aprendizado progressivo e uma base sólida para crescimento futuro do projeto.

