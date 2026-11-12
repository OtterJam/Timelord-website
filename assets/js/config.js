/* ------------------------------------------------------------------
   TimeLord — configuration du site
   Tout ce qui change (liens, inscription) se règle ici, sans toucher
   au HTML. Une clé vide = le bouton ne s'affiche pas.
   ------------------------------------------------------------------ */

window.TL_CONFIG = {
  links: {
    // Dès qu'une de ces deux lignes est remplie, la rangée
    // « Suivre le développement » apparaît en bas de l'écran.
    tiktok: 'https://www.tiktok.com/@timelord_dev',
    instagram: 'https://www.instagram.com/timelord_dev/',

    // Les autres, si un jour tu les ouvres.
    youtube: '',
    x: '',
    bluesky: '',
    discord: '',

    // Vide : le bouton reste en « Page à venir ». Rempli : il devient
    // un vrai lien vers la fiche Steam.
    steam: '',
  },

  // Les adresses collectées partent dans une collection Firestore.
  // Tant que `projectId` ou `apiKey` est vide, le formulaire s'affiche
  // en « Bientôt » (désactivé) plutôt que d'avaler l'adresse dans le vide.
  //
  // Les deux valeurs se lisent dans la console Firebase, Paramètres du
  // projet → Vos applications → Application Web. La clé d'API d'une appli
  // web est publique par nature : ce qui protège la base, ce sont les
  // règles de sécurité (voir le README).
  firebase: {
    projectId: 'timelord-ec8cd',
    apiKey: 'AIzaSyA1veCfqD8YRtSkN7PxrZNVsFrK1sZcrbg',
    collection: 'signups',
  },
};
