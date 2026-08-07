import type { QuestId } from "@/components/ThesisQuests";

interface RoadmapStepContent {
  context: { en: string; fr: string };
  motivation: { en: string; fr: string };
  tips: { en: string; fr: string }[];
}

// Editorial content for the /roadmap ("Almanach") page — one entry per
// QuestId, adapted from the same two sources thesis-chat's SYSTEM_PROMPT
// draws on (its own "The Journey" step descriptions, and the institutional
// methodology guide the user supplied), so this page never tells a student
// something the mentor bot would contradict in conversation. Deliberately
// does NOT list the chat-detection keywords/regex cues (see USER_CUES in
// ThesisQuests.tsx) — that would turn the page into an answer-key a student
// could paste back at the bot instead of actually thinking it through.
export const ROADMAP_CONTENT: Record<QuestId, RoadmapStepContent> = {
  discipline: {
    context: {
      en: "Before picking a topic, you need to know which disciplinary field you're working in — sociology, law, management, education sciences... That choice shapes the methods, the literature, and the expectations that will apply to your whole thesis.",
      fr: "Avant de choisir un sujet, il faut savoir dans quel cadre disciplinaire tu vas travailler — sociologie, droit, management, sciences de l'éducation... Ce choix détermine les méthodes, la littérature, et les attentes qui s'appliqueront à ton mémoire.",
    },
    motivation: {
      en: "A clear discipline gives you a shared vocabulary and methodological landmarks already in place — you're not starting from scratch.",
      fr: "Une discipline claire, c'est un vocabulaire commun et des repères méthodologiques déjà balisés — tu ne pars pas de zéro.",
    },
    tips: [
      {
        en: "Torn between two fields? Go with the one you'll actually be graded in.",
        fr: "Si tu hésites entre deux disciplines, pense à celle dans laquelle tu seras évalué·e.",
      },
      {
        en: "A precise discipline (\"sociology of work\" rather than \"social sciences\") lets the mentor give you advice that's actually targeted.",
        fr: "Une discipline précise (« sociologie du travail » plutôt que « sciences sociales ») aide le mentor à te donner des conseils vraiment ciblés.",
      },
      {
        en: "This isn't set in stone — you can refine it as the conversation goes.",
        fr: "Ce choix n'est pas gravé dans le marbre — tu peux le préciser au fil de la conversation.",
      },
    ],
  },
  theme: {
    context: {
      en: "A theme is a broad territory — \"professional sport,\" \"AI in education.\" The next step will narrow it into a precise question, but you first need to name the territory itself.",
      fr: "Un thème, c'est un vaste territoire — « le sport professionnel », « l'intelligence artificielle en éducation ». L'étape suivante consistera à le resserrer en une problématique précise, mais il faut d'abord identifier ce territoire.",
    },
    motivation: {
      en: "A theme that's too broad leads to a thesis that never goes deep anywhere; one that's already narrowed saves real time later.",
      fr: "Un thème trop large mène à un mémoire qui n'aborde rien en profondeur ; un thème déjà resserré fait gagner un temps précieux plus tard.",
    },
    tips: [
      {
        en: "Start from what genuinely interests you — you'll be spending months on it.",
        fr: "Pars de ce qui t'intéresse vraiment — tu vas y passer plusieurs mois.",
      },
      {
        en: "A good test: can you name 2-3 real debates or tensions already existing around this theme?",
        fr: "Un bon test : peux-tu citer 2-3 débats ou tensions existant sur ce thème ?",
      },
      {
        en: "Don't look for the exact question yet — that's the next step.",
        fr: "Ne cherche pas encore la question exacte — ça vient à l'étape suivante.",
      },
    ],
  },
  question: {
    context: {
      en: "The research question is the core of your thesis: a guiding question, breakable into sub-questions, that orients the whole demonstration. A good research question is conceptual — not a simple descriptive question a directory could already answer.",
      fr: "La problématique est le cœur de ton mémoire : une question directrice, décomposable en sous-questions, qui oriente toute la démonstration. Une bonne problématique est conceptuelle — pas une simple question descriptive à laquelle un annuaire répondrait déjà.",
    },
    motivation: {
      en: "Everything after this — thesis, methodology, plan — flows from this question. Better to get it right now than redo it halfway through.",
      fr: "Toute la suite — thèse, méthodologie, plan — découle de cette question. Mieux vaut la travailler à fond maintenant que la refaire à mi-parcours.",
    },
    tips: [
      {
        en: "Test your question: does it call for a real demonstration, or an answer that's already known?",
        fr: "Teste ta question : appelle-t-elle une vraie démonstration, ou une réponse déjà connue ?",
      },
      {
        en: "A good research question breaks down into 2-3 concrete sub-questions.",
        fr: "Une bonne problématique se décline en 2-3 sous-questions concrètes.",
      },
      {
        en: "Avoid closed (yes/no) questions — favor \"how,\" \"why,\" \"to what extent.\"",
        fr: "Évite les questions fermées (oui/non) — privilégie « comment », « pourquoi », « dans quelle mesure ».",
      },
    ],
  },
  thesis: {
    context: {
      en: "Your thesis statement is your provisional answer to the research question — a position you'll defend and verify empirically, not an obvious fact or a value judgment.",
      fr: "L'énoncé de thèse est ta réponse provisoire à la problématique — une position que tu vas défendre et vérifier empiriquement, pas une évidence ni un jugement de valeur.",
    },
    motivation: {
      en: "A clear thesis gives your plan a backbone: every part has to bring evidence in its support.",
      fr: "Une thèse claire donne une colonne vertébrale à ton plan : chaque partie doit apporter une preuve à l'appui.",
    },
    tips: [
      {
        en: "Your thesis should be arguable — someone could reasonably disagree with it.",
        fr: "Ta thèse doit être discutable — quelqu'un pourrait ne pas être d'accord.",
      },
      {
        en: "Aim for neutrality: no value judgment, an argued and verifiable position.",
        fr: "Vise la neutralité : pas de jugement de valeur, une position argumentée et vérifiable.",
      },
      {
        en: "If you can't phrase a clear, affirmative sentence, the question probably still needs sharpening.",
        fr: "Si tu n'arrives pas à formuler une phrase affirmative claire, c'est probablement que la question n'est pas encore assez précise.",
      },
    ],
  },
  method: {
    context: {
      en: "Methodology is how you'll produce and analyze the data that answers your question. Naming a method (\"I'll do qualitative work\") isn't enough — it has to be justified, dimension by dimension.",
      fr: "La méthodologie, c'est comment tu vas produire et analyser les données qui répondront à ta question. Nommer une méthode (« je ferai du qualitatif ») ne suffit pas — il faut la justifier, dimension par dimension.",
    },
    motivation: {
      en: "This is where the mentor pushes hardest — a well-built methodology is what separates a solid thesis from one that just asserts things.",
      fr: "C'est l'étape où le mentor est le plus exigeant : une méthodologie bien construite, c'est ce qui distingue un mémoire solide d'un mémoire qui se contente d'affirmer.",
    },
    tips: [
      {
        en: "Research design — what type of study, and why it fits better than the obvious alternatives.",
        fr: "Design de recherche — quel type d'étude, et pourquoi il convient mieux que les alternatives évidentes.",
      },
      {
        en: "Sampling / corpus — who or what you're studying, how it was selected, and why that choice is defensible.",
        fr: "Échantillon / corpus — qui ou quoi tu étudies, comment tu l'as sélectionné, et pourquoi ce choix est défendable.",
      },
      {
        en: "Data collection — the concrete instrument (interview guide, experimental protocol, corpus of texts). A useful habit: keep a research log recording each methodological choice as you make it.",
        fr: "Collecte de données — l'instrument concret (guide d'entretien, protocole expérimental, corpus de textes). Un réflexe utile : tenir un journal d'enquête consignant chaque choix méthodologique au fil de l'eau.",
      },
      {
        en: "Analysis — how you go from raw data to findings (coding scheme, statistical test, reading framework) — \"I'll analyze it\" isn't a method.",
        fr: "Analyse — comment tu passes des données brutes aux résultats (grille de codage, test statistique, cadre de lecture) — « je vais analyser » n'est pas une méthode d'analyse.",
      },
      {
        en: "Validity / rigor — triangulation and reflexivity for qualitative work, controls and statistical power for quantitative work; and in every case, source criticism: who produced this data, for what purpose, and how that purpose shapes what it can show.",
        fr: "Validité / rigueur — triangulation et réflexivité pour le qualitatif, contrôles et puissance statistique pour le quantitatif ; et dans tous les cas, une critique des sources : qui a produit cette donnée, dans quel but, et comment ce but façonne ce qu'elle peut montrer.",
      },
      {
        en: "Ethics — consent, conflicts of interest, and for interviews specifically: data protection (GDPR) — where recordings are stored, and any AI-assisted transcription must be reviewed and corrected before use.",
        fr: "Éthique — consentement, conflits d'intérêt, et pour les entretiens : protection des données (RGPD) — où sont stockés les enregistrements, et toute retranscription assistée par IA doit être relue et corrigée avant usage.",
      },
    ],
  },
  sources: {
    context: {
      en: "Gathering your sources means building the state of the art your thesis will rest on — books, articles, similar theses. Hexbiblio helps concretely here: the Sources page surfaces references already extracted from other theses in your field, and related theses that share citations with yours.",
      fr: "Rassembler tes sources, c'est construire l'état de l'art sur lequel ton mémoire va s'appuyer — livres, articles, mémoires similaires. Hexbiblio t'aide concrètement : la page Sources répertorie les références déjà extraites d'autres mémoires du même domaine, et les mémoires proches du tien par sources partagées.",
    },
    motivation: {
      en: "A solid bibliography is the proof you actually know what's already been written on your topic — and it saves you from reinventing the wheel.",
      fr: "Une bibliographie solide, c'est la preuve que tu maîtrises ce qui a déjà été écrit sur ton sujet — et ça évite de redécouvrir l'eau chaude.",
    },
    tips: [
      {
        en: "Check your field's most-cited works on /sources — the references other students' theses cite most often.",
        fr: "Consulte les incontournables de ton domaine sur /sources — les références les plus citées par les mémoires déjà déposés.",
      },
      {
        en: "A systematic reading card per source (outline, argument, method, quotes with page numbers) saves enormous time when writing.",
        fr: "Une fiche de lecture systématique par source (plan, problématique, méthode, citations avec pagination) fait gagner un temps immense à la rédaction.",
      },
      {
        en: "A reference manager (Zotero) avoids formatting mistakes — every thesis page's \"Cite\" button already exports to APA, BibTeX, or RIS.",
        fr: "Un gestionnaire bibliographique (Zotero) évite les erreurs de norme — le bouton « Citer » de chaque mémoire sur Hexbiblio exporte directement en APA, BibTeX ou RIS.",
      },
    ],
  },
  plan: {
    context: {
      en: "The writing plan turns your demonstration into a concrete structure — how many parts, in what order, and what each one adds over the last. This is the one step chat can't validate for you: it takes shape over several days, not one exchange. Fill it in directly from your profile.",
      fr: "Le plan de rédaction traduit ta démonstration en structure concrète — combien de parties, dans quel ordre, et ce que chacune apporte par rapport à la précédente. C'est la seule étape que le chat ne peut pas valider à ta place : elle se construit sur plusieurs jours, pas en un échange. Renseigne-la directement depuis ton profil.",
    },
    motivation: {
      en: "A plan is a demonstration strategy, not a catalog of ideas side by side — every part has to move the argument forward.",
      fr: "Un plan est une stratégie de démonstration, pas un catalogue d'idées juxtaposées — chaque partie doit faire avancer l'argument.",
    },
    tips: [
      {
        en: "2 to 4 hierarchy levels at most — over-splitting hurts readability.",
        fr: "2 à 4 niveaux hiérarchiques maximum — le sur-découpage nuit à la lisibilité.",
      },
      {
        en: "Precise, concrete titles — never bare keywords.",
        fr: "Des titres précis et concrets, jamais de simples mots-clés.",
      },
      {
        en: "Transitions alone should let a reader follow the thread of the demonstration.",
        fr: "Les transitions doivent, à elles seules, permettre de suivre le fil de la démonstration.",
      },
      {
        en: "The introduction (about 10% of the volume) is written last: topic → tightened state of the art → research question → hypotheses → methodology → plan announcement.",
        fr: "L'introduction (environ 10 % du volume) se rédige en dernier : sujet → état de l'art resserré → problématique → hypothèses → méthodologie → annonce du plan.",
      },
      {
        en: "The conclusion sums up the demonstration — never a new idea that wasn't developed earlier.",
        fr: "La conclusion fait le bilan de la démonstration — jamais d'idée nouvelle non développée en amont.",
      },
    ],
  },
};
