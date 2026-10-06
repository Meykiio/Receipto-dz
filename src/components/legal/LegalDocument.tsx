import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalContact {
  heading: string;
  body: string;
  email: string;
}

export interface LegalDocumentProps {
  title: string;
  backToHome: string;
  lastUpdated: string;
  sections: LegalSection[];
  contact: LegalContact;
}

export const LegalDocument = ({
  title,
  backToHome,
  lastUpdated,
  sections,
  contact,
}: LegalDocumentProps) => (
  <div className="min-h-screen bg-background">
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backToHome}
          </Link>
        </Button>
        <LanguageSelector />
      </div>

      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground">{lastUpdated}</p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold mt-8 mb-4">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc ps-6 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 40)}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-4">{contact.heading}</h2>
          <p>
            {contact.body}
            <a href={`mailto:${contact.email}`} className="text-primary ml-1">
              {contact.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  </div>
);
