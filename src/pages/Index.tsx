import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeView from "@/components/HomeView";
import AlertsView from "@/components/AlertsView";
import MapView from "@/components/MapView";
import PrepareView from "@/components/PrepareView";
import ReportView from "@/components/ReportView";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView onTabChange={setActiveTab} />;
      case "alerts":
        return <AlertsView />;
      case "map":
        return <MapView />;
      case "prepare":
        return <PrepareView onTabChange={setActiveTab} />;
      case "report":
        return <ReportView />;
      default:
        return <HomeView onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-md mx-auto">
        {renderView()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
