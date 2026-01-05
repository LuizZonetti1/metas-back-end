# 🎯 Personal Goals API

## 🚀 Sobre o Projeto

**Personal Goals API** é uma API backend para **gerenciamento de metas pessoais**, desenvolvida com foco em **boas práticas de engenharia de software**, **arquitetura escalável** e **regras de negócio bem definidas**.

A aplicação permite que usuários criem metas recorrentes, acompanhem seu progresso ao longo do tempo e visualizem um **dashboard resumido por período**, servindo como base para um frontend moderno (web ou mobile).

Este projeto foi construído com o objetivo de **demonstrar domínio técnico em backend**, indo além de um CRUD básico.

---

## 🧠 Principais Decisões Técnicas

- Arquitetura em camadas (**Controller → Service → Repository**)
- Regras de negócio centralizadas na camada de Service
- Status das metas **derivado de ocorrências**, não armazenado diretamente
- Tratamento de datas realizado exclusivamente no backend
- API pensada para consumo direto por frontend (respostas prontas para UI)

Essas decisões tornam o sistema **mais seguro, previsível, testável e fácil de evoluir**.

---

## 🛠️ Tecnologias Utilizadas

- Node.js  
- Express  
- TypeScript  
- PostgreSQL  
- Prisma ORM  
- JWT (JSON Web Token)  
- Yup (validação de dados)  
- bcryptjs (hash de senhas)  

---

## 🔐 Autenticação e Segurança

A autenticação é feita com **JWT**.

### Fluxo de Autenticação

1. Usuário realiza login  
2. O backend gera um token JWT  
3. O token é enviado no header da requisição:

Authorization: Bearer <token>


4. Um middleware valida o token e injeta `userId` na requisição  

Todas as operações utilizam esse `userId` para garantir **isolamento total de dados por usuário**.

---

## 🎯 Metas e Ocorrências (Conceito Central)

O sistema trabalha com dois conceitos principais:

- **Goal (Meta)**: representa a intenção do usuário  
- **GoalOccurrence (Ocorrência)**: representa a execução da meta em uma data específica  

📌 As metas **não possuem status fixo**.  
📌 O progresso é **calculado dinamicamente** a partir das ocorrências.

Essa abordagem garante:
- histórico completo
- maior flexibilidade de regras
- métricas confiáveis

---

## 🔁 Frequência das Metas

As metas podem ser configuradas como:

- Daily (diária)
- Weekly (semanal)
- Monthly (mensal)

O período de avaliação é **calculado automaticamente pelo backend**, evitando dependência do frontend e problemas com timezone.

---

## ✅ Conclusão de Metas

O usuário não “conclui uma meta”, ele **conclui uma ocorrência**.

Exemplo de endpoint:


4. Um middleware valida o token e injeta `userId` na requisição  

Todas as operações utilizam esse `userId` para garantir **isolamento total de dados por usuário**.

---

## 🎯 Metas e Ocorrências (Conceito Central)

O sistema trabalha com dois conceitos principais:

- **Goal (Meta)**: representa a intenção do usuário  
- **GoalOccurrence (Ocorrência)**: representa a execução da meta em uma data específica  

📌 As metas **não possuem status fixo**.  
📌 O progresso é **calculado dinamicamente** a partir das ocorrências.

Essa abordagem garante:
- histórico completo
- maior flexibilidade de regras
- métricas confiáveis

---

## 🔁 Frequência das Metas

As metas podem ser configuradas como:

- Daily (diária)
- Weekly (semanal)
- Monthly (mensal)

O período de avaliação é **calculado automaticamente pelo backend**, evitando dependência do frontend e problemas com timezone.

---

## ✅ Conclusão de Metas

O usuário não “conclui uma meta”, ele **conclui uma ocorrência**.

Exemplo de endpoint:

PATCH /occurrences/:id/complete


Esse modelo permite:
- marcar e desmarcar conclusão
- manter histórico de execuções
- calcular métricas como percentual de conclusão e streaks

---

## 📊 Dashboard

A API fornece um endpoint de dashboard que retorna dados **prontos para renderização** no frontend.

Exemplo:

GET /dashboard?period=daily


Períodos suportados:
- daily
- weekly
- monthly

### O retorno inclui:
- total de ocorrências no período
- quantas foram concluídas
- quantas estão pendentes
- percentual de conclusão
- metas relacionadas

📌 O frontend **não precisa realizar cálculos**.

---

## 📅 Tratamento de Datas

Um dos pontos críticos do projeto é o cuidado com datas:

- Normalização de início e fim de período
- Evita bugs comuns com timestamps ISO
- Toda a lógica de datas reside na camada de Service

Isso garante consistência e previsibilidade nos dados apresentados.

---

## 🧱 Arquitetura do Projeto



Route
→ Controller
→ Service
→ Repository
→ Prisma
→ Database


### Estrutura de Pastas



src/<br>
├─ controllers/<br>
├─ services/<br>
├─ repositories/<br>
├─ middlewares/<br>
├─ routes/<br>
├─ utils/<br>
├─ database/<br>
└─ prisma/<br>


---

## 🚀 Possíveis Evoluções

- Streak de metas
- Soft delete
- Login social (Google)
- Testes automatizados
- DTOs dedicados para frontend
- Cron jobs para geração automática de ocorrências

---

## 🎯 Objetivo Profissional

Este projeto foi desenvolvido para:

- consolidar conceitos avançados de backend
- aplicar boas práticas de arquitetura
- simular um ambiente próximo ao de produção
- servir como **projeto de portfólio técnico**

---

## 👤 Autor

**Luiz Zonetti**  
Backend Developer | Node.js | TypeScript | Prisma

---

### 📌 Nota Final

Este projeto demonstra:
- modelagem consistente de regras de negócio
- pensamento arquitetural
- preocupação com manutenção, escalabilidade e segurança

Sinta-se à vontade para explorar o código e as decisões técnicas adotadas.
