import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Hexbiblio</span>
        <nav className="flex items-center gap-4">
          <Link to="/mentions-legales" className="hover:text-foreground hover:underline">
            {t("footer.legalNotice")}
          </Link>
          <Link to="/confidentialite" className="hover:text-foreground hover:underline">
            {t("footer.privacy")}
          </Link>
          <Link to="/cgu" className="hover:text-foreground hover:underline">
            {t("footer.terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
