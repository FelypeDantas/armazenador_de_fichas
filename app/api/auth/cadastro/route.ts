import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { nome, email, senha } = await req.json();

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome,
    },
  });

  if (error) {
    console.error("ERRO CREATE USER:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, user: data.user });
}
