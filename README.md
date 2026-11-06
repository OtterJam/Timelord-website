# Site vitrine de TimeLord

Une page, un écran, pas de défilement sur grand écran. Statique : pas de build,
pas de dépendance. On ouvre `index.html` et c'est tout.

## Le décor

Le sommet de la tour du temps est **monté en couches** (`assets/img/scene/`),
pas posé comme une seule capture :

| Couche | Origine | Ce qu'elle fait |
|---|---|---|
| Le halo | CSS | la lumière du sort qui monte de la plate-forme |
| Le monde lointain | `fx/far_world.png` | défile très lentement, tout au fond |
| Les nuages d'orage | `fx/storm_clouds.png` | deux bancs, l'un lent et loin, l'autre rapide et près |
| La tour | plan rendu par le moteur | la plate-forme, le cadran du sort, le parapet |
| Le Maître du Temps | `character/time_master.png` | flotte au-dessus de la plate-forme ; ses iris suivent le curseur |

La couche `tour` est le seul plan rendu : il est **coupé juste au-dessus du
Maître** (y = 380 dans le plan d'origine) pour que celui-ci soit un sprite à
part, animé et décalé indépendamment. Son bord haut est fondu dans le ciel par
un `mask-image`.

Chaque couche porte sa profondeur dans `--d` (dans le HTML) ; `main.js` ne pose
que la position du curseur (`--px`, `--py`) et le CSS fait le décalage. La
parallaxe et la lumière ne s'activent qu'à la souris, et jamais si le visiteur
a demandé moins d'animations.

Les calques de nuages et le monde lointain sont des rectangles : leurs bords
sont fondus par un `mask-image`, sinon ils tracent des barres horizontales
nettes en travers de l'écran.

### La lumière

`main.js` clone tout le décor en une copie éclaircie (`.scene--lit`), posée
pile sur l'originale et masquée par un disque qui suit le curseur. Comme le
masque laisse passer la copie *et* que les calques gardent leur propre
transparence, la lumière ne révèle que les pixels des sprites, jamais le ciel
vide derrière eux — **il n'y a donc aucun halo visible autour du curseur**, la
pierre et les nuages s'éclairent, c'est tout. Le clone est fait en JavaScript
plutôt qu'écrit deux fois dans le HTML, pour que les deux décors ne puissent
pas diverger.

### Le regard

`tools/extract-assets.sh` sépare les **iris** du **corps** du Maître : 16
pixels roses partent sur leur propre couche, et leur orbite sombre reste sur
le corps pour ne pas laisser de trou. L'iris glisse alors d'un pixel du sprite
(1/144 et 1/216 du calque, soit 0,69 % et 0,46 %) vers le curseur. Il ne lève
jamais les yeux : si le curseur passe au-dessus de sa tête, le regard revient
au neutre.

Les nuages et le monde lointain sont **doublés en miroir** à l'export, pour que
leur répétition horizontale ne laisse pas de couture.

## À remplir

Tout se règle dans [`assets/js/config.js`](assets/js/config.js) :

- `links.tiktok` et `links.instagram` — dès qu'une des deux est remplie, la
  rangée « Suivre le développement » apparaît en bas de l'écran ;
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
    match /signups/{doc} {
      // Le site ne fait qu'écrire. Personne ne peut relire la liste
      // depuis le navigateur : elle se consulte dans la console.
      allow create: if request.resource.data.keys().hasOnly(['email', 'lang', 'source', 'createdAt'])
                    && request.resource.data.email is string
                    && request.resource.data.email.size() > 5
                    && request.resource.data.email.size() < 200
                    && request.resource.data.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      allow read, update, delete: if false;
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
- Comme l'écriture vient du navigateur, **rien n'empêche quelqu'un de poster
  de fausses adresses**. Si ça arrive, deux parades : activer
  [App Check](https://firebase.google.com/docs/app-check) (reCAPTCHA v3), ou
  passer par une Cloud Function qui valide avant d'écrire.
- Les doublons ne sont pas filtrés (chaque envoi crée un document). À
  dédupliquer sur `email` au moment de l'export.

## Réexporter les visuels

```sh
./tools/extract-assets.sh [chemin/vers/A-Single-Piece]
```

Relit les sprites du dépôt du jeu et refabrique `assets/img/`. Demande
`ffmpeg`.

## Mettre en ligne

N'importe quel hébergement de fichiers statiques : GitHub Pages, Netlify,
Cloudflare Pages, un simple dossier derrière nginx. Rien à compiler.

Pour regarder en local :

```sh
python3 -m http.server 8000
```
