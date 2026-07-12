# Jan Janeček — portfolio pro GitHub Pages

Statické české portfolio pro GitHub Pages. Nepotřebuje build, backend ani instalaci balíčků.

## Jak spustit lokálně

```bash
python3 -m http.server 8080
```

Potom otevři `http://localhost:8080`.

Pokud chceš z pomocné stránky anotací ukládat body přímo do JSON souborů, spusť
místo toho lokální annotation server:

```bash
node tools/annotation-server.mjs
```

Potom otevři `http://localhost:8080/annotations.html`. Tlačítko „Uložit do
JSONu“ je dostupné jen v tomto lokálním režimu; na GitHub Pages zůstává web
statický a soubory nezapisuje.

## Jak doplnit projekty

Hlavní obsah je ve složce:

```text
data/projects/
```

Každý projekt má vlastní JSON soubor, například:

```text
data/projects/vijual.json
```

Pořadí a seznam načítaných projektů určuje manifest:

```text
data/projects/index.json
```

Když přidáš nový projekt, vytvoř nový JSON soubor a přidej jeho název do pole
`projects` v `data/projects/index.json`.

U každého projektu můžeš upravit:

- `title` — název projektu
- `type` — typ projektu
- `role` — tvoje role
- `intro`, `context`, `implementation`, `status` — texty case study
- `decisions` — odrážky klíčových rozhodnutí
- `links` — odkazy na živý projekt nebo detail
- `screens` — screenshoty a hotspoty

## Screenshoty

Vlož obrázky do složky:

```text
assets/screenshots/
```

Například:

```text
assets/screenshots/vijual/main.jpg
```

Pak v JSON souboru projektu doplň:

```json
"image": "assets/screenshots/vijual/main.jpg"
```

## Hotspoty

Hotspoty jsou v procentech vůči screenshotu:

```js
{
  x: 67,
  y: 42,
  title: "Komponentové myšlení",
  text: "Krátké vysvětlení konkrétního místa ve screenu."
}
```

`x` je vodorovná pozice, `y` je svislá pozice.

### Pomocné mapování hotspotů a editace screenů

Pro rychlé určení pozic otevři:

```text
http://localhost:8080/annotations.html
```

Stránka načte projekty z `data/projects/`, dovolí upravit anotaci projektu,
název screenu, popisek screenu a anotační body. Při spuštění přes
`node tools/annotation-server.mjs` tlačítko „Uložit do JSONu“ zapíše změny
přímo do příslušného JSON souboru.

## Publikace na GitHub Pages

Repozitář `yaneczech.github.io` se po pushi na GitHub publikuje jako osobní GitHub Pages web.
