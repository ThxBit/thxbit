import { Button } from "@/components/ui/button";

interface FormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleEmailLogin: (e: React.FormEvent) => void;
}

export default function Form({
  email,
  setEmail,
  password,
  setPassword,
  handleEmailLogin,
}: FormProps) {
  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
        />
      </div>
      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  );
}
