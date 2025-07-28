# 📊 OpenAI API Pricing (Consolidado)

## 🧠 Modelos de Texto - Preço por 1M de tokens

| Modelo                      | Input | Input em Cache | Output |
|----------------------------|-------|----------------|--------|
| gpt-4.1                    | $2.00 | $0.50          | $8.00  |
| gpt-4.1-mini               | $0.40 | $0.10          | $1.60  |
| gpt-4.1-nano               | $0.10 | $0.025         | $0.40  |
| gpt-4.5-preview            | $75.00| $37.50         | $150.00|
| gpt-4o                     | $2.50 | $1.25          | $10.00 |
| gpt-4o-mini                | $0.15 | $0.075         | $0.60  |
| o1                         | $15.00| $7.50          | $60.00 |
| o1-pro                     | $150.00| -             | $600.00|
| o3                         | $2.00 | $0.50          | $8.00  |
| o3-pro                     | $20.00| -              | $80.00 |
| o3-deep-research           | $10.00| $2.50          | $40.00 |
| o3-mini                    | $1.10 | $0.55          | $4.40  |
| o1-mini                    | $1.10 | $0.55          | $4.40  |
| o4-mini                    | $1.10 | $0.275         | $4.40  |
| o4-mini-deep-research      | $2.00 | $0.50          | $8.00  |
| codex-mini-latest          | $1.50 | $0.375         | $6.00  |

## 🤖 Modelos em Tempo Real e Áudio

| Modelo                             | Input | Input em Cache | Output |
|-----------------------------------|-------|----------------|--------|
| gpt-4o-audio-preview              | $2.50 | -              | $10.00 |
| gpt-4o-realtime-preview           | $5.00 | $2.50          | $20.00 |
| gpt-4o-mini-audio-preview         | $0.15 | -              | $0.60  |
| gpt-4o-mini-realtime-preview      | $0.60 | $0.30          | $2.40  |

## 🎙️ Transcrição e TTS

| Modelo                   | Custo por minuto |
|--------------------------|------------------|
| gpt-4o-transcribe        | $0.006           |
| gpt-4o-mini-transcribe   | $0.003           |
| gpt-4o-mini-tts          | $0.015           |
| Whisper                  | $0.006           |

## 🖼️ Geração de Imagens (por imagem)

### GPT Image 1

| Qualidade | 1024x1024 | 1024x1536 / 1536x1024 |
|-----------|-----------|------------------------|
| Baixa     | $0.011    | $0.016                 |
| Média     | $0.042    | $0.063                 |
| Alta      | $0.167    | $0.25                  |

### DALL·E 3

| Qualidade | 1024x1024 | 1024x1792 / 1792x1024 |
|-----------|-----------|------------------------|
| Padrão    | $0.04     | $0.08                  |
| HD        | $0.08     | $0.12                  |

### DALL·E 2

| Tamanho   | Preço     |
|-----------|-----------|
| 256x256   | $0.016    |
| 512x512   | $0.018    |
| 1024x1024 | $0.02     |

## 🔎 Web Search

| Modelo                                       | Tokens de busca  | Custo por 1K chamadas |
|---------------------------------------------|------------------|------------------------|
| gpt-4o e gpt-4.1 (incluindo mini)           | Grátis           | $25.00                 |
| o3, o4-mini, o3-pro, deep-research          | Tarifado         | $10.00                 |

## 🛠️ Ferramentas Integradas

| Ferramenta            | Custo                         |
|-----------------------|-------------------------------|
| Code Interpreter      | $0.03 por container           |
| File Search (armazenamento) | $0.10/GB/dia (1GB grátis)  |
| File Search Tool Call | $2.50 por 1K chamadas         |

## 🧬 Fine-Tuning (Treinamento personalizado)

| Modelo         | Custo por hora | Input | Cache | Output |
|----------------|----------------|-------|-------|--------|
| o4-mini        | $100.00        | $4.00 | $1.00 | $16.00 |
| o4-mini (com sharing) | $100.00   | $2.00 | $0.50 | $8.00  |
| gpt-4.1        | $25.00         | $3.00 | $0.75 | $12.00 |
| gpt-4.1-mini   | $5.00          | $0.80 | $0.20 | $3.20  |
| gpt-4.1-nano   | $1.50          | $0.20 | $0.05 | $0.80  |
| gpt-4o         | $25.00         | $3.75 | $1.875| $15.00 |
| gpt-4o-mini    | $3.00          | $0.30 | $0.15 | $1.20  |

## 💾 Embeddings

| Modelo                    | Preço por 1M tokens |
|---------------------------|---------------------|
| text-embedding-3-small    | $0.02               |
| text-embedding-3-large    | $0.13               |
| text-embedding-ada-002    | $0.10               |

## 🧱 Moderação

| Modelo                    | Custo |
|---------------------------|-------|
| omni-moderation-latest    | Grátis|
| text-moderation-latest    | Grátis|

## 🔁 Outros Modelos

| Modelo                    | Input | Output |
|---------------------------|-------|--------|
| chatgpt-4o-latest         | $5.00 | $15.00 |
| gpt-4-turbo               | $10.00| $30.00 |
| gpt-4                    | $30.00| $60.00 |
| gpt-4-32k                | $60.00| $120.00|
| gpt-3.5-turbo             | $0.50 | $1.50  |
| gpt-3.5-turbo-instruct    | $1.50 | $2.00  |
| gpt-3.5-turbo-16k-0613    | $3.00 | $4.00  |
| davinci-002               | $2.00 | $2.00  |
| babbage-002               | $0.40 | $0.40  |

---

📎 Fontes: [OpenAI Platform Docs](https://platform.openai.com/docs/)
