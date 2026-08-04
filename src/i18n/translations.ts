export type Language = "en" | "fr";

export const translations = {
  // Navbar
  "nav.database": { en: "Database", fr: "Base de données" },
  "nav.sources": { en: "Sources", fr: "Sources" },
  "nav.submit": { en: "Submit", fr: "Soumettre" },
  "nav.collections": { en: "Collections", fr: "Collections" },
  "nav.profile": { en: "Profile", fr: "Profil" },
  "nav.admin": { en: "Admin", fr: "Admin" },
  "nav.signIn": { en: "Sign In", fr: "Connexion" },
  "nav.signOut": { en: "Sign Out", fr: "Se déconnecter" },

  // Auth
  "auth.createAccount": { en: "Keep moving on your thesis", fr: "Avance sur ton travail" },
  "auth.welcomeBack": { en: "Good to see you again", fr: "Content de te revoir" },
  "auth.joinCommunity": { en: "Support made just for you, every step of the way", fr: "Un accompagnement rien que pour toi, à chaque étape" },
  "auth.signInToAccount": { en: "Sign back in to pick up where you left off", fr: "Reconnecte-toi pour continuer où tu en étais" },
  "auth.username": { en: "Username", fr: "Nom d'utilisateur" },
  "auth.yourUsername": { en: "Your username", fr: "Ton nom d'utilisateur" },
  "auth.email": { en: "Email", fr: "E-mail" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.loading": { en: "Loading...", fr: "Chargement..." },
  "auth.signUp": { en: "Sign Up", fr: "S'inscrire" },
  "auth.signInBtn": { en: "Sign In", fr: "Se connecter" },
  "auth.alreadyHaveAccount": { en: "Already have an account?", fr: "Tu as déjà un compte ?" },
  "auth.dontHaveAccount": { en: "Don't have an account?", fr: "Tu n'as pas de compte ?" },
  "auth.accountCreated": { en: "Account created!", fr: "Compte créé !" },
  "auth.checkEmail": { en: "Check your email to confirm your account.", fr: "Vérifie ton e-mail pour confirmer ton compte." },
  "auth.forgotPassword": { en: "Forgot password?", fr: "Mot de passe oublié ?" },
  "auth.resetPasswordTitle": { en: "Reset your password", fr: "Réinitialise ton mot de passe" },
  "auth.resetPasswordDescription": {
    en: "Enter your email and we'll send you a link to reset your password.",
    fr: "Indique ton e-mail, on t'envoie un lien pour réinitialiser ton mot de passe.",
  },
  "auth.sendResetLink": { en: "Send reset link", fr: "Envoyer le lien" },
  "auth.resetLinkSent": { en: "Check your email", fr: "Vérifie ta boîte mail" },
  "auth.resetLinkSentDescription": {
    en: "If an account exists for that email, we've sent a link to reset your password.",
    fr: "Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé.",
  },
  "auth.backToSignIn": { en: "Back to sign in", fr: "Retour à la connexion" },
  "auth.newPassword": { en: "New password", fr: "Nouveau mot de passe" },
  "auth.confirmPassword": { en: "Confirm password", fr: "Confirmer le mot de passe" },
  "auth.passwordsDontMatch": { en: "Passwords don't match", fr: "Les mots de passe ne correspondent pas" },
  "auth.setNewPassword": { en: "Set new password", fr: "Définir le nouveau mot de passe" },
  "auth.passwordUpdated": { en: "Password updated", fr: "Mot de passe mis à jour" },
  "auth.passwordUpdatedDescription": {
    en: "You can now sign in with your new password.",
    fr: "Tu peux maintenant te connecter avec ton nouveau mot de passe.",
  },
  "auth.invalidResetLink": {
    en: "This reset link is invalid or has expired.",
    fr: "Ce lien de réinitialisation est invalide ou a expiré.",
  },
  "auth.requestNewLink": { en: "Request a new link", fr: "Demander un nouveau lien" },

  // Index / Landing
  "landing.title": { en: "Hexbiblio", fr: "Hexbiblio" },
  "landing.subtitle": {
    en: "Tell me your research question. I'll help you see it more clearly — your field, the key themes, and every step through to methodology.",
    fr: "Pose ta question de recherche. On t'aide à voir plus clair — ta discipline, tes thèmes clés, et chaque étape jusqu'à la méthodologie.",
  },
  "landing.getStarted": { en: "Get Started", fr: "Commencer" },
  "landing.featuresTitle": { en: "How it works", fr: "Comment ça marche" },
  "landing.ctaSubtitle": {
    en: "Get support to move your research forward — and see what other students have already explored, whenever you're ready.",
    fr: "Un accompagnement pour faire avancer ta recherche — et de quoi découvrir ce que d'autres ont déjà exploré, quand tu es prêt.",
  },
  "landing.disciplineTitle": { en: "Discipline Recognition", fr: "Reconnaissance de discipline" },
  "landing.disciplineDesc": { en: "Your field and its cross-discipline connections, identified from your own research question.", fr: "Ton domaine et ses connexions interdisciplinaires, identifiés à partir de ta propre question de recherche." },
  "landing.themeTitle": { en: "Theme Extraction", fr: "Extraction de thèmes" },
  "landing.themeDesc": { en: "Key themes, concepts, and keywords surfaced automatically to sharpen your focus.", fr: "Thèmes clés, concepts et mots-clés identifiés automatiquement pour affiner ton sujet." },
  "landing.repoTitle": { en: "Thesis Repository", fr: "Dépôt de travaux" },
  "landing.repoDesc": { en: "Put your work online, at your own pace, whenever it's ready.", fr: "Mets ton travail en ligne, à ton rythme, quand il est prêt." },
  "landing.feedbackTitle": { en: "Community Feedback", fr: "Retours communautaires" },
  "landing.feedbackDesc": { en: "When you're ready, see what others have written — and leave a note if it helped you.", fr: "Quand tu es prêt, découvre ce que d'autres ont écrit — et laisse un mot si ça t'a aidé." },

  // Chat
  "chat.title": { en: "Think Out Loud", fr: "Réfléchis à voix haute" },
  "chat.subtitle": {
    en: "You don't need to have it all figured out yet. Tell me where you're at, and we'll take it from there together.",
    fr: "Pas besoin d'avoir déjà les idées claires. Dis-moi où tu en es, on avance ensemble à partir de là.",
  },
  "chat.placeholder": { en: "Enter your research question...", fr: "Entre ta question de recherche..." },
  "chat.step1Title": { en: "Ask your question", fr: "Pose ta question" },
  "chat.step1Desc": { en: "Describe your topic, even a vague one.", fr: "Décris ton sujet, même vague." },
  "chat.step2Title": { en: "Your mentor looks it over", fr: "Ton mentor l'analyse" },
  "chat.step2Desc": { en: "Discipline and key themes surface instantly.", fr: "Discipline et thèmes clés identifiés instantanément." },
  "chat.step3Title": { en: "You get guided", fr: "Tu es guidé" },
  "chat.step3Desc": { en: "Refine your question, thesis, and methodology step by step.", fr: "Affine question, thèse et méthodologie pas à pas." },

  // Onboarding (first-steps personalization card, shown until profile has level + field)
  // Title/subtitle are built inline in OnboardingCard.tsx, not here — the
  // first name sits mid-sentence, which translations.ts's static lookups can't do.
  "onboarding.firstNamePlaceholder": { en: "Your first name", fr: "Ton prénom" },
  "onboarding.lastNameLabel": { en: "Last name (optional)", fr: "Nom (facultatif)" },
  "onboarding.lastNamePlaceholder": { en: "Your last name", fr: "Ton nom" },
  "onboarding.academicLevelLabel": { en: "Academic level", fr: "Niveau académique" },
  "onboarding.selectLevel": { en: "Select your level", fr: "Choisis ton niveau" },
  "onboarding.fieldLabel": { en: "Field of study", fr: "Domaine d'études" },
  "onboarding.selectField": { en: "Select your field", fr: "Choisis ton domaine" },
  "onboarding.interestsLabel": { en: "A few interests (optional)", fr: "Quelques intérêts (facultatif)" },
  "onboarding.interestsPlaceholder": { en: "e.g. climate policy...", fr: "ex. politique climatique..." },
  "onboarding.save": { en: "Save and continue", fr: "Enregistrer et continuer" },
  "onboarding.saved": { en: "Got it, thanks!", fr: "Merci, c'est noté !" },

  // Database
  "db.title": { en: "Work Already Online", fr: "Les travaux déjà en ligne" },
  "db.subtitle": { en: "See what others have already explored on your topic", fr: "Regarde ce que d'autres ont déjà exploré sur ton sujet" },
  "db.searchPlaceholder": { en: "Search by title, author, or keyword...", fr: "Rechercher par titre, auteur ou mot-clé..." },
  "db.allFields": { en: "All Fields", fr: "Tous les domaines" },
  "db.allDegrees": { en: "All Degrees", fr: "Tous les diplômes" },
  "db.yearFrom": { en: "From year", fr: "À partir de" },
  "db.yearTo": { en: "To year", fr: "Jusqu'à" },
  "db.noTheses": { en: "No results found", fr: "Aucun résultat" },
  "db.tryAdjusting": { en: "Try different keywords, or be the first to explore this topic here.", fr: "Essaie d'autres mots-clés, ou sois le premier à explorer ce sujet ici." },
  "db.publicBanner": { en: "You're browsing in open access. Create an account to unlock the PDF, extracted bibliography, related theses and discussions.", fr: "Tu parcours en accès libre. Crée un compte pour débloquer le PDF, la bibliographie extraite, les mémoires proches et les discussions." },
  "db.publicBannerButton": { en: "Create an account", fr: "Créer un compte" },

  // Sources
  "sources.title": { en: "Sources", fr: "Sources" },
  "sources.subtitle": { en: "Citations pulled from the work already online", fr: "Citations extraites des travaux déjà en ligne" },
  "sources.searchPlaceholder": { en: "Search by citation, title, or author...", fr: "Rechercher par citation, titre ou auteur..." },
  "sources.essentialsTab": { en: "Key works", fr: "Les incontournables" },
  "sources.allTab": { en: "All sources", fr: "Toutes les sources" },
  "sources.essentialsIntroAll": {
    en: "The most cited works, across every field.",
    fr: "Les travaux les plus cités, tous domaines confondus.",
  },
  "sources.seeCitations": { en: "See the citations", fr: "Voir les citations" },
  "sources.noEssentials": { en: "Nothing stands out yet", fr: "Rien ne ressort encore" },
  "sources.noEssentialsHint": {
    en: "A work shows up here once at least two theses cite it. Pick another field, or come back when more work has been put online.",
    fr: "Un travail apparaît ici dès que deux mémoires au moins le citent. Essaie un autre domaine, ou reviens quand plus de travaux auront été mis en ligne.",
  },
  "sources.noSources": { en: "No results found", fr: "Aucun résultat" },
  "sources.tryAdjusting": { en: "Try different keywords or filters.", fr: "Essaie d'autres mots-clés ou filtres." },
  "sources.fromThesis": { en: "From", fr: "Issu de" },

  // Submit
  "submit.title": { en: "Put Your Work Online", fr: "Mets ton travail en ligne" },
  "submit.subtitle": { en: "A safe place to put your work", fr: "Un endroit sûr pour déposer ton travail" },
  "submit.titleLabel": { en: "Title", fr: "Titre" },
  "submit.titlePlaceholder": { en: "Your thesis title", fr: "Le titre de ton mémoire" },
  "submit.authorLabel": { en: "Author Name", fr: "Nom de l'auteur" },
  "submit.authorPlaceholder": { en: "Full name", fr: "Nom complet" },
  "submit.authorLocked": { en: "Locked to your profile's first and last name (not editable).", fr: "Verrouillé sur ton prénom et nom de profil (non modifiable)." },
  "submit.lastNameNeeded": { en: "Add your last name so your work is published under your full name. We'll remember it.", fr: "Ajoute ton nom pour publier sous ton nom complet. On s'en souviendra." },
  "submit.authorMissing": { en: "Set your first and last name on your profile before submitting your work.", fr: "Renseigne ton prénom et ton nom dans ton profil avant de soumettre ton travail." },
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
  "submit.abstractPlaceholder": { en: "Summarize your research...", fr: "Résume ta recherche..." },
  "submit.pdfLabel": { en: "PDF File", fr: "Fichier PDF" },
  "submit.chooseFile": { en: "Choose file", fr: "Choisir un fichier" },
  "submit.maxSize": { en: "Max 20MB", fr: "Max 20 Mo" },
  "submit.submitting": { en: "Uploading...", fr: "Envoi du fichier..." },
  "submit.verifying": { en: "Verifying content...", fr: "Vérification du contenu..." },
  "submit.submitBtn": { en: "Submit", fr: "Soumettre" },
  "submit.success": { en: "It's done", fr: "C'est fait" },
  "submit.successDesc": { en: "Your thesis is online.", fr: "Ton mémoire est en ligne." },
  "submit.error.title_too_short": { en: "Title is too short.", fr: "Le titre est trop court." },
  "submit.error.abstract_too_short": { en: "Abstract is too short (minimum 150 characters / 20 words).", fr: "Le résumé est trop court (minimum 150 caractères / 20 mots)." },
  "submit.error.abstract_repetitive": { en: "Your abstract looks repetitive — try writing a real summary of your research.", fr: "Le résumé semble répétitif — essaie de rédiger un vrai résumé de ta recherche." },
  "submit.error.duplicate": { en: "A submission with this title and author already exists.", fr: "Un travail avec ce titre et cet auteur existe déjà." },
  "submit.error.pdfRequired": { en: "A PDF file is required — it's checked against your title, field, and abstract.", fr: "Un fichier PDF est requis — il est comparé à ton titre, domaine et résumé." },
  "submit.error.contentMismatch": { en: "Content doesn't match", fr: "Le contenu ne correspond pas" },

  // Thesis detail
  "detail.backToDb": { en: "Back", fr: "Retour" },
  "detail.abstract": { en: "Abstract", fr: "Résumé" },
  "detail.downloadPdf": { en: "Download PDF", fr: "Télécharger le PDF" },
  "detail.notFound": { en: "We couldn't find this.", fr: "Ce travail est introuvable." },
  "detail.sources": { en: "Sources", fr: "Sources" },
  "detail.relatedTheses": { en: "Related theses", fr: "Mémoires proches" },
  "detail.relatedThesesHint": {
    en: "Other theses that cite several of the same sources as this one.",
    fr: "D'autres mémoires qui citent plusieurs des mêmes sources que celui-ci.",
  },
  "detail.edit": { en: "Edit details", fr: "Modifier les infos" },
  "detail.editCancel": { en: "Cancel", fr: "Annuler" },
  "detail.editSaved": { en: "Details updated.", fr: "Infos mises à jour." },
  "detail.signupCtaBody": { en: "Create a free account to download the PDF, browse the extracted bibliography, see related theses, rate this work, and join the discussion.", fr: "Crée un compte gratuit pour télécharger le PDF, consulter la bibliographie extraite, découvrir les mémoires proches, noter ce travail et rejoindre la discussion." },
  "detail.signupCtaButton": { en: "Create an account", fr: "Créer un compte" },
  "detail.cite": { en: "Cite", fr: "Citer" },
  "detail.citeTitle": { en: "Cite this thesis", fr: "Citer ce mémoire" },
  "detail.citeCopy": { en: "Copy", fr: "Copier" },
  "detail.citeCopied": { en: "Citation copied.", fr: "Citation copiée." },
  "detail.citeDownload": { en: "Download", fr: "Télécharger" },
  "detail.citeRisHint": {
    en: "Import this file directly into Zotero, Mendeley or EndNote.",
    fr: "Importe ce fichier directement dans Zotero, Mendeley ou EndNote.",
  },

  // Collections
  "collections.title": { en: "My Collections", fr: "Mes collections" },
  "collections.subtitle": { en: "Your saved work, organized by collection", fr: "Ton travail sauvegardé, organisé par collection" },
  "collections.all": { en: "All", fr: "Tout" },
  "collections.newPlaceholder": { en: "New collection", fr: "Nouvelle collection" },
  "collections.noBookmarks": { en: "No bookmarks yet", fr: "Aucun signet pour l'instant" },
  "collections.browseHint": { en: "Explore what's online, and keep here what interests you.", fr: "Explore les travaux en ligne et garde ici ceux qui t'intéressent." },
  "collections.removed": { en: "Bookmark removed", fr: "Signet supprimé" },
  "collections.unsorted": { en: "Unsorted", fr: "Non classé" },

  // Profile
  "profile.title": { en: "Profile", fr: "Profil" },
  "profile.firstName": { en: "First name", fr: "Prénom" },
  "profile.lastName": { en: "Last name", fr: "Nom" },
  "profile.nameHint": { en: "Used to identify you as the author of any work you submit.", fr: "Utilisé pour t'identifier comme auteur des travaux que tu soumets." },
  "profile.username": { en: "Username", fr: "Nom d'utilisateur" },
  "profile.yourUsername": { en: "Your username", fr: "Ton nom d'utilisateur" },
  "profile.usernameHint": { en: "Just for personalization (e.g. how your mentor addresses you) — not used as your author name.", fr: "Juste pour la personnalisation (ex. comment ton mentor s'adresse à toi) — pas utilisé comme nom d'auteur." },
  "profile.save": { en: "Save", fr: "Enregistrer" },
  "profile.updated": { en: "Profile updated!", fr: "Profil mis à jour !" },
  "profile.myTheses": { en: "My Work", fr: "Mon travail" },
  "profile.noTheses": { en: "You haven't put anything online yet — whenever you're ready.", fr: "Tu n'as encore rien mis en ligne — quand tu es prêt." },

  // Admin (moderation dashboard — internal surface, only the site owner sees this)
  "admin.title": { en: "Moderation dashboard", fr: "Tableau de modération" },
  "admin.thesesTab": { en: "Theses", fr: "Mémoires" },
  "admin.accountsTab": { en: "Accounts", fr: "Comptes" },
  "admin.noResults": { en: "No results", fr: "Aucun résultat" },
  "admin.view": { en: "View", fr: "Voir" },
  "admin.delete": { en: "Delete", fr: "Supprimer" },
  "admin.deleteThesisTitle": { en: "Delete this thesis?", fr: "Supprimer ce mémoire ?" },
  "admin.deleteThesisBody": { en: "This can't be undone.", fr: "Action irréversible." },
  "admin.deleteAccountTitle": { en: "Delete this account permanently", fr: "Supprimer ce compte définitivement" },
  "admin.deleteAccountBody": {
    en: "This deletes the account and everything tied to it — theses, comments, ratings, bookmarks. This can't be undone. Type the username below to confirm.",
    fr: "Ça supprime le compte et tout ce qui lui est lié — mémoires, commentaires, notes, favoris. Action irréversible. Tape le nom d'utilisateur ci-dessous pour confirmer.",
  },
  "admin.typeToConfirm": { en: "Type the username to confirm", fr: "Tape le nom d'utilisateur pour confirmer" },
  "admin.confirmDelete": { en: "Delete permanently", fr: "Supprimer définitivement" },
  "admin.thesisDeleted": { en: "Thesis deleted", fr: "Mémoire supprimé" },
  "admin.accountDeleted": { en: "Account deleted", fr: "Compte supprimé" },
  "admin.reportsTab": { en: "Reports", fr: "Signalements" },
  "admin.reportOpen": { en: "Open", fr: "Ouvert" },
  "admin.reportResolved": { en: "Resolved", fr: "Résolu" },
  "admin.reportDismissed": { en: "Dismissed", fr: "Rejeté" },
  "admin.reportOnThesis": { en: "on a thesis", fr: "sur un mémoire" },
  "admin.reportOnComment": { en: "on a comment", fr: "sur un commentaire" },
  "admin.reportedBy": { en: "Reported by", fr: "Signalé par" },
  "admin.reportResolve": { en: "Resolve", fr: "Résoudre" },
  "admin.reportDismiss": { en: "Dismiss", fr: "Rejeter" },

  // Thesis (concatenated with a language name from i18n/fields.ts's
  // languageLabel — this app's t() has no placeholder interpolation, so
  // these are written to read naturally with a language name appended)
  "thesis.translatedTitlePrefix": {
    en: "Title automatically translated — original in",
    fr: "Titre traduit automatiquement — original en",
  },

  // Rating
  "rating.quality": { en: "Quality", fr: "Qualité" },
  "rating.accuracy": { en: "Accuracy", fr: "Précision" },
  "rating.noRatings": { en: "No ratings yet", fr: "Aucune note pour l'instant" },
  "rating.rated": { en: "Rated!", fr: "Noté !" },
  "rating.accuracyRated": { en: "Accuracy rated!", fr: "Précision notée !" },

  // Comments
  "comments.title": { en: "Comments", fr: "Commentaires" },
  "comments.placeholder": { en: "Share your thoughts...", fr: "Partage tes réflexions..." },
  "comments.post": { en: "Post Comment", fr: "Publier" },
  "comments.anonymous": { en: "Anonymous", fr: "Anonyme" },

  // Bookmark
  "bookmark.added": { en: "Bookmarked!", fr: "Ajouté aux signets !" },
  "bookmark.removed": { en: "Removed from bookmarks", fr: "Retiré des signets" },

  // Report
  "report.action": { en: "Report", fr: "Signaler" },
  "report.alreadyReported": { en: "Reported", fr: "Signalé" },
  "report.dialogTitle": { en: "Report this", fr: "Signaler" },
  "report.reasonPlaceholder": { en: "Select a reason", fr: "Choisis une raison" },
  "report.detailsPlaceholder": { en: "Add details (optional)", fr: "Précise si besoin (facultatif)" },
  "report.submit": { en: "Submit", fr: "Envoyer" },
  "report.submitting": { en: "Sending…", fr: "Envoi…" },
  "report.submitted": { en: "Thanks, we'll take a look.", fr: "Merci, on va regarder ça." },

  // Notifications
  "notifications.title": { en: "Notifications", fr: "Notifications" },
  "notifications.empty": { en: "Nothing yet.", fr: "Rien pour l'instant." },
  "notifications.someone": { en: "Someone", fr: "Quelqu'un" },

  // NotFound
  "notFound.title": { en: "404", fr: "404" },
  "notFound.message": { en: "Oops! Page not found", fr: "Oups ! Page introuvable" },
  "notFound.back": { en: "Return to Home", fr: "Retour à l'accueil" },

  // Common
  "common.error": { en: "Error", fr: "Erreur" },
} as const;

export type TranslationKey = keyof typeof translations;
