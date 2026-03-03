# Sheep Mayhem

Jogo de duelo entre ovelhas com física destrutível.

## Como Jogar

Como o jogo utiliza módulos JavaScript modernos, ele precisa ser servido por um servidor local para funcionar corretamente no seu navegador. Escolha um dos métodos abaixo:

### Opção A: Usando Node.js (Recomendado)
Se você tem Node.js instalado, abra o terminal na pasta do jogo e execute:
`npx serve .`
Depois, abra `http://localhost:3000` no seu navegador.

### Opção B: Usando Python
Se você tem Python instalado, execute:
`python -m http.server 8000`
Depois, abra `http://localhost:8000` no seu navegador.

### Opção C: Extensão do VS Code
Se você usa VS Code, instale a extensão "Live Server", clique com o botão direito no `index.html` e selecione "Open with Live Server".

## Controles
- **Mouse**: Clique e arraste na sua ovelha (como um estilingue) para mirar e solte para atirar uma bola de lã.
- O objetivo é zerar a vida da outra ovelha ou derrubá-la do terreno.
