"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Shield,
  Code,
  Database,
  Smartphone,
  Globe,
  Rocket
} from "lucide-react";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: Rocket,
    titleKey: "auth.title",
    descriptionKey: "auth.description",
    badgeKey: "auth.badge"
  },
  {
    icon: Shield,
    titleKey: "payments.title",
    descriptionKey: "payments.description",
    badgeKey: "payments.badge"
  },
  {
    icon: Code,
    titleKey: "typescript.title",
    descriptionKey: "typescript.description",
    badgeKey: "typescript.badge"
  },
  {
    icon: Database,
    titleKey: "database.title",
    descriptionKey: "database.description",
    badgeKey: "database.badge"
  },
  {
    icon: Smartphone,
    titleKey: "ui.title",
    descriptionKey: "ui.description",
    badgeKey: "ui.badge"
  },
  {
    icon: Globe,
    titleKey: "darkMode.title",
    descriptionKey: "darkMode.description",
    badgeKey: "darkMode.badge"
  }
];

export function FeaturesSection() {
  const t = useTranslations("Features");

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t(feature.badgeKey)}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(feature.descriptionKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20">
          <div className="mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-2 items-center">
                  <div>
                    <Badge className="mb-4">{t("aiPowered.badge")}</Badge>
                    <h3 className="text-2xl font-bold mb-4">
                      {t("aiPowered.title")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t("aiPowered.description")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{t("aiPowered.features.codeGeneration")}</Badge>
                      <Badge variant="outline">{t("aiPowered.features.smartRefactoring")}</Badge>
                      <Badge variant="outline">{t("aiPowered.features.automatedTesting")}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="h-64 w-64 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Zap className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}