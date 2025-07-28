# README Executivo: Calculadora de Precificação — Auditor.IA

Este documento fornece uma **visão executiva** sobre como realizar as análises na calculadora de precificação do Auditor.IA. Aqui estão todos os **parâmetros essenciais**, **métodos de cálculo** e **métricas** que devem estar presentes, sem entrar em detalhes de código.

---

## 1. Parâmetros de Crescimento de Usuários

- **Usuários Iniciais**: quantidade de usuários no primeiro mês (pode ser 0).
- **Mês de Início do Primeiro Usuário**: opcional para deslocar o início da série.
- **Aumento Absoluto Mensal**: número fixo de novos usuários adicionados a cada mês, em quantidade (não percentual).
- **Meta de Usuários em 6 Meses**: objetivo de base de usuários ao final do sexto mês.
- **Período de Projeção**: número total de meses para análise (ex.: 12).

> **Uso**: gerar série de usuários mês a mês mesmo que comece em zero, respeitando o ritmo absoluto de aquisição e comparando com a meta semestral.

---

## 2. Parâmetros de Custos de IA e Operacionais

- **Taxa de Câmbio (USD/BRL)**: para conversão de custos de API.
- **IOF (%)**: imposto adicional sobre transações internacionais.
- **Custo por 1.000.000 Tokens (Input e Output)**: valores em USD separados.
- **Custo Fixo Mensal**: custo operacional fixo total (em R\$) que **não varia** com o número de usuários. Exemplo: aluguel, plataformas, salários mínimos.

> **Cálculo**:
>
> - **Custo Variável** = (tokens consumidos × custo por token × câmbio × (1 + IOF))
> - **Custo Total** = Custo Variável + **Custo Fixo Mensal**

---

## 3. Parâmetros de Créditos e Preços por Plano

Adote 1 crédito = 100 tokens.

- **Plano Básico**

  - Créditos/mês (ex.: 200)
  - Preço (R\$)

- **Plano Pró**

  - Créditos/mês (ex.: 1000)
  - Preço (R\$)
  - Objetivo: principal plano, com diferença de preço reduzida para incentivar adesão.

- **Plano Max**

  - Créditos/mês (ex.: 5000)
  - Preço (R\$)
  - Uso de ancoragem de valor.

> **Receita de Plano** = preço\_plano × quantidade\_de\_assinantes

---

## 4. Parâmetros de Compra Avulsa de Créditos

- **Pacote de Créditos**: créditos pré-pagos (ex.: 100).
- **Preço do Pacote**: valor em R\$.
- **Pós-pago**: sem limite inicial, com parâmetro de **risco de inadimplência (%)**.

> **Receita Avulsa Pré-pago** = preço\_pacote × vendas
>
> **Receita Avulsa Pós-pago** = preço\_pacote × vendas\_estimada × (1 − risco\_inadimplência)

---

## 5. Parâmetros de Teste Gratuito

- **Créditos Iniciais**: volume de créditos gratuitos para novos usuários.
- Permite experiência sem necessidade de cartão.

> **Avaliação**: impacto na conversão para plano pago.

---

## 6. Projeção e Simulação

1. **Série Temporal de Usuários**

   - `Usuários[0] = Usuários Iniciais` (pode ser 0).
   - `Usuários[mês] = Usuários[mês−1] + Aumento Absoluto Mensal`.
   - Permitir que a simulação comece em zero e o primeiro usuário apareça no mês configurado.

2. **Cálculo Mensal de Custos e Receitas**

   - **Custos**:
     - Variável (IA) por usuários e consumo.
     - **Custo Fixo Mensal** constante, independente de usuários.
   - **Receitas**:
     - Planos (assinaturas).
     - Créditos avulsos (pré e pós-pago).

3. **Métricas Agregadas e Médias**

   - **MRR** (receita média mensal): soma\_receitas\_planos / meses
   - **ARR**: MRR × 12

> **Validação**: ao usar 0 usuários iniciais, o modelo deve gerar 0 receita e custos variáveis, mas deve incluir o Custo Fixo Mensal na análise.

---

## 7. KPIs e Métricas Financeiras

- **MRR**: receita recorrente média mensal
- **ARR**: receita anual recorrente
- **LTV**: valor vitalício por cliente
- **Payback Period**: meses para recuperar investimento inicial
- **ROI (%)**: (Lucro Total ÷ Custo Total) × 100
- **Margem Bruta (%)**: (Receita − Custos)/Receita × 100
- **Lucro Líquido Mensal**: Receita − Custos (incluir sempre o custo fixo)

---

## 8. Exportação de Cenários

Botão de **Exportar PDF** deve incluir:

- Resumo dos parâmetros configurados
- Tabela de evolução de usuários mês a mês
- Gráficos de usuários, receitas e custos
- KPIs principais

---

## 9. Notas de Validação

1. **Zero Usuários Iniciais**: a simulação deve suportar 0 sem gerar erros; custos variáveis serão zero, custo fixo permanece.
2. **Parâmetros Validados**: impedir valores negativos ou inconsistentes.
3. **Revisão de Fórmulas**: garantir que o custo fixo seja somado uma única vez por mês, não por usuário.
4. **Testes Manual vs Automático**: comparar resultados manuais para garantir exatidão.

---

Este guia executivo assegura que a equipe tenha clareza total sobre **parâmetros**, **métodos de cálculo** e **validações** necessárias para uma análise confiável na calculadora.

---

## 10. Descrição da Interface HTML

A interface deve seguir um layout em **duas colunas responsivas**:

- **Sidebar (coluna à esquerda)**
  - Contém **todos os controles e parâmetros** (inputs, sliders, campos, checkboxes).
  - Deve ser **redimensionável** pelo usuário (drag horizontal) para ajustar largura.
  - Se o conteúdo exceder a altura ou largura, exibir **scrollbars** automáticas.
  - Agrupar parâmetros em seções claras: Crescimento, IA, Planos, Avulsos, Teste.

- **Dashboard (coluna à direita)**
  - Exibe **gráficos** (Chart.js) e **tabela de resultados**.
  - Os gráficos devem ser **empilhados verticalmente** quando a largura da tela for reduzida.
  - Permitir **scroll vertical** se a altura total exceder a viewport.

- **Responsividade**
  - Em telas pequenas, as colunas se empilham (sidebar acima, dashboard abaixo).
  - Inputs e cards redimensionam para preencher 100% da largura disponível.
  - Gráficos e tabelas ajustam altura e largura dinamicamente.

Com essa descrição, a equipe terá referência de como estruturar o HTML, CSS e JavaScript para atender à experiência de usuário desejada.

