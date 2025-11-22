import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Film, Mail, Lock, User as UserIcon, Phone, Calendar, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { doc, runTransaction } from "firebase/firestore";

interface AuthProps {
  onClose?: () => void;
}

export function Auth({ onClose }: AuthProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupBirthday, setSignupBirthday] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveOffers, setReceiveOffers] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentando fazer login...");

    if (!loginEmail || !loginPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      console.log("Enviando para o Firebase:", { email: loginEmail });
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log("Firebase retornou sucesso:", userCredential.user);
      toast.success("Bem-vindo de volta!");
      // O onAuthStateChanged em App.tsx cuidará da atualização do estado do usuário.
    } catch (error: any) {
      console.error("--- ERRO DE LOGIN DO FIREBASE ---", error);
      toast.error(`Erro de login: ${error.code}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    if (!signupEmail.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (!acceptTerms) {
      toast.error("Por favor, aceite os termos e condições");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      // Atualiza o perfil do usuário no Firebase Auth com o nome
      await updateProfile(user, { displayName: signupName });

      // Usa uma transação para criar o documento do usuário no Firestore de forma segura
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, "users", user.uid);
        transaction.set(userDocRef, {
          name: signupName,
          email: signupEmail,
          loyaltyPoints: 100, // Bônus de boas-vindas!
          memberSince: new Date().toISOString(),
          phone: signupPhone || "",
          birthday: signupBirthday || ""
        });
      });

      console.log("Documento do usuário criado com sucesso no Firestore para o UID:", user.uid);

      toast.success(`Bem-vindo ao CineMax, ${signupName}! Você ganhou 100 pontos de bônus! 🎉`);
    } catch (error: any) {
      console.error("Erro de cadastro:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Este email já está em uso.");
      } else {
        toast.error(`Ocorreu um erro: ${error.code}`);
      }
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Login com Google seria implementado aqui");
  };

  const handleFacebookLogin = () => {
    toast.info("Login com Facebook seria implementado aqui");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Film className="w-12 h-12" />
              <span className="text-4xl">CineMax</span>
            </div>
            <h2 className="text-3xl mb-4">Bem-vindo à Melhor Experiência de Cinema</h2>
            <p className="text-white/90 text-lg mb-8">
              Junte-se a milhares de amantes do cinema. Reserve ingressos, ganhe recompensas e nunca perca uma estreia.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Reserva Fácil</h3>
                <p className="text-white/80 text-sm">Reserve seus assentos favoritos em segundos</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Programa de Fidelidade</h3>
                <p className="text-white/80 text-sm">Ganhe pontos a cada compra e receba vantagens exclusivas</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Acesso Antecipado</h3>
                <p className="text-white/80 text-sm">Receba notificações sobre novos lançamentos e eventos especiais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="p-8 lg:p-10">
          <div className="lg:hidden mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Film className="w-8 h-8 text-red-600" />
              <span className="text-2xl">CineMax</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="mb-2">Bem-vindo de Volta!</h2>
                  <p className="text-muted-foreground">Faça login para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Senha</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-primary"
                        onClick={() => toast.info("Recuperação de senha seria implementada aqui")}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Entrar
                  </Button>
                </form>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    OU CONTINUE COM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookLogin}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="mb-2">Criar Conta</h2>
                  <p className="text-muted-foreground">Junte-se ao CineMax e ganhe 100 pontos de bônus!</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Número de Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-birthday">Data de Nascimento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-birthday"
                          type="date"
                          value={signupBirthday}
                          onChange={(e) => setSignupBirthday(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Pelo menos 6 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-digite sua senha"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Eu aceito os{" "}
                        <button
                          type="button"
                          className="text-primary underline"
                          onClick={() => toast.info("Termos e Condições seriam abertos aqui")}
                        >
                          Termos e Condições
                        </button>{" "}
                        e{" "}
                        <button
                          type="button"
                          className="text-primary underline"
                          onClick={() => toast.info("Política de Privacidade seriam abertas aqui")}
                        >
                          Política de Privacidade
                        </button>
                      </label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="offers"
                        checked={receiveOffers}
                        onCheckedChange={(checked) => setReceiveOffers(checked as boolean)}
                      />
                      <label
                        htmlFor="offers"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                      >
                        Eu quero receber ofertas especiais e atualizações por email
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Criar Conta
                  </Button>
                </form>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    OU CADASTRE-SE COM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookLogin}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {onClose && (
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={onClose}>
                Continuar como Convidado
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}