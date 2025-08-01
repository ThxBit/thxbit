import { Button } from "@/components/ui/button";
import { Bot, LogOut } from "lucide-react";

export default function Header({
  user,
  onLogout,
}: {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Trading Bot
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
