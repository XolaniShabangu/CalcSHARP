# CalculatorQuirk


A project I built to practice JavaScript while working through a web development course. It's a fully functional calculator with a hidden trick — hit the `</>` button and watch the interface scatter across the screen, revealing a live C# code executor powered by the Wandbox API.

## Why I Built This

I made this project to test and apply my JavaScript skills as I work through a web dev course. The goal was to go beyond a plain calculator and push into DOM manipulation, async fetch calls, animations, and layout logic — all in vanilla JS with no frameworks.

## Features

### Calculator Mode
- Standard arithmetic: `+`, `−`, `×`, `÷`
- Percentage, plus/minus toggle, and decimal support
- Thousand-separator formatting (e.g. `1,234.56`)
- Live expression display while typing
- Context-sensitive AC / C button
- Division by zero handling
- Full keyboard support:

| Key | Action |
|-----|--------|
| `0–9`, `.` | Input digits |
| `+` `-` `*` `/` | Operators |
| `Enter` or `=` | Evaluate |
| `Backspace` | Clear entry |
| `Escape` | Full reset |
| `%` | Percentage |

### Code Mode
Press `</>` to trigger the code mode animation:

- Calculator buttons scatter and rotate across the screen
- A C# console slides up from below
- Write and run C# snippets via the [Wandbox](https://wandbox.org) API (Mono 6.12)
- Simple snippets are auto-wrapped in a `Main()` method — no boilerplate needed
- `Enter` to run, `Shift+Enter` for a newline
- Color-coded output: gray for input, white for output, red for errors


## Tech

- Vanilla HTML/CSS/JS — no frameworks or dependencies
- C# execution via [Wandbox REST API](https://wandbox.org)
- Google Fonts (Silkscreen)



