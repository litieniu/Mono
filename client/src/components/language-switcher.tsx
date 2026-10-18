import { Languages } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

/**
 * 语言切换器（中/英）
 * 放在导航栏，切换时保持当前路径
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  const toggle = () => {
    const next: Language = lang === "zh" ? "en" : "zh";
    setLang(next);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex min-h-[36px] items-center gap-[6px] rounded-md px-[10px] text-[13px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground ${className}`}
      title={t("common.language")}
      aria-label={t("common.language")}
    >
      <Languages className="h-[15px] w-[15px]" />
      <span className="font-medium">{lang === "zh" ? "EN" : "中文"}</span>
    </button>
  );
}
