# Site vitrine de TimeLord

Une page, un écran, pas de défilement sur grand écran. Statique : pas de build,
pas de dépendance. On ouvre `index.html` et c'est tout.

## Le décor

Le fond est l'**illustration de la Faucheuse**, reprise telle que l'autrice
l'a peinte : ses huit calques d'origine (`assets/img/parallax_faucheuse/`),
remontés dans la page dans leur ordre de peinture :

| Plan | Fichier | `--d` |
|---|---|---|
| Le ciel et le soleil | `1_ciel` | 3 |
| Les nuages d'orage | `2_nuages` | 7 |
| Les montagnes | `3_montagnes` | 12 |
| Les collines et les arbres | `4_collines` | 18 |
| La Faucheuse | `5_faucheuse` | 23 |
| Le héros | `6_heros` | 30 |
| La colline, au premier plan | `7_colline` | 30 |
| La lumière : halo d'horizon et éclairs | `8_lumiere` | 9 |

Une seule inversion par rapport au fichier d'origine : **le héros passe
derrière la colline**, là où l'autrice l'avait peint dessus. La crête lui
mange les pieds et le bas de l'épée — il y est planté plutôt que posé. Il
garde la **même profondeur que la colline** (`30`) : à la moindre différence
il glisserait hors de la crête dès que la souris bouge.

La **lumière est un calque à part**, le dernier du fichier d'origine : elle se
pose par-dessus tout le décor, et c'est elle qui donne au paysage son contre-
jour chaud et ses éclairs. Sa profondeur est courte (`9`) — c'est une brume,
elle ne doit pas glisser comme un relief.

La pile va, du fond vers l'avant : décor (`-5`), voile (`-4`), logo (`-3`),
puis le reste de la page. Sur téléphone, les huit plans sont donc sous le même
voile et s'éteignent ensemble.

Sur un **écran d'ordinateur**, le lettrage vient se poser en plein sur le
héros : les trois derniers plans (héros, colline, lumière) remontent alors à
`-2`, devant le logo. Le décor renonce à sa couche (`z-index: auto`) et chaque
plan prend son rang parmi ceux de la page — plutôt que de couper le HTML en
deux boîtes, ce qui marcherait ici mais ferait prendre deux fois à chacune le
masque du bandeau portrait : le héros, à demi effacé, laisserait voir le ciel
au travers.

Comme le voile doit rester derrière le logo — sinon il l'éteint —, ces trois
plans-là portent leur propre part d'ombre, le même dégradé découpé dans leur
silhouette par un masque (`mask-image`, la même image que le calque, posée de
la même façon). Étaler une ombre sur une pile ou sur chacun de ses plans
revient au même partout où le plan est opaque ; seule la lumière, translucide,
ressort d'un cheveu plus claire. Le cadrage (`--op`) et le dégradé (`--veil`)
sont des variables : l'image et son ombre ne peuvent pas se désaccorder.

Chaque plan porte sa profondeur dans `--d` (dans le HTML) ; `main.js` ne pose
que la position du curseur (`--px`, `--py`) et le CSS fait le décalage. La
parallaxe ne s'active qu'à la souris, et jamais si le visiteur a demandé moins
d'animations.

Les huit plans sont des images de même taille (2000 × 1397), posées dans la même
boîte avec `object-fit: cover` : même cadrage pour tous, donc alignement
garanti quelle que soit la fenêtre. Cette boîte **déborde de l'écran** (`inset:
-2.5% -4%`), de quoi absorber le décalage de la parallaxe sans jamais laisser
entrer un bord nu. Le débord est plus mince en haut et en bas, où la course est
deux fois plus courte et où chaque pixel gagné est un bout de capuche.

L'écran est plus large que l'illustration : il faut choisir ce qui part. On
descend le cadrage (`object-position`) autant que la capuche le permet —
c'est ce qui garde le plus de héros et de colline dans l'écran. La capuche
commence à 12,3 % de la hauteur de l'illustration, et on lui laisse toujours
un peu de ciel au-dessus ; plus le format s'allonge, plus `cover` taille dans
la hauteur, et moins on peut prendre par le haut. D'où une échelle, où chaque
palier est le plus bas que son format autorise :

| Format de l'écran | `object-position` |
|---|---|
| jusqu'à 9:5 (1,80) | 37 % |
| 9:5 → 2:1 | 28 % |
| 2:1 → 9:4 (2,25) | 23 % |
| 9:4 → 13:5 (2,60) | 19 % |
| au-delà de 13:5 | 15 % |

Les paliers sont resserrés exprès : un saut de cadrage d'un format à l'autre
se voit tout de suite (la colline qui disparaît, le héros qui plonge derrière
le formulaire).

### En portrait, un bandeau plutôt qu'un fond

Sur un écran plus haut que large, `cover` rogne sur les côtés : à 390 × 844 il
ne reste qu'un tiers de la largeur de l'illustration — la capuche remplit tout,
et le héros, la colline et les montagnes sortent du cadre. Le décor est donc
posé en **bandeau haut** (`@media (max-aspect-ratio: 9/10)`), et c'est sa
hauteur qui règle le zoom : la part de largeur visible vaut
`largeur / (hauteur_du_bandeau × 1,432)`, donc **plus le bandeau est court,
plus on voit large**. À 64 svh on retrouve la moitié de l'illustration, ce
qu'il faut pour la capuche, le cadran, le héros et le haut de la colline.

Le bas du bandeau est fondu au `mask-image`, et le fond de page prend le
relais : en portrait, il s'éteint dans le vert sombre de la colline
(`#182512`) plutôt que dans le violet du ciel, pour que la coupure ne se voie
pas. Le fondu **ne part que du pied du héros** (78 %) : l'illustration tient
en entier dans la hauteur du bandeau — c'est la largeur qui est rognée —, donc
le héros y occupe toujours la même tranche, 48 % à 76 %. Partir de 58 % le
prenait à mi-corps : 65 % d'opacité aux pieds, l'épée mangée par le décor. Le voile, lui, ne sert plus que sur l'illustration : en dessous, le texte
est déjà sur le fond de page.

Sur un téléphone **court** (≤ 720 px de haut), le bloc central mange l'écran
et le bandeau n'a plus la place de respirer : il y descend à 46 svh.
L'illustration s'y voit presque entière, et le texte garde son tiers bas. Pour la même
raison, le bloc central (logo, inscription, Steam) se range **en bas de sa
rangée** plutôt qu'au milieu : la capuche garde le haut de l'écran. Le logo,
lui, remonte par sa seule marge basse (`margin-bottom: clamp(1.5rem, 11vh,
6.5rem)`) — le bloc étant calé en bas, cette marge ne déplace que lui, et
dégage le cadran entre le lettrage et le reste de la page. C'est le réglage à
toucher pour le monter ou le descendre.

Deux animations discrètes par-dessus : le ciel blanchit deux fois toutes les
treize secondes (l'orage — le flash porte sur le ciel *et* sur la lumière, qui
tient les éclairs), et la Faucheuse respire. Elles sont posées sur les
`<img>`, jamais sur les calques, qui gardent leur décalage de parallaxe pour
eux seuls.

### Les images

Les PNG d'origine (2388 × 1668) pèsent 8,7 Mo à eux huit ; convertis en WebP
à la taille de la page (`cwebp -q 82 -alpha_q 90 -m 6 -resize 2000 1397`), ils
tombent à **640 Ko**, sans différence visible. La lumière fait exception : un
dégradé plein cadre, donc le plus lourd des huit, et le plus flou — on le
descend à 1400 px et à `-q 76 -alpha_q 75`, ce qui le ramène de 478 à 122 Ko
sans qu'on voie la différence une fois étalé sur l'écran. Seuls les `.webp`
sont publiés : `.assetsignore` écarte les PNG et la vidéo d'aperçu, qui
restent dans le dépôt comme sources.

## À remplir

Tout se règle dans [`assets/js/config.js`](assets/js/config.js) :

- `links.tiktok`, `links.instagram` et `links.patreon` — dès qu'une seule est
  remplie, la rangée « Suivre le développement » apparaît en bas de l'écran ;
- `links.steam` — vide, le bouton reste en « Page à venir » ; rempli, il
  devient un vrai lien ;
- `firebase.projectId` et `firebase.apiKey` — voir ci-dessous.

Les textes des deux langues sont dans
[`assets/js/i18n.js`](assets/js/i18n.js), une clé par `data-i18n` du HTML. La
langue suit `?lang=fr|en`, puis le choix mémorisé, puis celle du navigateur.

## Tenir dans un écran

Rien ne défile, ni sur ordinateur ni sur téléphone : `body` est en
`overflow: hidden` et `.screen` fait `100svh` — la hauteur *barres d'outils
affichées*, pour que l'apparition de la barre d'URL ne fasse rien déborder.

Les tailles se resserrent par paliers (`@media`) plutôt que par une mise à
l'échelle globale, pour que le champ e-mail reste à 16 px : en dessous, iOS
zoome tout seul quand on le touche. Deux détails qui ont coûté cher :

- les grilles ont une colonne `minmax(0, 1fr)` explicite. Avec une colonne
  `auto`, le `width: 100%` du formulaire n'est pas résoluble, et Firefox lui
  donne la largeur par défaut d'un `<input>` (20 caractères) : la page
  débordait de 42 px à l'horizontale sur un écran de 320 px ;
- le logo est en `min(…, 100%)`, pas en `vw` : `vw` ignore les marges de
  `.screen` et le fait dépasser.

Vérifié de 320 × 568 à 1920 × 1080 : `scrollWidth` et `scrollHeight` restent
égaux au cadre visible. Seule exception assumée, en dessous de 440 px de haut
(téléphone couché), le défilement revient : mieux vaut ça que de rogner le
formulaire.

## Les adresses e-mail

Le formulaire écrit directement dans une collection **Firestore**, par son API
REST : une seule requête, aucun SDK à charger. Tant que `projectId` ou
`apiKey` est vide, le formulaire s'affiche en « Bientôt » (désactivé) plutôt
que d'avaler l'adresse dans le vide.

### Mise en place

1. Console Firebase → nouveau projet → **Firestore Database** → créer la base.
2. Paramètres du projet → *Vos applications* → **Application Web** : recopier
   `projectId` et `apiKey` dans `config.js`.
3. Onglet **Règles** de Firestore, coller ceci :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Les inscriptions : on peut y AJOUTER une adresse, rien d'autre.
    match /signups/{doc} {

      // LECTURE, MODIFICATION, SUPPRESSION : interdites à tout le monde.
      // Ni le site, ni un visiteur, ni un script ne peut récupérer la
      // liste par l'API. Elle ne se consulte que depuis la console
      // Firebase ou `gcloud`, avec ton compte Google (ces accès
      // d'administration ne passent pas par ces règles).
      allow read, update, delete: if false;

      // ÉCRITURE : seulement un document exactement au format que le
      // site envoie. Tout autre champ, type ou valeur est refusé.
      allow create: if request.resource.data.keys().hasOnly(['email', 'lang', 'source', 'createdAt'])
                    && request.resource.data.keys().hasAll(['email', 'lang', 'source', 'createdAt'])
                    && request.resource.data.email is string
                    && request.resource.data.email.size() > 5
                    && request.resource.data.email.size() < 200
                    && request.resource.data.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
                    && request.resource.data.lang in ['fr', 'en']
                    && request.resource.data.source is string
                    && request.resource.data.source.size() < 100
                    && request.resource.data.createdAt is timestamp;
    }

    // Tout le reste de la base : fermé, en lecture comme en écriture.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Chaque document contient `email`, `lang` (fr ou en), `source` (le domaine) et
`createdAt`. Le jour de l'ouverture de la page Steam, la liste s'exporte depuis
la console Firebase ou avec `gcloud firestore export`.

### Ce qu'il faut savoir

- **La clé d'API web est publique**, c'est normal chez Firebase : elle
  identifie le projet, elle ne l'autorise pas. Ce sont les règles ci-dessus
  qui protègent la base.
- **Les règles ne savent pas d'où vient une requête.** Elles imposent le
  *format* de ce qui est écrit, pas le fait que ça vienne du site : la clé
  étant publique, n'importe qui peut envoyer un document bien formé avec
  `curl`. Au pire, ça ajoute de fausses adresses ; ça ne permet jamais de lire
  la liste. Pour réserver vraiment l'écriture au site, il faut activer
  [App Check](https://firebase.google.com/docs/app-check) (reCAPTCHA v3) et
  l'imposer sur Firestore, ou passer par une Cloud Function qui valide avant
  d'écrire. Le champ `source` est déclaratif : il ne prouve rien.
- Les doublons ne sont pas filtrés (chaque envoi crée un document). À
  dédupliquer sur `email` au moment de l'export.

## Réexporter les visuels

L'illustration de la Faucheuse se reconvertit en une ligne, après un nouvel
export des plans :

```sh
cd assets/img/parallax_faucheuse
for f in [1-7]_*.png; do
  cwebp -q 82 -alpha_q 90 -m 6 -resize 2000 1397 "$f" -o "${f%.png}.webp"
done
cwebp -q 76 -alpha_q 75 -m 6 -resize 1400 978 8_lumiere.png -o 8_lumiere.webp
```

Le logo et les icônes, eux, viennent des sprites du jeu :

```sh
./tools/extract-assets.sh [chemin/vers/A-Single-Piece]
```

Relit les sprites du dépôt du jeu et refabrique `assets/img/`. Demande
`ffmpeg`. Il refabrique aussi `assets/img/scene/` — l'ancien décor, le sommet
de la tour monté sprite par sprite, que l'illustration a remplacé. Ces fichiers
ne sont plus utilisés par la page.

Le lettrage vient du dossier profil du jeu (`devlog/divers/profil/logo-hd.png`,
1683 × 416, haute définition, bords lissés). Il est copié tel quel et **réduit**
par le navigateur : la case la plus large fait 820 px, soit deux fois moins que
l'original, donc le lettrage reste net jusque sur un retina. C'est la version
pixel art de l'écran-titre (`Game/assets/img/menu/logo_title.png`, 632 × 156,
onze couleurs) qui était affichée avant, agrandie en marches via `.pixel` ;
elle reste dans le dépôt du jeu si on veut y revenir.

## Mettre en ligne

Le site est servi par **Cloudflare Workers** (assets statiques, sans code
serveur), relié au dépôt GitHub : chaque push sur `main` le remet en ligne.

- [`wrangler.jsonc`](wrangler.jsonc) nomme le projet (`playtimelord`) et
  publie la racine du dépôt ;
- [`.assetsignore`](.assetsignore) écarte ce qui n'a rien à faire en ligne
  (`.git`, ce README, `tools/`, la config elle-même).

Dans le dashboard Cloudflare, le projet garde les commandes par défaut :
pas de commande de build, `npx wrangler deploy` pour déployer. Pour vérifier
ce qui partirait, sans rien envoyer :

```sh
npx wrangler deploy --dry-run
```

Pour regarder en local :

```sh
python3 -m http.server 8000
```
