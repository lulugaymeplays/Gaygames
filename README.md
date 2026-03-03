# 🐑 Sheep Mayhem!

Um jogo de duelo estratégico onde ovelhas se enfrentam em um ambiente totalmente destrutível.

## 🚀 Como Executar (Importante!)

Este jogo usa **Módulos JavaScript modernos**. Por razões de segurança, os navegadores não permitem que esses módulos sejam carregados diretamente de um arquivo local (`file://`). 

**O jogo NÃO funcionará se você apenas clicar duas vezes no `index.html`.**

### Maneira mais fácil:
Se você usa o **VS Code**, instale a extensão **"Live Server"**, clique com o botão direito no `index.html` e selecione **"Open with Live Server"**.

### Outras maneiras (usando terminal):
Abra o prompt de comando ou terminal na pasta `Documents\Gaygames` e use um destes comandos:

- **Node.js**: `npx serve .` (depois abra `localhost:3000`)
- **Python**: `python -m http.server 8000` (depois abra `localhost:8000`)

---

## 🎮 Controles
- **Mouse (Mira)**: Clique e arraste na sua ovelha para trás (efeito estilingue) para mirar.
- **Mouse (Atirar)**: Solte o botão para disparar uma bola de lã potente.
- **Objetivo**: Derrube o adversário do cenário ou reduza a vida dele (barra verde) a zero usando explosões.

## ✨ Recursos
- **Física de Matter.js**: Colisões realistas e terreno destrutível.
- **Sistema de Turnos**: Mecânica clássica de duelo estratégico.
- **Gráficos procedurais**: Ovelhas e grama geradas por código para máxima performance.
