# Entrega — Jefferson Silva

Sistema de check-in de pacientes: API em NestJS, front em React e consumo do
serviço de cadastro fornecido (`mock-service`).

## Como rodar

**Pré-requisitos:** Node 20+ e pnpm (`npm i -g pnpm`).

Usei pnpm pela instalação mais rápida e pelo menor uso de disco — ele mantém
um store único e usa links em vez de copiar os pacotes em cada projeto. O
`pnpm-lock.yaml` está versionado para garantir as mesmas versões em qualquer
máquina. Os scripts funcionam com npm ou yarn, mas aí o lockfile é ignorado.

São três serviços. Abra um terminal para cada, nesta ordem.

**1. mock-service** — cadastro de pacientes (porta 4000)

```bash
cd mock-service
npm install
npm start
```

**2. api** — NestJS (porta 3000)

```bash
cd api
cp .env.example .env
pnpm install
pnpm run start:dev
```

**3. web** — React + Vite (porta 5173)

```bash
cd web
cp .env.example .env
pnpm install
pnpm run dev
```

Abra <http://localhost:5173>. A barra superior alterna entre a tela do
**Totem** (onde o paciente digita o CPF) e a da **Recepção** (fila do dia).

Os CPFs de teste estão no `mock-service/README.md`.

**Testes do back-end:**

```bash
cd api && pnpm test
```

## O que foi feito

### Back-end (`api/`)

API REST em NestJS com dois endpoints, sob o prefixo `/api`:

| Método | Rota            | O que faz                                        |
| ------ | --------------- | ------------------------------------------------ |
| POST   | `/api/checkins` | Registra o check-in a partir do CPF              |
| GET    | `/api/checkins` | Lista a fila, da chegada mais antiga à mais nova |

Ao criar o check-in, a API consulta o `mock-service` (`GET /pacientes/:cpf`)
para obter o nome do paciente e grava na fila com o horário de chegada.

**Respostas:**

| Status | Quando                                    |
| ------ | ----------------------------------------- |
| 201    | Check-in registrado                       |
| 400    | CPF ausente ou fora do formato            |
| 404    | CPF não encontrado no cadastro            |
| 409    | Já existe check-in para esse CPF          |
| 503    | Cadastro externo indisponível             |

**Organização:** o `CheckInsController` recebe e responde; o `CheckInsService`
concentra a regra (consultar o cadastro, barrar duplicidade, registrar com o
horário); o `CreateCheckInDto` valida a entrada.

**Testes:** quatro testes de unidade no `CheckInsService` com vitest, cobrindo
os quatro caminhos possíveis do check-in — criado, CPF inexistente, cadastro
fora do ar e duplicado. O `HttpService` é substituído por um dublê, então os
testes rodam sem o `mock-service` no ar e são determinísticos.

### Front-end (`web/`)

React com Vite e TypeScript, estilizado com Tailwind e shadcn/ui.

- **Totem** — teclado numérico para digitar o CPF, confirmação com o nome do
  paciente e o horário de chegada, e mensagens de erro vindas da API.
- **Recepção** — fila com posição, nome, CPF mascarado, horário e tempo de
  espera. Recarrega sozinha a cada 15 segundos.

O front conversa apenas com a API; nunca chama o `mock-service` direto. Em
desenvolvimento, o proxy do Vite encaminha `/api` para `localhost:3000`, o que
evita CORS.

## Onde guardei os dados

**Em memória**, num array dentro do `CheckInsService`. A fila vive enquanto o
processo da API roda — reiniciar a API zera os check-ins.

Escolhi assim porque o enunciado aceita, e porque o núcleo do desafio é a
integração com o cadastro externo e o fluxo de check-in, não a persistência.
Preferi entregar esse núcleo funcionando e testado a dividir o tempo com
migrações e configuração de banco.

Para trocar por um banco, a mudança fica contida no `CheckInsService`: as
operações sobre o array (`push`, `find`) virariam chamadas a um repositório.
A regra de negócio e os endpoints não mudam.

## Uso de assistente de IA

Usei o Claude como apoio ao longo do desafio, sempre em conjunto com a
documentação oficial do NestJS. Comuniquei isso à Victoria.

Onde ele entrou:

- **Boas práticas do NestJS.** Como organizar módulo, controller e service, e
  onde cada responsabilidade deveria morar. Cruzei cada orientação com a
  documentação antes de aplicar.
- **Testes automatizados.** Foi onde mais ajudou, porque era o assunto mais
  novo para mim — entender o que o arquivo `.spec.ts` faz, o que cada `it`
  representa e por que mockar o `HttpService` em vez de depender do
  `mock-service` no ar.
- **Este documento.** Organizei com ele o que eu tinha anotado ao longo do
  desenvolvimento.

Onde ele não entrou: nas decisões. A escolha de separar 404 de 503, de não
expor o nome do paciente na mensagem de duplicidade, de apagar a confirmação
do totem depois de 5 segundos e de guardar a fila em memória foram minhas,
pensando no contexto de uso.

Validei tudo o que entreguei. Cada endpoint foi testado na mão com `curl`
antes de ir para o front, cada caminho de erro foi provocado de propósito
(derrubei o `mock-service` para ver o 503, repeti o CPF para ver o 409), e os
bugs descritos abaixo foram encontrados assim.

## Decisões e dificuldades

### Primeira entrega real com NestJS

Minha experiência com back-end em Node vinha de Express. NestJS eu conhecia de
estudo, não de prática — decoradores, injeção de dependência e a divisão em
módulos, controller e service eram conceitos que eu tinha lido, mas nunca
tinha aplicado de ponta a ponta.

Levei um tempo para me situar na estrutura, principalmente para entender onde
cada responsabilidade deveria morar e como o Nest resolve as dependências do
construtor. Em nenhum momento deixei de estudar para contornar — fui atrás da
documentação até entender. Depois que isso assentou, o resto fluiu, e a
organização que a princípio parecia cerimônia passou a fazer sentido: o
controller ficou pequeno justamente porque a regra tem lugar próprio.

### 404 e 503 são respostas diferentes

"CPF não cadastrado" e "não consegui falar com o cadastro" levam a ações
diferentes na recepção. No primeiro caso o paciente precisa se cadastrar; no
segundo, o dado dele pode estar certo e o problema é nosso. Se eu devolvesse
404 nos dois, a recepção mandaria o paciente conferir um número que estava
correto.

Só o 404 vindo do cadastro vira `NotFoundException`. Qualquer outra falha —
timeout, conexão recusada — vira `ServiceUnavailableException`.

### Validação do CPF só de formato

Confiro 11 dígitos, não os dígitos verificadores. Quem decide se o CPF existe
é o cadastro do hospital, e CPFs de teste normalmente não passam no cálculo do
dígito. Aplicar essa validação quebraria o fluxo com os CPFs fornecidos.

A máscara é removida no DTO com `@Transform`, então o resto da aplicação só
lida com dígitos. O front segue a mesma regra, para não barrar antes da API.

### A mensagem de duplicidade deixou de identificar o paciente

Primeiro implementei o 409 trazendo o nome e o horário: "Ana Souza já realizou
o check-in às 21:00". Era mais claro para o paciente.

Revi depois de pensar em onde a tela fica. O totem é público e não tem
controle de acesso: qualquer pessoa pode digitar CPFs até acertar um que está
na fila, e descobrir a quem aquele CPF pertence — e que a pessoa está no
hospital naquele momento.

A mensagem passou a trazer só o horário e orientar a procurar a recepção, que
tem contexto para resolver. Pelo mesmo motivo, a tela de confirmação do
check-in se apaga sozinha após 5 segundos: o nome do paciente anterior não
precisa ficar visível para quem está na fila.

### Duplicidade é verificada antes de consultar o cadastro

Se o CPF já está na fila, ele foi validado no cadastro quando entrou.
Consultar de novo seria uma chamada HTTP desperdiçada — e, num totem onde o
paciente aperta o botão duas vezes, é o caso mais frequente.

### O erro que não apareceu como erro

Assumi que a rota do cadastro seria `/patients/:cpf` com o campo `name`, por
hábito de nomear em inglês. O `mock-service` usa `/pacientes/:cpf` e devolve
`nome`.

O primeiro erro foi claro: 404. O segundo não. Depois de corrigir só a rota, o
check-in era criado com **201** e o nome vinha vazio — `data.name` não existe,
e o JSON simplesmente omite `undefined`. Status de sucesso, dado faltando.

Só percebi olhando o corpo da resposta. Desde então passei a conferir o payload
nos testes manuais, não apenas o código HTTP.

Esse episódio deixou claro que o código estava falando duas línguas: o domínio
vinha em português do cadastro e eu expunha `patientName` e `arrivedAt` na
minha API. Padronizei o domínio em português e mantive em inglês só os termos
de framework (`Service`, `Controller`, `Dto`), num commit de refactor separado.

### Um bug que não aparecia na minha máquina

A mensagem do 409 formatava o horário com `toLocaleTimeString`, que usa o fuso
de onde o código roda. Na minha máquina bate com São Paulo. Num container
Docker, cujo padrão é UTC, o paciente que chegou às 18:10 leria "21:10".

Corrigi fixando `timeZone: 'America/Sao_Paulo'` na formatação e definindo `TZ`
no `.env`.

### A fila da recepção não acompanhava o totem

A tela da Recepção recarregava quando um check-in era criado — mas só se o
check-in acontecesse na mesma instância da aplicação, porque o sinal era um
estado do React.

No hospital, o totem é um equipamento e a recepção é outro. Estado de React não
cruza máquinas: a recepcionista abriria a tela e ela ficaria parada enquanto
pacientes chegassem no totem.

Resolvi com polling a cada 15 segundos. Para esse volume, consultar
periodicamente é mais simples do que manter conexão aberta.

### Testes automatizados foram a parte mais nova

Já testava APIs manualmente, mas não com framework. O scaffold do Nest já cria
um `.spec.ts` ao lado de cada service, e isso ajudou a começar: o arquivo
estava lá com a estrutura montada, e eu precisei entender o que cada parte
fazia em vez de montar tudo do zero.

Escolhi cobrir o `CheckInsService` porque é onde está a regra — o controller
só repassa, e testá-lo verificaria o NestJS, não o meu código.

Para entender o que os testes realmente garantem, apaguei a regra de
duplicidade e rodei a suíte: passou. Não havia teste cobrindo aquela regra.
Escrevi o teste, apaguei a regra de novo, e aí falhou apontando o
comportamento quebrado. Ficou claro que o teste só protege o que ele cobre —
suíte verde não significa código correto, significa que nada do que é
verificado está errado.

## O que faria com mais tempo

**Dar baixa na fila.** Hoje a duplicidade bloqueia enquanto o processo roda.
Um paciente atendido de manhã que voltasse à tarde seria recusado. Falta um
status (`aguardando` / `atendido`) ou um recorte por dia.

**Banco de dados.** Trocaria o array por PostgreSQL, com a mudança contida no
service. Resolveria a volatilidade da fila ao reiniciar.

**Docker.** Subir os três serviços com `docker compose up`, usando o
`docker-compose.yml` que já vem no repositório como ponto de partida.

**Atualização em tempo real.** Trocar o polling por SSE ou WebSocket, para a
recepção receber os check-ins no instante em que acontecem.

**Limite de tentativas no totem.** Mesmo com a mensagem genérica, as respostas
404 e 409 permitem, em tese, enumerar o cadastro testando CPFs. Um limite por
terminal reduziria isso.

**Melhorias na tela da recepção.** Destacar quem espera há mais de 30 minutos
e permitir busca por nome ou CPF — úteis quando a fila cresce.

**Teste de integração.** Os testes atuais são de unidade. Um teste que suba a
aplicação e bata nos endpoints cobriria a fiação (rotas, `ValidationPipe`,
prefixo), que hoje validei manualmente com `curl`.

**Documentação da API.** Com dois endpoints, a tabela acima dá conta. Num
projeto com mais rotas, exporia um contrato OpenAPI com `@nestjs/swagger`,
para que quem consome a API não dependa de ler o código ou o README — e para
que o contrato acompanhe as mudanças em vez de envelhecer em um documento à
parte.

### Avisar o paciente pelo celular

O cadastro devolve `cpf`, `nome`. Se ele também tivesse
telefone, daria para enviar a confirmação do check-in por SMS ou WhatsApp —
e, principalmente, avisar quando o paciente fosse chamado.

Na recepção de um hospital o paciente raramente fica parado olhando o painel:
vai ao banheiro, à cafeteria, atende uma ligação. Perder a chamada significa
voltar para o fim da fila ou atrasar o atendimento de todo mundo atrás. Um
aviso no celular resolve isso sem exigir que ele fique preso à cadeira.

Tecnicamente, eu colocaria o envio numa fila de mensagens em vez de chamar o
provedor direto no fluxo do check-in: se o serviço de SMS estiver fora do ar,
o check-in não pode falhar por causa disso.