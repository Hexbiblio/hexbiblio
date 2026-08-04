import LegalLayout from "@/components/LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="pt-4 text-lg font-semibold">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);
const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc space-y-1 pl-6 text-muted-foreground">{children}</ul>
);

const Confidentialite = () => (
  <LegalLayout title="Politique de confidentialité" updated="4 août 2026">
    <P>
      Cette politique explique quelles données Hexbiblio collecte, pourquoi, et comment les
      exercer vos droits, conformément au Règlement général sur la protection des données
      (RGPD).
    </P>

    <H2>Responsable du traitement</H2>
    <P>
      L'éditeur du site (voir les{" "}
      <a className="text-primary-text underline" href="/mentions-legales">mentions légales</a>
      ) est responsable du traitement des données décrites ici. Pour toute question ou pour
      exercer vos droits :{" "}
      <a className="text-primary-text underline" href="mailto:hexbiblio@gmail.com">hexbiblio@gmail.com</a>
    </P>

    <H2>Données collectées</H2>
    <P>Selon votre usage du site, Hexbiblio traite :</P>
    <Ul>
      <li>Identité et compte : e-mail, mot de passe (haché, jamais stocké en clair), pseudonyme, prénom et nom (utilisés pour l'attribution des mémoires que vous déposez) ;</li>
      <li>Profil académique : niveau d'études, domaine d'étude, université, pays, biographie, centres d'intérêt de recherche ;</li>
      <li>Progression de recherche : les réponses que vous donnez au mentor IA (discipline, thème, question de recherche, hypothèse, méthodologie, sources envisagées) ;</li>
      <li>Contenu déposé : mémoires au format PDF, titre, résumé, mots-clés ;</li>
      <li>Interactions : commentaires, notes, favoris, signalements que vous effectuez ;</li>
      <li>Conversations avec le mentor IA : le contenu de vos échanges dans le chat ;</li>
      <li>Données techniques : l'adresse IP des visiteurs non connectés, utilisée uniquement pour limiter les abus sur le chat.</li>
    </Ul>

    <H2>Finalités</H2>
    <P>Ces données sont utilisées pour :</P>
    <Ul>
      <li>créer et gérer votre compte ;</li>
      <li>vous permettre de déposer, consulter et rechercher des mémoires ;</li>
      <li>personnaliser l'accompagnement du mentor IA selon votre profil et votre progression ;</li>
      <li>afficher votre nom comme auteur des mémoires que vous déposez, et votre pseudonyme sur vos commentaires ;</li>
      <li>prévenir les abus (dépôts frauduleux, sur-utilisation du chat) ;</li>
      <li>répondre à vos demandes de contact.</li>
    </Ul>
    <P>
      La base légale de ces traitements est l'exécution du contrat qui vous lie à Hexbiblio
      lorsque vous créez un compte, ou l'intérêt légitime de l'éditeur pour la prévention des
      abus.
    </P>

    <H2>Qui reçoit vos données</H2>
    <P>
      Vos données ne sont jamais vendues. Elles sont partagées avec les prestataires suivants,
      strictement nécessaires au fonctionnement du service :
    </P>
    <Ul>
      <li>Supabase, Inc. — hébergement de la base de données, authentification, stockage des fichiers ;</li>
      <li>Vercel Inc. — hébergement de l'interface du site ;</li>
      <li>Google (API Gemini) — le contenu de vos conversations avec le mentor IA, et le texte des mémoires soumis pour vérification automatique, lui sont transmis afin de générer les réponses et effectuer ce contrôle. Ce traitement peut avoir lieu en dehors de l'Union européenne.</li>
    </Ul>
    <P>
      Le site charge actuellement, sur chaque page, un script publicitaire (Google AdSense) qui
      n'affiche aujourd'hui aucune publicité. Si Hexbiblio active un jour de la publicité, un
      bandeau de consentement sera affiché avant tout dépôt de cookie publicitaire — pas
      après.
    </P>

    <H2>Durée de conservation</H2>
    <Ul>
      <li>Les données de votre compte sont conservées tant que celui-ci existe.</li>
      <li>Les journaux techniques utilisés pour limiter les abus du chat (dont l'adresse IP des visiteurs non connectés) sont conservés au maximum 2 jours, uniquement à cette fin.</li>
    </Ul>

    <H2>Cookies et stockage local</H2>
    <P>
      Hexbiblio utilise le stockage local de votre navigateur pour maintenir votre session de
      connexion, mémoriser votre préférence de thème (clair/sombre) et votre langue d'affichage.
      Ces éléments sont nécessaires au fonctionnement du site et ne servent pas à vous
      suivre ailleurs sur le web.
    </P>

    <H2>Vos droits</H2>
    <P>
      Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
      et de portabilité sur vos données. Vous pouvez modifier vous-même la plupart de vos
      informations depuis votre profil. Pour toute autre demande, notamment la suppression de
      votre compte, écrivez à{" "}
      <a className="text-primary-text underline" href="mailto:hexbiblio@gmail.com">hexbiblio@gmail.com</a>
      {" "}— cette démarche est aujourd'hui traitée manuellement, un self-service est en cours de
      développement. Vous pouvez aussi introduire une réclamation auprès de la CNIL
      (cnil.fr).
    </P>

    <H2>Sécurité</H2>
    <P>
      Le site est servi en HTTPS, les mots de passe sont hachés par le fournisseur
      d'authentification, et l'accès aux données en base est restreint par des règles de
      sécurité au niveau des lignes (Row Level Security) qui limitent chaque utilisateur à ses
      propres données, sauf ce que le site rend intentionnellement public.
    </P>

    <H2>Mise à jour</H2>
    <P>
      Cette politique peut évoluer avec le service. La date en haut de cette page indique sa
      dernière mise à jour.
    </P>
  </LegalLayout>
);

export default Confidentialite;
