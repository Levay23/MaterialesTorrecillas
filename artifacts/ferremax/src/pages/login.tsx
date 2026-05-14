import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Wrench, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type LoginForm = { email: string; password: string };

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const [showPass, setShowPass] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: LoginForm) => {
    try {
      await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
      onLogin();
    } catch (err: any) {
      toast({ title: "Error de acceso", description: err.message || "Credenciales inválidas", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-8 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <Wrench size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">FerreMax</h1>
          <p className="text-orange-100 mt-1 text-sm">Sistema CRM</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="email"
                type="email"
                placeholder="usuario@ferremax.com"
                className="pl-9"
                {...register("email", { required: "Correo requerido" })}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="pl-9 pr-9"
                {...register("password", { required: "Contraseña requerida" })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11" disabled={isSubmitting}>
            {isSubmitting ? "Accediendo..." : "Iniciar sesión"}
          </Button>

          <p className="text-center text-xs text-gray-400 pt-2">
            Admin demo: <strong>admin@ferremax.com</strong> / <strong>admin123</strong>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
