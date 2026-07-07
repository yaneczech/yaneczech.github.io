window.portfolioProjects = [
  {
    slug: "vijual",
    title: "Vijual",
    orderLabel: "01",
    type: "vlastní aplikace",
    role: "produktový design, UI systém, frontend implementace",
    annotation:
      "Aplikace pro práci s vizuálními podklady a jejich přehlednou prezentaci.",
    intro:
      "Vlastní aplikace zaměřená na práci s vizuálními podklady a přehlednou prezentaci obsahu. Projekt ukazuje propojení návrhu produktu, komponentového uvažování a praktické frontend realizace.",
    context:
      "Cílem bylo navrhnout rozhraní, které zůstává čitelné i při větším množství obsahu a zároveň nepůsobí jako univerzální administrační šablona.",
    decisions: [
      "Důraz na rychlou orientaci, jasnou hierarchii a nízký vizuální šum.",
      "Komponenty navržené tak, aby byly rovnou přenositelné do HTML/CSS.",
      "Rozhraní řešené s ohledem na budoucí rozšíření a práci s různými typy obsahu."
    ],
    implementation:
      "Návrh i implementaci řeším v jednom toku: UI logika, responzivita, typografie, prázdné stavy a detailní interakce nejsou oddělené od výsledného kódu.",
    status:
      "Ukázky v portfoliu doporučuji vést jako autorský stav rozhraní, ne jako později upravovaný provozní obsah.",
    links: [],
    screens: [
      {
        title: "Hlavní pracovní plocha",
        image: "",
        alt: "Screenshot aplikace Vijual",
        caption: "Nahraj screenshot do assets/screenshots/vijual/main.jpg a doplň cestu v projects.js.",
        hotspots: [
          {
            x: 22,
            y: 24,
            title: "Informační hierarchie",
            text: "Místo dekorace je důležitá čitelnost priorit: co je hlavní obsah, co je akce a co je jen doplňující stav."
          },
          {
            x: 67,
            y: 42,
            title: "Komponentové myšlení",
            text: "Prvky jsou navržené tak, aby šly udržovat jako malé opakovatelné části, ne jako jednorázový vizuální návrh."
          },
          {
            x: 48,
            y: 72,
            title: "Frontend detail",
            text: "Rozestupy, stavy, responzivní chování a focus nejsou dodatečná vrstva, ale součást návrhu."
          }
        ]
      }
    ]
  },
  {
    slug: "vijual-bake-studio",
    title: "Vijual Bake Studio",
    orderLabel: "02",
    type: "navazující produkt",
    role: "produktový design, UI systém, frontend implementace",
    annotation:
      "Navazující workflow k Vijualu pro přípravu a kontrolu výstupů v dalším kroku procesu.",
    intro:
      "Navazující část ekosystému Vijual. V portfoliu má smysl ji ukázat hned po hlavní aplikaci, protože vysvětluje rozšíření stejného principu do dalšího pracovního toku.",
    context:
      "Projekt řeší, jak zachovat konzistentní jazyk rozhraní a současně podpořit specifický proces, který má jiné tempo i jiné priority než hlavní aplikace.",
    decisions: [
      "Návaznost na Vijual bez slepého kopírování stejné obrazovky.",
      "Vizuální systém drží kontinuitu, ale pracovní akce mají vlastní prioritu.",
      "Rozhraní počítá s tím, že uživatel potřebuje rychle ověřovat stav a výsledek."
    ],
    implementation:
      "Frontend část je vhodné prezentovat přes detailní stavy, responzivní chování a práci s komponentami, které se dají vysvětlit přímo nad screenshotem.",
    status: "Autorský stav / vlastní produktový směr.",
    links: [],
    screens: [
      {
        title: "Navazující workflow",
        image: "",
        alt: "Screenshot aplikace Vijual Bake Studio",
        caption: "Nahraj screenshot do assets/screenshots/vijual-bake-studio/main.jpg a doplň cestu v projects.js.",
        hotspots: [
          {
            x: 28,
            y: 30,
            title: "Kontinuita systému",
            text: "Rozhraní navazuje na Vijual, ale nepředstírá, že jde o stejný typ práce."
          },
          {
            x: 72,
            y: 36,
            title: "Priorita akcí",
            text: "Důležité akce mají jasnou pozici a viditelnost bez nutnosti přidávat další vizuální vrstvy."
          },
          {
            x: 54,
            y: 68,
            title: "Stavy a zpětná vazba",
            text: "Stav procesu je součást návrhu, ne až textová hláška přidaná na konci implementace."
          }
        ]
      }
    ]
  },
  {
    slug: "rozvrhel",
    title: "Rozvrhel",
    orderLabel: "03",
    type: "aplikace / plánování",
    role: "UX/UI design, informační architektura, frontend implementace",
    annotation:
      "Nástroj pro rychlou orientaci v rozvrhu, plánování a stavových informacích.",
    intro:
      "Aplikace pro přehled nad rozvrhem a plánováním. Silná ukázka práce s komplexnější strukturou, kde je potřeba udržet rychlou orientaci a praktickou použitelnost.",
    context:
      "U plánovacích nástrojů často rozhoduje méně grafický efekt a více přesná hierarchie, čitelnost stavů a stabilní chování rozhraní.",
    decisions: [
      "Rozvrhové informace jsou vedené jako primární obsah, ne jako dekorativní tabulka.",
      "Důležité stavy a konflikty musí být poznatelné bez dlouhého vysvětlování.",
      "Interakce mají podporovat rychlou kontrolu, ne zbytečné přepínání kontextu."
    ],
    implementation:
      "Projekt je vhodný pro ukázku layoutu, responzivních pravidel, detailu tabulek/slotů a přístupnosti ovládacích prvků.",
    status: "Ukázky doporučuji popsat přes autorský návrh a implementační řešení.",
    links: [],
    screens: [
      {
        title: "Rozvrhová plocha",
        image: "",
        alt: "Screenshot aplikace Rozvrhel",
        caption: "Nahraj screenshot do assets/screenshots/rozvrhel/main.jpg a doplň cestu v projects.js.",
        hotspots: [
          {
            x: 18,
            y: 38,
            title: "Rychlé skenování",
            text: "Rozhraní musí jít číst po řádcích i po blocích; uživatel nesmí ztratit orientaci v mřížce."
          },
          {
            x: 62,
            y: 28,
            title: "Stavové informace",
            text: "Konflikty, volné sloty nebo upozornění mají mít jasnou vizuální prioritu."
          },
          {
            x: 78,
            y: 72,
            title: "Responzivní pravidla",
            text: "U plánovacích rozhraní nestačí prosté zmenšení. Je potřeba rozhodnout, co se skládá, co zůstává a co se mění v detail."
          }
        ]
      }
    ]
  },
  {
    slug: "zdar-manual",
    title: "Manuál pro digitální implementaci města Žďár nad Sázavou",
    orderLabel: "04",
    type: "digitální manuál / veřejná správa",
    role: "UX/UI design, návrh systému, frontend implementace",
    annotation:
      "Digitální manuál, který převádí pravidla městské identity do prakticky použitelných rozhraní.",
    intro:
      "Manuál pro digitální implementaci městské identity. V portfoliu může dobře ukázat schopnost převést pravidla značky do prakticky použitelného digitálního systému.",
    context:
      "U veřejné správy je důležitá srozumitelnost, přístupnost a možnost dlouhodobé správy. Výsledek musí být použitelný i mimo původní autorský dohled.",
    decisions: [
      "Pravidla nejsou jen statický brandbook, ale praktický návod pro digitální prostředí.",
      "Komponenty a příklady mají pomáhat implementaci, ne jen popisovat vizuální styl.",
      "Text, navigace a struktura jsou navržené tak, aby byly použitelné pro různé role."
    ],
    implementation:
      "Projekt je vhodné ukázat přes kombinaci screenshotů a poznámek k tomu, jak se z pravidel stává konkrétní HTML/CSS implementace.",
    status:
      "Pokud se živý projekt později měnil, portfolio může ukazovat stav při předání a jasně ho tak označit.",
    links: [],
    screens: [
      {
        title: "Struktura digitálního manuálu",
        image: "",
        alt: "Screenshot manuálu pro digitální implementaci města Žďár nad Sázavou",
        caption: "Nahraj screenshot do assets/screenshots/zdar-manual/main.jpg a doplň cestu v projects.js.",
        hotspots: [
          {
            x: 24,
            y: 22,
            title: "Navigace manuálu",
            text: "Manuál má být nástroj pro práci, proto musí mít rychlou orientaci v pravidlech i příkladech."
          },
          {
            x: 66,
            y: 46,
            title: "Překlad identity do UI",
            text: "Důležité je ukázat, jak se vizuální identita chová v reálných digitálních komponentech."
          },
          {
            x: 44,
            y: 76,
            title: "Dlouhodobá použitelnost",
            text: "Systém počítá s tím, že ho budou používat další lidé a obsah se může postupně měnit."
          }
        ]
      }
    ]
  },
  {
    slug: "jeleni-v-zeleni",
    title: "Jeleni v zeleni",
    orderLabel: "05",
    type: "webová implementace",
    role: "UX/UI design, vizuální návrh, frontend implementace",
    annotation:
      "Autorsky kontrolovaná webová realizace s důrazem na vizuální charakter a přesnou implementaci.",
    intro:
      "Implementace, které máš nejvíc pod kontrolou. V portfoliu mohou fungovat jako čistá ukázka autorského designu, frontend řemesla a dokončeného vizuálního detailu.",
    context:
      "Projekt je vhodný pro ukázku toho, jak se vizuální záměr drží až do produkčního výsledku bez výrazného rozmělnění uživatelskými zásahy.",
    decisions: [
      "Vizuální styl je vedený konzistentně od návrhu po implementaci.",
      "Obsah, typografie a layout mají držet charakter projektu, ne jen obecnou webovou šablonu.",
      "Dobrá ukázka detailu v HTML/CSS: rytmus, responzivita, mikrointerakce a obrazový materiál."
    ],
    implementation:
      "U tohoto projektu má smysl ukázat více screenshotů: úvodní plochu, detail obsahu, mobilní variantu a případně konkrétní CSS/interaction rozhodnutí.",
    status: "Autorsky nejlépe kontrolovaná realizace.",
    links: [],
    screens: [
      {
        title: "Webová realizace",
        image: "",
        alt: "Screenshot projektu Jeleni v zeleni",
        caption: "Nahraj screenshot do assets/screenshots/jeleni-v-zeleni/main.jpg a doplň cestu v projects.js.",
        hotspots: [
          {
            x: 30,
            y: 28,
            title: "Vizuální charakter",
            text: "Projekt může ukázat práci s atmosférou bez ztráty čistoty a použitelnosti."
          },
          {
            x: 58,
            y: 48,
            title: "Implementační přesnost",
            text: "Tady má smysl ukázat, že výsledný web drží návrh: typografie, spacing, breakpointy, detaily."
          },
          {
            x: 74,
            y: 72,
            title: "Kontrola výsledku",
            text: "Protože je projekt víc pod tvou kontrolou, může sloužit jako silná závěrečná case study."
          }
        ]
      }
    ]
  }
];
