"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Star } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Star className="mr-1 h-3 w-3 fill-current" />
            {t("badge")}
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl lg:text-2xl max-w-2xl mx-auto">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-6 text-lg">
              {t("cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Play className="mr-2 h-5 w-5" />
              {t("learnMore")}
            </Button>
          </div>

          <div className="mt-16 flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Join thousands of developers building with ContentCursor
            </p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-24">
          <div className="relative mx-auto max-w-5xl">
            <div className="relative rounded-xl border bg-card p-2 shadow-2xl">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                  </div>
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}