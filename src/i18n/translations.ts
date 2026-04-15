export type Language = "en" | "fr";

export const translations = {
  // Navbar
  "nav.chatbot": { en: "Chatbot", fr: "Chatbot" },
  "nav.database": { en: "Database", fr: "Base de données" },
  "nav.submit": { en: "Submit", fr: "Soumettre" },
  "nav.collections": { en: "Collections", fr: "Collections" },
  "nav.profile": { en: "Profile", fr: "Profil" },
  "nav.signIn": { en: "Sign In", fr: "Connexion" },

  // Auth
  "auth.createAccount": { en: "Create Account", fr: "Créer un compte" },
  "auth.welcomeBack": { en: "Welcome Back", fr: "Bon retour" },
  "auth.joinCommunity": { en: "Join the thesis research community", fr: "Rejoignez la communauté de recherche" },
  "auth.signInToAccount": { en: "Sign in to your account", fr: "Connectez-vous à votre compte" },
  "auth.username": { en: "Username", fr: "Nom d'utilisateur" },
  "auth.yourUsername": { en: "Your username", fr: "Votre nom d'utilisateur" },
  "auth.email": { en: "Email", fr: "E-mail" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.loading": { en: "Loading...", fr: "Chargement..." },
  "auth.signUp": { en: "Sign Up", fr: "S'inscrire" },
  "auth.signInBtn": { en: "Sign In", fr: "Se connecter" },
  "auth.alreadyHaveAccount": { en: "Already have an account?", fr: "Vous avez déjà un compte ?" },
  "auth.dontHaveAccount": { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?" },
  "auth.accountCreated": { en: "Account created!", fr: "Compte créé !" },
  "auth.checkEmail": { en: "Check your email to confirm your account.", fr: "Vérifiez votre e-mail pour confirmer votre compte." },

  // Index / Landing
  "landing.title": { en: "HexBiblio", fr: "HexBiblio" },
  "landing.subtitle": {
    en: "Submit your research question and our AI instantly recognizes your discipline, extracts key themes, and guides you through every stage of your thesis — from refining the question to choosing methodology.",
    fr: "Soumettez votre question de recherche et notre IA identifie instantanément votre discipline, extrait les thèmes clés et vous guide à chaque étape de votre mémoire — du raffinement de la question au choix de la méthodologie.",
  },
  "landing.getStarted": { en: "Get Started", fr: "Commencer" },
  "landing.disciplineTitle": { en: "Discipline Recognition", fr: "Reconnaissance de discipline" },
  "landing.disciplineDesc": { en: "AI identifies your academic field and interdisciplinary connections from your research question.", fr: "L'IA identifie votre domaine académique et les connexions interdisciplinaires à partir de votre question de recherche." },
  "landing.themeTitle": { en: "Theme Extraction", fr: "Extraction de thèmes" },
  "landing.themeDesc": { en: "Key themes, concepts, and keywords are automatically identified to sharpen your research focus.", fr: "Les thèmes clés, concepts et mots-clés sont automatiquement identifiés pour affiner votre recherche." },
  "landing.repoTitle": { en: "Thesis Repository", fr: "Dépôt de mémoires" },
  "landing.repoDesc": { en: "Deposit your thesis and make it accessible to the academic community for feedback.", fr: "Déposez votre mémoire et rendez-le accessible à la communauté académique pour des retours." },
  "landing.feedbackTitle": { en: "Community Feedback", fr: "Retours communautaires" },
  "landing.feedbackDesc": { en: "Rate theses, leave comments, and engage with fellow researchers across disciplines.", fr: "Notez les mémoires, laissez des commentaires et échangez avec des chercheurs de toutes disciplines." },

  // Chat
  "chat.title": { en: "Research Question Analyzer", fr: "Analyseur de question de recherche" },
  "chat.subtitle": {
    en: "Submit your research question and I'll identify the discipline, key themes, and guide you through developing your thesis.",
    fr: "Soumettez votre question de recherche et j'identifierai la discipline, les thèmes clés, et vous guiderai dans le développement de votre mémoire.",
  },
  "chat.placeholder": { en: "Enter your research question...", fr: "Entrez votre question de recherche..." },
  "chat.poweredBy": { en: "Powered by AI · Identifies disciplines, themes & guides your research", fr: "Propulsé par l'IA · Identifie les disciplines, thèmes et guide votre recherche" },

  // Database
  "db.title": { en: "Thesis Database", fr: "Base de données des mémoires" },
  "db.subtitle": { en: "Browse and discover research from the community", fr: "Parcourez et découvrez les recherches de la communauté" },
  "db.searchPlaceholder": { en: "Search by title, author, or keyword...", fr: "Rechercher par titre, auteur ou mot-clé..." },
  "db.allFields": { en: "All Fields", fr: "Tous les domaines" },
  "db.allDegrees": { en: "All Degrees", fr: "Tous les diplômes" },
  "db.noTheses": { en: "No theses found", fr: "Aucun mémoire trouvé" },
  "db.tryAdjusting": { en: "Try adjusting your search or be the first to submit!", fr: "Essayez d'ajuster votre recherche ou soyez le premier à soumettre !" },

  // Submit
  "submit.title": { en: "Submit Your Thesis", fr: "Soumettre votre mémoire" },
  "submit.subtitle": { en: "Share your research with the community", fr: "Partagez votre recherche avec la communauté" },
  "submit.titleLabel": { en: "Title", fr: "Titre" },
  "submit.titlePlaceholder": { en: "Your thesis title", fr: "Le titre de votre mémoire" },
  "submit.authorLabel": { en: "Author Name", fr: "Nom de l'auteur" },
  "submit.authorPlaceholder": { en: "Full name", fr: "Nom complet" },
  "submit.fieldLabel": { en: "Field / Discipline", fr: "Domaine / Discipline" },
  "submit.selectField": { en: "Select a field", fr: "Choisir un domaine" },
  "submit.degreeLabel": { en: "Degree Type", fr: "Type de diplôme" },
  "submit.selectDegree": { en: "Select degree", fr: "Choisir le diplôme" },
  "submit.yearLabel": { en: "Graduation Year", fr: "Année de diplomation" },
  "submit.selectYear": { en: "Select year", fr: "Choisir l'année" },
  "submit.keywordsLabel": { en: "Keywords / Tags", fr: "Mots-clés / Tags" },
  "submit.addKeyword": { en: "Add a keyword...", fr: "Ajouter un mot-clé..." },
  "submit.add": { en: "Add", fr: "Ajouter" },
  "submit.keywordsHint": { en: "Up to 10 keywords for better discoverability", fr: "Jusqu'à 10 mots-clés pour une meilleure visibilité" },
  "submit.abstractLabel": { en: "Abstract", fr: "Résumé" },
  "submit.abstractPlaceholder": { en: "Summarize your research...", fr: "Résumez votre recherche..." },
  "submit.pdfLabel": { en: "PDF File (optional)", fr: "Fichier PDF (optionnel)" },
  "submit.maxSize": { en: "Max 20MB", fr: "Max 20 Mo" },
  "submit.submitting": { en: "Submitting...", fr: "Envoi en cours..." },
  "submit.submitBtn": { en: "Submit Thesis", fr: "Soumettre le mémoire" },
  "submit.success": { en: "Thesis submitted!", fr: "Mémoire soumis !" },
  "submit.successDesc": { en: "Your thesis has been added to the database.", fr: "Votre mémoire a été ajouté à la base de données." },

  // Thesis detail
  "detail.backToDb": { en: "Back to Database", fr: "Retour à la base de données" },
  "detail.abstract": { en: "Abstract", fr: "Résumé" },
  "detail.downloadPdf": { en: "Download PDF", fr: "Télécharger le PDF" },
  "detail.notFound": { en: "Thesis not found", fr: "Mémoire introuvable" },

  // Collections
  "collections.title": { en: "My Collections", fr: "Mes collections" },
  "collections.subtitle": { en: "Your saved theses organized by collection", fr: "Vos mémoires sauvegardés organisés par collection" },
  "collections.all": { en: "All", fr: "Tout" },
  "collections.newPlaceholder": { en: "New collection", fr: "Nouvelle collection" },
  "collections.noBookmarks": { en: "No bookmarks yet", fr: "Aucun signet pour l'instant" },
  "collections.browseHint": { en: "Browse the database and bookmark theses you find interesting!", fr: "Parcourez la base de données et ajoutez en signets les mémoires qui vous intéressent !" },
  "collections.removed": { en: "Bookmark removed", fr: "Signet supprimé" },
  "collections.unsorted": { en: "Unsorted", fr: "Non classé" },

  // Profile
  "profile.title": { en: "Profile", fr: "Profil" },
  "profile.username": { en: "Username", fr: "Nom d'utilisateur" },
  "profile.yourUsername": { en: "Your username", fr: "Votre nom d'utilisateur" },
  "profile.save": { en: "Save", fr: "Enregistrer" },
  "profile.updated": { en: "Profile updated!", fr: "Profil mis à jour !" },
  "profile.myTheses": { en: "My Theses", fr: "Mes mémoires" },
  "profile.noTheses": { en: "You haven't submitted any theses yet.", fr: "Vous n'avez soumis aucun mémoire pour l'instant." },

  // Rating
  "rating.quality": { en: "Quality", fr: "Qualité" },
  "rating.accuracy": { en: "Accuracy", fr: "Précision" },
  "rating.noRatings": { en: "No ratings", fr: "Aucune note" },
  "rating.rated": { en: "Rated!", fr: "Noté !" },
  "rating.accuracyRated": { en: "Accuracy rated!", fr: "Précision notée !" },

  // Comments
  "comments.title": { en: "Comments", fr: "Commentaires" },
  "comments.placeholder": { en: "Share your thoughts...", fr: "Partagez vos réflexions..." },
  "comments.post": { en: "Post Comment", fr: "Publier" },
  "comments.anonymous": { en: "Anonymous", fr: "Anonyme" },

  // Bookmark
  "bookmark.added": { en: "Bookmarked!", fr: "Ajouté aux signets !" },
  "bookmark.removed": { en: "Removed from bookmarks", fr: "Retiré des signets" },

  // NotFound
  "notFound.title": { en: "404", fr: "404" },
  "notFound.message": { en: "Oops! Page not found", fr: "Oups ! Page introuvable" },
  "notFound.back": { en: "Return to Home", fr: "Retour à l'accueil" },

  // Common
  "common.error": { en: "Error", fr: "Erreur" },
} as const;

export type TranslationKey = keyof typeof translations;
