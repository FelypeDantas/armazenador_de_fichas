import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // 🔍 buscar usuário na tabela admins
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // 🔐 comparar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // 🧠 aqui você decide como manter sessão
    // opção simples: retornar sucesso + dados básicos
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
      },
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro inesperado" },
      { status: 500 }
    );
  }
}
