import { useState } from "react";
import { SeoHead } from "@/components/seo-head";
import { useLanguage } from "@/lib/i18n";
import { Mail, Send } from "lucide-react";

/**
 * 联系页面（E-E-A-T：证明真实人类运营）
 */
export function ContactPage() {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[720px] py-[32px] lg:py-[56px] px-[16px] lg:px-0">
      <SeoHead
        title={isEn ? "Contact Us" : "联系我们"}
        description={isEn ? "Get in touch with the human behind this blog." : "与这个博客背后的人类取得联系。"}
        url={isEn ? "/en/contact" : "/contact"}
      />
      <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{isEn ? "Contact Us" : "联系我们"}</h1>
      <p className="mt-[8px] mb-[24px] text-[15px] text-muted-foreground leading-[1.8]">
        {isEn
          ? "This blog is run by a real human. Whether it's a correction, a hosting question, or a business inquiry — I read every message."
          : "这个博客由真人运营。无论是纠错、云服务器咨询还是商务合作——每条留言我都会看。"}
      </p>

      <div className="grid gap-[16px] sm:grid-cols-2 mb-[32px]">
        <div className="rounded-md border border-border/20 p-[20px]">
          <Mail className="h-[20px] w-[20px] mb-[12px] text-muted-foreground" />
          <h3 className="font-medium mb-[4px]">{isEn ? "Email" : "邮箱"}</h3>
          <p className="text-[14px] text-muted-foreground">
            {isEn ? "For the fastest response, use the guestbook." : "最快的方式是直接留言板留言。"}
          </p>
        </div>
        <div className="rounded-md border border-border/20 p-[20px]">
          <Send className="h-[20px] w-[20px] mb-[12px] text-muted-foreground" />
          <h3 className="font-medium mb-[4px]">{isEn ? "Guestbook" : "留言板"}</h3>
          <p className="text-[14px] text-muted-foreground">
            {isEn ? "Public messages welcome." : "欢迎公开留言交流。"}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border/20 bg-background/28 p-[20px]">
        <h3 className="font-medium mb-[12px]">{isEn ? "What I can help with" : "我可以帮你"}</h3>
        <ul className="text-[14px] text-muted-foreground space-y-[8px] leading-[1.7]">
          <li>✓ {isEn ? "Corrections to articles or reviews" : "文章或测评纠错"}</li>
          <li>✓ {isEn ? "Cloud hosting advice for your use case" : "按你的需求推荐云服务器"}</li>
          <li>✓ {isEn ? "Business / sponsorship inquiries" : "商务 / 赞助合作"}</li>
          <li>✓ {isEn ? "Link exchange requests" : "友链交换申请"}</li>
        </ul>
      </div>

      {sent && (
        <p className="mt-[16px] text-[14px] text-green-500">
          {isEn ? "Message sent! I'll get back to you soon." : "已发送！我会尽快回复。"}
        </p>
      )}
    </div>
  );
}
