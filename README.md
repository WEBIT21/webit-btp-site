# Site vitrine WEBIT BTP

Site statique (aucun serveur) : `index.html` (site), `terrain.js` (chantier 3D), `app-dash.webp` et `app-devis.webp` (captures du logiciel), `mentions-legales.html`, `confidentialite.html`, `favicon.svg`, `CNAME`.

## Mise en ligne avec GitHub Pages
1. Créez un dépôt GitHub `webit-btp-site` et poussez ces fichiers sur la branche `main`.
2. Dépôt > Settings > Pages : Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Le fichier `CNAME` déclare l'adresse `btp.webit-ai.com` (modifiez-le si vous choisissez un autre sous-domaine).
4. Chez OVH, zone DNS de `webit-ai.com` : ajoutez un enregistrement **CNAME** `btp` → `VOTRE-COMPTE-GITHUB.github.io.` (avec le point final).
5. Attendez la propagation DNS (quelques minutes à quelques heures), puis cochez « Enforce HTTPS » dans Settings > Pages.

## Compter les visiteurs (GoatCounter, gratuit, sans cookie)
1. Créez un compte sur goatcounter.com et choisissez un code (ex. `webit-btp`).
2. Dans `index.html` et `demo.html`, remplacez `VOTRE-CODE` par ce code.
3. Les visites, pages vues, provenances, pays et appareils s'affichent sur `https://VOTRE-CODE.goatcounter.com`.
Pas de cookie déposé, donc pas de bandeau de consentement à afficher en règle générale (à confirmer avec votre conseil RGPD).

## Formulaire de démo
Le formulaire prépare un message à copier vers contact@webit-ai.com ; il n'envoie rien tout seul. Pour un envoi direct, brancher un service de formulaire (Formspree, ou votre API plus tard).

## Mises à jour
Modifiez les fichiers, `git commit`, `git push` : le site se met à jour en une à deux minutes.
