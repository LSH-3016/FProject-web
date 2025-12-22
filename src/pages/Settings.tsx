import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "toggle" | "select" | "link";
  value?: boolean | string;
}

const settingsData: SettingItem[] = [
  {
    id: "notifications",
    label: "알림",
    description: "새로운 기록 알림 받기",
    icon: Bell,
    type: "toggle",
    value: true,
  },
  {
    id: "theme",
    label: "테마",
    description: "화면 밝기 설정",
    icon: Moon,
    type: "select",
    value: "어두운 도서관",
  },
  {
    id: "language",
    label: "언어",
    description: "표시 언어 선택",
    icon: Globe,
    type: "select",
    value: "한국어",
  },
  {
    id: "privacy",
    label: "개인정보 보호",
    description: "개인정보 설정 관리",
    icon: Shield,
    type: "link",
  },
];

const Settings = () => {
  const [settings, setSettings] = useState(settingsData);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "toggle"
          ? { ...item, value: !item.value }
          : item
      )
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <SettingsIcon className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-serif text-3xl text-primary mb-2 gold-accent">
              설정
            </h1>
            <p className="font-handwriting text-xl text-muted-foreground">
              나만의 공간을 꾸며보세요
            </p>
          </header>

          {/* Settings list */}
          <div className="paper-texture rounded-lg overflow-hidden shadow-book">
            {/* Book binding */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-leather to-transparent" />

            <div className="divide-y divide-ink/10">
              {settings.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="p-5 pl-6 flex items-center gap-4 animate-fade-in group hover:bg-secondary/20 transition-colors cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => item.type === "toggle" && toggleSetting(item.id)}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-ink/60 group-hover:text-gold transition-colors" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="font-serif text-ink">{item.label}</h3>
                      <p className="font-handwriting text-sm text-ink/50">
                        {item.description}
                      </p>
                    </div>

                    {/* Control */}
                    {item.type === "toggle" && (
                      <div
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          item.value ? "bg-gold" : "bg-secondary"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-aged-paper shadow-sm transition-transform",
                            item.value ? "left-6" : "left-1"
                          )}
                        />
                      </div>
                    )}

                    {item.type === "select" && (
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm text-ink/60">
                          {item.value as string}
                        </span>
                        <ChevronRight className="w-4 h-4 text-ink/30" />
                      </div>
                    )}

                    {item.type === "link" && (
                      <ChevronRight className="w-5 h-5 text-ink/30 group-hover:text-gold transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version info */}
          <div className="mt-8 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              버전 1.0.0
            </p>
            <p className="font-handwriting text-muted-foreground mt-1">
              과거의 나 © 2024
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
