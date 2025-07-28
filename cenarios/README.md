# Sistema de Cenários - Calculadora Auditor.IA

## 📁 Como Funciona

Este sistema permite salvar, carregar e gerenciar diferentes configurações (cenários) para a calculadora de precificação.

## 🎯 Funcionalidades

### **1. Carregar Cenários**
- **Dropdown "📁 Carregar Cenário"**: Selecione um cenário pré-definido ou salvo
- **Cenários Built-in**:
  - **Configuração Padrão**: Valores padrão baseados no README
  - **Startup Conservador**: Crescimento gradual, preços acessíveis
  - **Crescimento Agressivo**: Crescimento acelerado, preços premium

### **2. Salvar Cenários**
- **Botão "💾 Salvar"**: Salva a configuração atual
- **Funcionalidades**:
  - ✅ Nome e descrição personalizados
  - ✅ Define como padrão (carrega automaticamente)
  - ✅ Armazena no navegador (localStorage)
  - ✅ Baixa arquivo JSON automaticamente

### **3. Sistema de Padrão**
- **Carregamento automático**: O cenário padrão é carregado ao abrir a calculadora
- **Definir padrão**: Ao salvar, você pode escolher se será o novo padrão

## 📂 Estrutura dos Arquivos

### **Formato JSON do Cenário:**
```json
{
  "nome": "Nome do Cenário",
  "descricao": "Descrição detalhada",
  "dataCriacao": "2025-01-27",
  "autor": "Seu Nome",
  "parametros": {
    "crescimento": {
      "usuariosIniciais": 0,
      "mesInicioUsuario": 1,
      "aumentoAbsolutoMensal": 50,
      "metaUsuarios6m": 300,
      "periodoProjecao": 12
    },
    "iaOperacionais": {
      "usdBrl": 5.80,
      "iofRate": 6.38,
      "custoInputToken": 0.15,
      "custoOutputToken": 0.60,
      "custoFixoMensal": 5000
    },
    "planos": {
      "basico": { "creditos": 200, "preco": 29.90 },
      "pro": { "creditos": 1000, "preco": 99.90 },
      "max": { "creditos": 5000, "preco": 399.90 }
    },
    "creditosAvulsos": {
      "pacoteCreditos": 100,
      "precoPackage": 19.90,
      "posPago": false,
      "riscoInadimplencia": 5
    },
    "testeGratuito": {
      "creditosIniciais": 50,
      "percentualUsuarios": 80
    }
  }
}
```

## 🚀 Como Usar

### **Criar um Novo Cenário:**
1. Configure todos os parâmetros na calculadora
2. Clique em "💾 Salvar"
3. Digite nome e descrição
4. Escolha se será o padrão
5. O arquivo JSON será baixado automaticamente

### **Usar um Cenário Existente:**
1. Selecione no dropdown "📁 Carregar Cenário"
2. Todos os campos serão preenchidos automaticamente
3. Os cálculos são atualizados instantaneamente

### **Compartilhar Cenários:**
1. Salve o cenário (gera arquivo JSON)
2. Compartilhe o arquivo JSON
3. Outros usuários podem importar via drag & drop do arquivo

## 💾 Armazenamento

- **Local**: Cenários salvos ficam no navegador (localStorage)
- **Portável**: Arquivos JSON podem ser compartilhados
- **Backup**: Sempre baixa arquivo JSON ao salvar

## 🔧 Personalização

Você pode editar manualmente os arquivos JSON para:
- Ajustar valores específicos
- Adicionar observações detalhadas
- Criar variações de cenários existentes

## 📋 Cenários Incluídos

### **1. Configuração Padrão**
- Usuários: 0 → 600 em 12 meses (50/mês)
- Planos: R$ 29,90 / R$ 99,90 / R$ 399,90
- Custo fixo: R$ 5.000/mês

### **2. Startup Conservador**
- Usuários: 0 → 450 em 18 meses (25/mês)
- Planos: R$ 19,90 / R$ 79,90 / R$ 299,90
- Custo fixo: R$ 3.000/mês

### **3. Crescimento Agressivo**
- Usuários: 10 → 1.210 em 12 meses (100/mês)
- Planos: R$ 49,90 / R$ 149,90 / R$ 599,90
- Custo fixo: R$ 8.000/mês

## 🎯 Dicas

- **Teste diferentes cenários** para encontrar o modelo ideal
- **Defina um padrão** para sua configuração mais usada
- **Salve variações** para comparar estratégias
- **Use nomes descritivos** para facilitar identificação
- **Faça backup** dos arquivos JSON importantes