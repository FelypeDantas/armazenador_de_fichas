import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { nome, email, senha } = await req.json();

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // 🔥 cria usuário no AUTH (isso resolve seu login)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data.user });
}
