import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="pt-4 text-lg font-semibold">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);

const MentionsLegales = () => (
  <LegalLayout title="Mentions légales" updated="4 août 2026">
    <H2>Éditeur du site</H2>
    <P>
      Le site Hexbiblio (accessible à l'adresse www.hexbiblio.fr) est édité par un particulier,
      à titre non professionnel. <strong>Nom et adresse de l'éditeur : [à compléter]</strong>.
      Conformément à l'article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance
      dans l'économie numérique, l'éditeur non professionnel peut ne pas rendre publiques ces
      informations, à condition de les avoir communiquées à son hébergeur ; elles restent
      communicables sur demande aux autorités compétentes.
    </P>
    <P>
      Directeur de la publication : la même personne que l'éditeur ci-dessus.
    </P>
    <P>
      Contact : <a className="text-primary-text underline" href="mailto:hexbiblio@gmail.com">hexbiblio@gmail.com</a>
    </P>

    <H2>Hébergement</H2>
    <P>
      Le site (interface et fichiers statiques) est hébergé par Vercel Inc. — coordonnées
      complètes disponibles sur vercel.com/legal.
    </P>
    <P>
      La base de données, l'authentification, le stockage des fichiers déposés et les fonctions
      serveur sont hébergés par Supabase, Inc. — coordonnées complètes disponibles sur
      supabase.com.
    </P>
    <P>
      Le nom de domaine hexbiblio.fr est enregistré auprès d'OVHcloud SAS.
    </P>

    <H2>Propriété intellectuelle</H2>
    <P>
      La structure du site, son identité visuelle (nom « Hexbiblio », logo, mascotte) et les
      textes qui ne sont pas déposés par un utilisateur appartiennent à l'éditeur. Toute
      reproduction sans autorisation est interdite.
    </P>
    <P>
      Les mémoires, résumés et autres contenus déposés par les utilisateurs restent la propriété
      de leurs auteurs respectifs, dans les conditions décrites dans les{" "}
      <Link className="text-primary-text underline" to="/cgu">conditions d'utilisation</Link>.
    </P>

    <H2>Données personnelles</H2>
    <P>
      Le traitement des données personnelles collectées sur Hexbiblio est décrit dans la{" "}
      <Link className="text-primary-text underline" to="/confidentialite">politique de confidentialité</Link>.
    </P>

    <H2>Contact</H2>
    <P>
      Pour toute question relative au site ou à ces mentions légales :{" "}
      <a className="text-primary-text underline" href="mailto:hexbiblio@gmail.com">hexbiblio@gmail.com</a>
    </P>
  </LegalLayout>
);

export default MentionsLegales;
