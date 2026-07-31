export type Language = "en" | "fr";

export const translations = {
  // Navbar
  "nav.database": { en: "Database", fr: "Base de données" },
  "nav.sources": { en: "Sources", fr: "Sources" },
  "nav.submit": { en: "Submit", fr: "Soumettre" },
  "nav.collections": { en: "Collections", fr: "Collections" },
  "nav.profile": { en: "Profile", fr: "Profil" },
  "nav.signIn": { en: "Sign In", fr: "Connexion" },
  "nav.signOut": { en: "Sign Out", fr: "Se déconnecter" },

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
  "landing.featuresTitle": { en: "How it works", fr: "Comment ça marche" },
  "landing.ctaSubtitle": {
    en: "Join a community of researchers who share their theses and help each other move their research forward.",
    fr: "Rejoignez une communauté de chercheurs qui partagent leurs mémoires et s'entraident pour faire avancer leurs recherches.",
  },
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
  "chat.step1Title": { en: "Ask your question", fr: "Posez votre question" },
  "chat.step1Desc": { en: "Describe your topic, even a vague one.", fr: "Décrivez votre sujet, même vague." },
  "chat.step2Title": { en: "AI analyzes it", fr: "L'IA l'analyse" },
  "chat.step2Desc": { en: "Discipline and key themes identified instantly.", fr: "Discipline et thèmes clés identifiés instantanément." },
  "chat.step3Title": { en: "You get guided", fr: "Vous êtes guidé" },
  "chat.step3Desc": { en: "Refine your question, thesis, and methodology step by step.", fr: "Affinez question, thèse et méthodologie pas à pas." },

  // Database
  "db.title": { en: "Thesis Database", fr: "Base de données des mémoires" },
  "db.subtitle": { en: "Browse and discover research from the community", fr: "Parcourez et découvrez les recherches de la communauté" },
  "db.searchPlaceholder": { en: "Search by title, author, or keyword...", fr: "Rechercher par titre, auteur ou mot-clé..." },
  "db.allFields": { en: "All Fields", fr: "Tous les domaines" },
  "db.allDegrees": { en: "All Degrees", fr: "Tous les diplômes" },
  "db.noTheses": { en: "No theses found", fr: "Aucun mémoire trouvé" },
  "db.tryAdjusting": { en: "Try adjusting your search or be the first to submit!", fr: "Essayez d'ajuster votre recherche ou soyez le premier à soumettre !" },

  // Sources
  "sources.title": { en: "Sources", fr: "Sources" },
  "sources.subtitle": { en: "Browse citations extracted from theses in the database", fr: "Parcourez les citations extraites des mémoires de la base" },
  "sources.searchPlaceholder": { en: "Search by citation, title, or author...", fr: "Rechercher par citation, titre ou auteur..." },
  "sources.noSources": { en: "No sources found", fr: "Aucune source trouvée" },
  "sources.tryAdjusting": { en: "Try adjusting your search or filters.", fr: "Essayez d'ajuster votre recherche ou vos filtres." },
  "sources.fromThesis": { en: "From thesis", fr: "Issu du mémoire" },

  // Submit
  "submit.title": { en: "Submit Your Thesis", fr: "Soumettre votre mémoire" },
  "submit.subtitle": { en: "Share your research with the community", fr: "Partagez votre recherche avec la communauté" },
  "submit.titleLabel": { en: "Title", fr: "Titre" },
  "submit.titlePlaceholder": { en: "Your thesis title", fr: "Le titre de votre mémoire" },
  "submit.authorLabel": { en: "Author Name", fr: "Nom de l'auteur" },
  "submit.authorPlaceholder": { en: "Full name", fr: "Nom complet" },
  "submit.authorLocked": { en: "Locked to your profile's first and last name (not editable).", fr: "Verrouillé sur le prénom et nom de votre profil (non modifiable)." },
  "submit.authorMissing": { en: "Set your first and last name on your profile before submitting a thesis.", fr: "Renseignez votre prénom et nom dans votre profil avant de soumettre un mémoire." },
  "submit.authorMissingLink": { en: "Go to my profile", fr: "Aller à mon profil" },
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
  "submit.pdfLabel": { en: "PDF File", fr: "Fichier PDF" },
  "submit.chooseFile": { en: "Choose file", fr: "Choisir un fichier" },
  "submit.maxSize": { en: "Max 20MB", fr: "Max 20 Mo" },
  "submit.submitting": { en: "Uploading...", fr: "Envoi du fichier..." },
  "submit.verifying": { en: "Verifying content...", fr: "Vérification du contenu..." },
  "submit.submitBtn": { en: "Submit Thesis", fr: "Soumettre le mémoire" },
  "submit.success": { en: "Thesis submitted!", fr: "Mémoire soumis !" },
  "submit.successDesc": { en: "Your thesis has been added to the database.", fr: "Votre mémoire a été ajouté à la base de données." },
  "submit.error.title_too_short": { en: "Title is too short.", fr: "Le titre est trop court." },
  "submit.error.abstract_too_short": { en: "Abstract is too short (minimum 150 characters / 20 words).", fr: "Le résumé est trop court (minimum 150 caractères / 20 mots)." },
  "submit.error.abstract_repetitive": { en: "Your abstract looks repetitive — please write an actual summary of your research.", fr: "Le résumé semble répétitif — merci de rédiger un vrai résumé de votre recherche." },
  "submit.error.duplicate": { en: "A thesis with this title and author already exists in the database.", fr: "Un mémoire avec ce titre et cet auteur existe déjà dans la base de données." },
  "submit.error.pdfRequired": { en: "A PDF file is required — it's checked against your title, field, and abstract.", fr: "Un fichier PDF est requis — il est comparé à votre titre, domaine et résumé." },
  "submit.error.contentMismatch": { en: "Content doesn't match", fr: "Le contenu ne correspond pas" },

  // Thesis detail
  "detail.backToDb": { en: "Back to Database", fr: "Retour à la base de données" },
  "detail.abstract": { en: "Abstract", fr: "Résumé" },
  "detail.downloadPdf": { en: "Download PDF", fr: "Télécharger le PDF" },
  "detail.notFound": { en: "Thesis not found", fr: "Mémoire introuvable" },
  "detail.sources": { en: "Sources", fr: "Sources" },
  "detail.edit": { en: "Edit details", fr: "Modifier les infos" },
  "detail.editCancel": { en: "Cancel", fr: "Annuler" },
  "detail.editSaved": { en: "Thesis details updated.", fr: "Infos du mémoire mises à jour." },

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
  "profile.firstName": { en: "First name", fr: "Prénom" },
  "profile.lastName": { en: "Last name", fr: "Nom" },
  "profile.nameHint": { en: "Used to identify you as the author of any thesis you submit.", fr: "Utilisé pour vous identifier comme auteur des mémoires que vous soumettez." },
  "profile.username": { en: "Username", fr: "Nom d'utilisateur" },
  "profile.yourUsername": { en: "Your username", fr: "Votre nom d'utilisateur" },
  "profile.usernameHint": { en: "Just for personalization (e.g. how the assistant addresses you) — not used as your author name.", fr: "Juste pour la personnalisation (ex. comment l'assistant s'adresse à vous) — pas utilisé comme nom d'auteur." },
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
