export type Cancion = {
  numero: number;
  titulo: string;
  artista: string;
  youtubeId: string;
  letra: string;
};

export const LISTA_CANCIONES = [
  "Jennifer Lopez - Una Noche MÃ¡s letra lyrics",
  "W Sound BeÃ©le Westcol Ovy On The Drums - La Plena video lyrics letra",
  "Figa Flawas - La Marina Sta Morena letra lyrics",
  "Melody - Esa Diva letra lyrics",
  "HUGEL - Una Noche con Hugel letra lyrics",
  "Vilu Gontero - Capaz vs We Found Love mashup lyrics letra",
  "MarÃ­a Isabel - Antes Muerta Que Sencilla letra lyrics karaoke",
  "Culture Beat - Mr. Vain lyrics letra",
  "Dani FernÃ¡ndez - Me Has Invitado a Bailar letra lyrics",
  "KAROL G - Si Antes Te Hubiera Conocido letra lyrics",
  "Lola Indigo - La Reina letra lyrics",
  "Gusanito - Vive La Vida letra lyrics",
  "Nebulossa - Zorra letra lyrics",
  "El Ãšltimo de la Fila - Cuando el Mar te Tenga letra lyrics",
  "C Tangana - Mala Mujer letra lyrics",
  "Luck Ra BM - La Morocha letra lyrics",
  "Daddy Yankee - Gasolina letra lyrics karaoke",
  "SebastiÃ¡n Yatra Manuel Turizo BeÃ©le - Vagabundo letra lyrics",
  "Marshmello Manuel Turizo - El Merengue letra lyrics",
  "The Tyets - Coti x Coti lletra lyrics karaoke",
  "Vicco - Nochentera letra lyrics",
  "Juan Luis Guerra - La Bilirrubina letra lyrics karaoke",
  "sangiovanni Aitana - Mariposas letra lyrics",
  "Zzoilo Aitana - Mon Amour Remix letra lyrics",
  "Bad Bunny - TitÃ­ Me PreguntÃ³ letra lyrics",
  "El Canto del Loco - Zapatillas letra lyrics karaoke",
  "SebastiÃ¡n Yatra - Tacones Rojos letra lyrics",
  "Starship - Nothing's Gonna Stop Us Now lyrics letra karaoke",
  "Farruko - Pepas letra lyrics",
  "Rauw Alejandro - Todo de Ti letra lyrics",
  "Camela - Cuando Zarpa el Amor letra lyrics karaoke",
  "Merche - Abre Tu Mente letra lyrics",
  "Corona - The Rhythm of the Night lyrics letra",
  "Mecano - Me ColÃ© en una Fiesta letra lyrics karaoke",
  "Daniela Romo - Yo No Te Pido La Luna letra lyrics karaoke",
  "La Guardia - Cuando Brille el Sol letra lyrics",
  "Raffaella CarrÃ  - Hay Que Venir al Sur letra lyrics karaoke",
  "Alaska y Dinarama - A QuiÃ©n Le Importa letra lyrics karaoke",
  "Camilo Sesto - Vivir AsÃ­ es Morir de Amor letra lyrics karaoke",
  "Fred De Palma Ana Mena - Se Iluminaba letra lyrics",
  "David Civera - Que La Detengan letra lyrics karaoke",
  "Ladilla Rusa - KITT y los Coches del Pasado letra lyrics",
  "Nino Bravo - Un Beso y Una Flor letra lyrics karaoke",
  "Antonio Flores - No DudarÃ­a letra lyrics",
  "Marisol - Tengo el CorazÃ³n Contento letra lyrics karaoke",
  "Becky G Bad Bunny - Mayores letra lyrics",
  "Paloma San Basilio - Juntos letra lyrics karaoke",
  "Melendi - Caminando por la Vida letra lyrics",
  "Bonnie Tyler - Holding Out For A Hero lyrics letra karaoke",
  "Sabrina - Boys Summertime Love lyrics letra",
  "Al Bano Romina Power - FelicitÃ  lyrics letra karaoke",
  "J Balvin - Ginza letra lyrics",
  "Hombres G - Venezia letra lyrics karaoke",
  "Duncan Dhu - En AlgÃºn Lugar letra lyrics",
  "Madonna - Into The Groove lyrics letra",
  "El Barrio - Pa Madrid letra lyrics",
  "Michael Sembello - Maniac lyrics letra karaoke",
  "Jarabe de Palo - La Flaca letra lyrics karaoke",
  "Nicki Minaj - Starships lyrics letra",
  "Julio Iglesias - Quijote letra lyrics",
  "Viceversa - Tu Piel Morena letra lyrics",
  "OlÃ© OlÃ© - Voy a Mil letra lyrics",
  "Jose De Rico Henry Mendez - Rayos de Sol letra lyrics",
  "SNAP! - Rhythm Is A Dancer lyrics letra",
  "Whigfield - Saturday Night lyrics letra karaoke",
  "Don Omar Lucenzo - Danza Kuduro letra lyrics karaoke",
  "Ricchi e Poveri - SerÃ¡ Porque Te Amo letra lyrics karaoke",
  "Nena Daconte - TenÃ­a Tanto Que Darte letra lyrics",
  "Justin Bieber - Baby ft Ludacris lyrics letra",
  "Lolita - Sarandonga letra lyrics karaoke",
  "OlÃ© OlÃ© - No Controles letra lyrics",
  "Paulina Rubio - Ni Una Sola Palabra letra lyrics karaoke",
  "Shakira - Loba letra lyrics",
  "Madonna - Hung Up lyrics letra",
  "La Oreja de Van Gogh - Puedes Contar Conmigo letra lyrics",
  "Andy y Lucas - Son de Amores letra lyrics karaoke",
  "Cyndi Lauper - Girls Just Want To Have Fun lyrics letra",
  "Estopa - Cacho a Cacho letra lyrics",
  "ABBA - Dancing Queen lyrics letra karaoke",
  "La Quinta EstaciÃ³n - Me Muero letra lyrics",
  "El Canto del Loco - Besos letra lyrics karaoke",
  "La Bouche - Sweet Dreams lyrics letra",
  "Bon Jovi - It's My Life lyrics letra karaoke",
  "Carlos Baute Marta SÃ¡nchez - Colgando en Tus Manos letra lyrics karaoke",
  "Katy Perry - Hot N Cold lyrics letra",
  "Camela - Cuando Zarpa el Amor letra lyrics karaoke",
  "Queen - I Want To Break Free lyrics letra karaoke",
  "Calle 13 - AtrÃ©vete Te Te letra lyrics karaoke",
  "Sonia y Selena - Yo Quiero Bailar letra lyrics karaoke",
  "Alaska y Dinarama - CÃ³mo Pudiste Hacerme Esto a MÃ­ letra lyrics",
  "Lady Gaga - Born This Way lyrics letra",
  "Technotronic - Pump Up The Jam lyrics letra",
  "Gala - Freed From Desire lyrics letra",
  "Billy Idol - Dancing With Myself lyrics letra",
  "Backstreet Boys - Everybody lyrics letra karaoke",
  "Michael Jackson - Billie Jean letra lyrics karaoke",
  "Miley Cyrus - Heart of Glass lyrics letra",
  "RosalÃ­a - DespechÃ¡ letra lyrics",
  "Mecano - Maquillaje letra lyrics karaoke",
  "Dua Lipa - Physical feat Troye Sivan lyrics letra",
] as const;

export const YOUTUBE_IDS: Partial<Record<number, string>> = {
  0: "D82WTGDPtj8",
  1: "wC_sOpQjvWE",
  2: "hDupK_0xj88",
  3: "zyON1O3mYpA",
  4: "ItvV2HyOePU",
  5: "PeDZO3ubmCI",
  6: "lVdIJkaq4p0",
  7: "F1VOvQj27js",
  8: "-5EwVjQnTBs",
  9: "qz-2YuEtlic",
  10: "6jEtJtjaaN0",
  11: "igiSw9sWYXo",
  12: "36uIku4lueA",
  13: "DiBBMRYQoGI",
  14: "YiWtA73hIrc",
  15: "Lh5xF7rk5PA",
  16: "rs_hGhUPz_0",
  17: "DCB809aSNJs",
  18: "iaUuZEarx2E",
  19: "2wMnaUqdh0k",
  20: "eNIUnslU_Xo",
  21: "P2hDHNP1De0",
  22: "Cxs4OXAt6H8",
  23: "o2tdLOK7-PE",
  24: "qBUKfQRbzuk",
  25: "0xXBwwaTzqc",
  26: "BXd-NIVqfBc",
  27: "ekHoLwskh5w",
  28: "acm6O4WwgBg",
  29: "3-qsyWcpxCI",
  30: "Bx0HTJRycSQ",
  31: "ul1oxkcpMOM",
  32: "SATyGIYqExk",
  33: "wPFrb66hjys",
  34: "qn6S3H62Jh4",
  35: "IN2IcDVPRv8",
  36: "-KAYakBQ10o",
  37: "7xrM9J5wTDE",
  38: "f4KY7gpLc1c",
  39: "dxdsvoGznYY",
  40: "jH_-t8eBMVI",
  41: "HoPYu-RluBE",
  42: "0E3N3s6gZG0",
  43: "iykhVjHHQqA",
  44: "cuRKLR2gmlQ",
  45: "X3KcUZrIomk",
  46: "d9EG3XLvioc",
  47: "kN_Cxar532k",
  48: "GacX7edHD6E",
  49: "UsZuwEFHh_4",
  50: "cgFQ8byPamg",
  51: "JSDB2PBtNvk",
  52: "As4RW0HayHM",
  53: "Q-S7uUjJHQ4",
  54: "NetwnD1Pi_k",
  55: "KELRH3gnFQ0",
  56: "91qYIJBY1js",
  57: "Xkxkm_GV6Cg",
  58: "RrpbTWVrpf8",
  59: "zkuOCtmlQo8",
  60: "ooNCbW_pllw",
  61: "qEzwCh23RKg",
  62: "CiTG-n7SuhU",
  63: "DMiREvBzGY0",
  64: "4czLj14ABsQ",
  65: "ZESyq7kvjeE",
  66: "B0BDv563-DU",
  67: "hHFFD4hMEKo",
  68: "VNrfehBJhps",
  69: "vcSztpzXwSY",
  70: "C0T9aY4QsGs",
  71: "6FmZ9RU2Dsg",
  72: "pSPDBn8adwA",
  73: "VZK_wUGqEfQ",
  74: "BOi5cupTIuw",
  75: "uLLfMJ0Ai58",
  76: "CAQkox_fFsE",
  77: "TJbaGjtvmEI",
  78: "IrMSSbfJpJU",
  79: "La_BXnIixio",
  80: "kcd7wdwn0Mw",
  81: "ZYAFBTKLV4Q",
  82: "on_5rCUHNso",
  83: "u4opl2oVnHM",
  84: "3-ejlwMoI3Q",
  85: "Bx0HTJRycSQ",
  86: "w-m8Oi63cek",
  87: "wfAZ5NYCeZ8",
  88: "pqI6HhgW00I",
  89: "gXxWwP3_TOk",
  90: "4dd0FN0V4-A",
  91: "1OPOaj3_43E",
  92: "0WEA3zHJl28",
  93: "cCCQu5ozxuM",
  94: "Wwz5I3MqKA4",
  95: "igDP_5KqF_o",
  96: "v7ngUPu0Hhk",
  97: "1eSg0FiuxUg",
  98: "lnRoRNi19Jc",
  99: "3etOnE46-J0",
};

function repararMojibake(texto: string) {
  try {
    const bytes = Uint8Array.from(texto, (char) => char.charCodeAt(0) & 0xff);
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return texto;
  }
}

export function limpiarEtiqueta(raw: string) {
  return repararMojibake(raw).replace(/^\d+\.\s*/, "").trim();
}

export function construirCancion(raw: string, numero: number): Cancion {
  const limpia = limpiarEtiqueta(raw);
  const partes = limpia.split(" - ");

  if (partes.length >= 2) {
    const artista = partes[0].trim() || "Artista pendiente";
    const titulo = partes.slice(1).join(" - ").trim() || limpia;

    return {
      numero,
      titulo,
      artista,
      youtubeId: YOUTUBE_IDS[numero] ?? "",
      letra: `Placeholder de letra para ${titulo}. Sustituye este texto por tu letra real cuando la tengas.`,
    };
  }

  return {
    numero,
    titulo: limpia,
    artista: "Artista pendiente",
    youtubeId: YOUTUBE_IDS[numero] ?? "",
    letra: `Placeholder de letra para ${limpia}. Sustituye este texto por tu letra real cuando la tengas.`,
  };
}

export const canciones: Cancion[] = LISTA_CANCIONES.map((raw, numero) =>
  construirCancion(raw, numero),
);

export const LOCAL_VIDEO_FILES: Partial<Record<number, string>> = {
  0:  "unanochemas.mp4",            // Jennifer Lopez - Una Noche Más
  1:  "laplena.mp4",                // W Sound Beéle - La Plena
  2:  "lamarinastamorena.mp4",      // Figa Flawas - La Marina Sta Morena
  3:  "esadiva.mp4",                // Melody - Esa Diva
  4:  "unanocheconhugel.mp4",       // HUGEL - Una Noche con Hugel
  5:  "capazvswefoundlove.mp4",     // Vilu Gontero - Capaz vs We Found Love
  6:  "antesmuertaquesencilla.mp4", // María Isabel - Antes Muerta Que Sencilla
  7:  "mrvain.mp4",                 // Culture Beat - Mr. Vain
  8:  "mehasinvitadoabailar.mp4",   // Dani Fernández - Me Has Invitado a Bailar
  9:  "siantestehubieraconocido.mp4", // KAROL G - Si Antes Te Hubiera Conocido
  10: "lareina.mp4",                // Lola Indigo - La Reina
  11: "vivelavida.mp4",             // Gusanito - Vive La Vida
  12: "zorra.mp4",                  // Nebulossa - Zorra
  13: "cuandoelmartetenga.mp4",     // El Último de la Fila - Cuando el Mar te Tenga
  14: "malamujer.mp4",              // C Tangana - Mala Mujer
  15: "lamorocha.mp4",              // Luck Ra BM - La Morocha
  16: "gasolina.mp4",               // Daddy Yankee - Gasolina
  17: "vagabundo.mp4",              // Sebastián Yatra Manuel Turizo - Vagabundo
  18: "elmerengue.mp4",             // Marshmello Manuel Turizo - El Merengue
  19: "cotixcoti.mp4",              // The Tyets - Coti x Coti
  20: "nocheentera.mp4",            // Vicco - Nochentera
  21: "labilirrubina.mp4",          // Juan Luis Guerra - La Bilirrubina
  22: "mariposas.mp4",              // sangiovanni Aitana - Mariposas
  23: "monamour.mp4",               // Zzoilo Aitana - Mon Amour Remix
  24: "titimepregunto.mp4",         // Bad Bunny - Tití Me Preguntó
  25: "zapatillas.mp4",             // El Canto del Loco - Zapatillas
  26: "taconesrojos.mp4",           // Sebastián Yatra - Tacones Rojos
  27: "nothinggonastopnow.mp4",     // Starship - Nothing's Gonna Stop Us Now
  28: "pepas.mp4",                  // Farruko - Pepas
  29: "tododeti.mp4",               // Rauw Alejandro - Todo de Ti
  30: "cuandozarpaelamor.mp4",      // Camela - Cuando Zarpa el Amor
  31: "abretumente.mp4",            // Merche - Abre Tu Mente
  32: "therythimontenight.mp4",     // Corona - The Rhythm of the Night
  33: "mecoleenunafiesta.mp4",      // Mecano - Me Colé en una Fiesta
  34: "yonotepidolaluna.mp4",       // Daniela Romo - Yo No Te Pido La Luna
  35: "cuandobrilleelesol.mp4",     // La Guardia - Cuando Brille el Sol
  36: "hayqueveniralsur.mp4",       // Raffaella Carrá - Hay Que Venir al Sur
  37: "aquienleimporta.mp4",        // Alaska y Dinarama - A Quién Le Importa
  38: "vivirasiesmorirdeamor.mp4",  // Camilo Sesto - Vivir Así es Morir de Amor
  39: "seiluminaba.mp4",            // Fred De Palma Ana Mena - Se Iluminaba
  40: "queladetengan.mp4",          // David Civera - Que La Detengan
  41: "littyloscochesdelpasado.mp4", // Ladilla Rusa - KITT y los Coches del Pasado
  42: "unbesoyunaflor.mp4",         // Nino Bravo - Un Beso y Una Flor
  43: "nodudaria.mp4",              // Antonio Flores - No Dudaría
  44: "corazoncontento.mp4",        // Marisol - Tengo el Corazón Contento
  45: "mayores.mp4",                // Becky G Bad Bunny - Mayores
  46: "juntos.mp4",                 // Paloma San Basilio - Juntos
  47: "caminandoporlavida.mp4",     // Melendi - Caminando por la Vida
  48: "holdingoutforahero.mp4",     // Bonnie Tyler - Holding Out For A Hero
  49: "boys.mp4",                   // Sabrina - Boys Summertime Love
  50: "felicita.mp4",               // Al Bano Romina Power - Felicitá
  51: "ginza.mp4",                  // J Balvin - Ginza
  52: "venezia.mp4",                // Hombres G - Venezia
  53: "Duncan Dhu - En Algún Lugar.mp4", // Duncan Dhu - En Algún Lugar
  54: "intothegrove.mp4",           // Madonna - Into The Groove
  55: "pamadrid.mp4",               // El Barrio - Pa Madrid
  56: "maniac.mp4",                 // Michael Sembello - Maniac
  57: "laflaca.mp4",                // Jarabe de Palo - La Flaca
  58: "starship.mp4",               // Nicki Minaj - Starships
  59: "quijote.mp4",                // Julio Iglesias - Quijote
  60: "ella.mp4",                   // Viceversa - Tu Piel Morena
  61: "voyamil.mp4",                // Olé Olé - Voy a Mil
  62: "rayosdesol.mp4",             // Jose De Rico Henry Mendez - Rayos de Sol
  63: "rythmisadancer.mp4",         // SNAP! - Rhythm Is A Dancer
  64: "saturdaynight.mp4",          // Whigfield - Saturday Night
  65: "danzakuduro.mp4",            // Don Omar Lucenzo - Danza Kuduro
  66: "seraporqueteamo.mp4",        // Ricchi e Poveri - Será Porque Te Amo
  67: "teniatantoquedarte.mp4",     // Nena Daconte - Tenía Tanto Que Darte
  68: "baby.mp4",                   // Justin Bieber - Baby
  69: "sarandonga.mp4",             // Lolita - Sarandonga
  70: "nocontroles.mp4",            // Olé Olé - No Controles
  71: "niunasolapalabra.mp4",       // Paulina Rubio - Ni Una Sola Palabra
  72: "loba.mp4",                   // Shakira - Loba
  73: "hungup.mp4",                 // Madonna - Hung Up
  74: "puedescontarconmigo.mp4",    // La Oreja de Van Gogh - Puedes Contar Conmigo
  75: "sondeamores.mp4",            // Andy y Lucas - Son de Amores
  76: "girlsjustwanttohavefun.mp4", // Cyndi Lauper - Girls Just Want To Have Fun
  77: "cachoacacho.mp4",            // Estopa - Cacho a Cacho
  78: "dancingqueen.mp4",           // ABBA - Dancing Queen
  79: "memuero.mp4",                // La Quinta Estación - Me Muero
  80: "besos.mp4",                  // El Canto del Loco - Besos
  81: "sweetdreams.mp4",            // La Bouche - Sweet Dreams
  82: "itsmylife.mp4",              // Bon Jovi - It's My Life
  83: "colgandoentusmanos.mp4",     // Carlos Baute Marta Sánchez - Colgando en Tus Manos
  84: "hotancold.mp4",              // Katy Perry - Hot N Cold
  85: "cuandozarpaelamor.mp4",      // Camela - Cuando Zarpa el Amor (segunda entrada)
  86: "iwanttobrakefree.mp4",       // Queen - I Want To Break Free
  87: "atrevete-te.mp4",            // Calle 13 - Atrévete Te Te
  88: "yoquierobailar.mp4",         // Sonia y Selena - Yo Quiero Bailar
  89: "comopueddistehacermeestoami.mp4", // Alaska y Dinarama - Cómo Pudiste Hacerme Esto a Mí
  90: "bornthisway.mp4",            // Lady Gaga - Born This Way
  91: "pumpupthejam.mp4",           // Technotronic - Pump Up The Jam
  92: "freedfromdesire.mp4",        // Gala - Freed From Desire
  93: "dancingwithmyself.mp4",      // Billy Idol - Dancing With Myself
  94: "everybody.mp4",              // Backstreet Boys - Everybody
  95: "billiejean.mp4",             // Michael Jackson - Billie Jean
  96: "heartofglass.mp4",           // Miley Cyrus - Heart of Glass
  97: "despecha.mp4",               // Rosalía - Despechá
  98: "maquillaje.mp4",             // Mecano - Maquillaje
  99: "physical.mp4",               // Dua Lipa - Physical
};
