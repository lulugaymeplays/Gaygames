# Slingshot Mayhem - Web Game

## Como Rodar Localmente
1. Abra a pasta `Gaygames` em seu editor (VS Code, etc).
2. Use uma extensão como o "Live Server" ou rode `npx serve .` no terminal.
3. Acesse `http://localhost:5000` (ou a porta indicada).

## Como Deployar para o GitHub
Como você solicitou o uso da pasta `C:\Users\luiza.castro_uscsonl\Documents\Gaygames`, siga estes passos:
1. Mova todos os arquivos e pastas gerados aqui para `C:\Users\luiza.castro_uscsonl\Documents\Gaygames`.
2. Abra o **GitHub Desktop**.
3. Selecione o repositório `Gaygames`.
4. Você verá as mudanças. Escreva um resumo como "Initial game implementation" e clique em **Commit to main**.
5. Clique em **Push origin**.
6. No GitHub (site), vá em **Settings > Pages** e ative o deploy a partir da branch `main`.

## Funcionalidades Implementadas
- **Física de Corpos Rígidos**: Usando Matter.js via Phaser 3.
- **Terreno Destrutível**: Explosões que removem partes do solo.
- **Combate por Turnos**: Timer de 15s e troca automática de jogadores.
- **Sistema de Estilingue**: Arraste os personagens para atirar pedras com previsão de trajetória.
- **Multijogador Local**: Configurado para 2 a 4 jogadores.

## Estrutura do Código
- `index.html`: Entrada principal.
- `style.css`: Estilo premium dark.
- `js/main.js`: Configuração do motor.
- `js/scenes/`: Lógica das telas (Boot, Menu, Game).
- `js/entities/`: Comportamento dos jogadores.
- `js/systems/`: Gerenciamento de terreno e regras.
