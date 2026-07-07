# Jan Janeček — portfolio pro GitHub Pages

Statické české portfolio pro GitHub Pages. Nepotřebuje build, backend ani instalaci balíčků.

## Jak spustit lokálně

```bash
python3 -m http.server 8080
```

Potom otevři `http://localhost:8080`.

## Jak doplnit projekty

Hlavní obsah je v souboru `projects.js`.

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

Pak v `projects.js` doplň:

```js
image: "assets/screenshots/vijual/main.jpg"
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

## Publikace na GitHub Pages

Repozitář `yaneczech.github.io` se po pushi na GitHub publikuje jako osobní GitHub Pages web.
