import LegalLayout from "@/components/LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="pt-4 text-lg font-semibold">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);

const CGU = () => (
  <LegalLayout title="Conditions générales d'utilisation" updated="4 août 2026">
    <H2>Objet</H2>
    <P>
      Hexbiblio est une plateforme de partage de mémoires et thèses académiques, avec un
      mentor conversationnel assisté par IA et des outils de recherche bibliographique.
      L'utilisation du site implique l'acceptation pleine et entière des présentes conditions.
    </P>

    <H2>Compte</H2>
    <P>
      L'inscription nécessite d'avoir au moins 15 ans — l'âge à partir duquel le droit français
      permet à un mineur de consentir seul au traitement de ses données personnelles — ou d'avoir
      l'autorisation d'un représentant légal. Les informations fournies lors de l'inscription
      doivent être exactes ; le prénom et le nom servent notamment à attribuer les mémoires que
      vous déposez. Vous êtes responsable de la confidentialité de votre mot de passe.
    </P>

    <H2>Mémoires déposés</H2>
    <P>
      En déposant un mémoire, vous garantissez en être l'auteur ou détenir les droits
      nécessaires pour le partager, et vous accordez à Hexbiblio une licence non exclusive
      pour l'héberger, l'afficher et permettre son téléchargement par les autres utilisateurs
      du site. Vous restez titulaire de vos droits d'auteur.
    </P>
    <P>
      Chaque dépôt fait l'objet d'une vérification automatique (cohérence entre le titre, le
      résumé et le contenu du fichier) avant sa mise en ligne. Vous pouvez demander le retrait
      de votre mémoire à tout moment en écrivant à{" "}
      <a className="text-primary-text underline" href="mailto:hexbiblio@gmail.com">hexbiblio@gmail.com</a>
      ; la demande est traitée dans un délai raisonnable.
    </P>

    <H2>Mentor IA</H2>
    <P>
      Les réponses du mentor sont générées par un modèle d'intelligence artificielle tiers
      (Google Gemini). Elles peuvent contenir des erreurs ou des approximations et ne
      remplacent pas l'avis d'un directeur de mémoire ou d'un enseignant. Vous restez seul
      responsable du contenu académique que vous produisez.
    </P>

    <H2>Comportement attendu</H2>
    <P>
      Vous vous engagez à ne pas déposer de contenu qui ne serait pas de votre fait, à ne pas
      détourner le service à des fins de spam ou d'abus, et à signaler tout contenu ou
      commentaire problématique via les outils prévus à cet effet. Hexbiblio peut suspendre ou
      supprimer un compte en cas de manquement à ces règles.
    </P>

    <H2>Disponibilité</H2>
    <P>
      Le service est fourni « en l'état », sans garantie de disponibilité continue. Des
      interruptions peuvent survenir pour maintenance ou en raison de facteurs indépendants de
      l'éditeur (hébergeurs, fournisseur d'intelligence artificielle).
    </P>

    <H2>Droit applicable</H2>
    <P>
      Les présentes conditions sont soumises au droit français. Tout litige relève des
      tribunaux français compétents.
    </P>
  </LegalLayout>
);

export default CGU;
