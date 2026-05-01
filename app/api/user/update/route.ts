import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    /* ─────────────────────────────
       AUTH
    ───────────────────────────── */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = user.id;

    /* ─────────────────────────────
       VALIDATION
    ───────────────────────────── */

    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    const senha = body.senha;

    if (!nome && !email && !senha) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      );
    }

    if (email && !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (senha && senha.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    /* ─────────────────────────────
       PREPARE DATA
    ───────────────────────────── */

    const updateData: Record<string, string> = {};

    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;

    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    /* ─────────────────────────────
       UPDATE DB (admins)
    ───────────────────────────── */

    const { error: dbError } = await supabase
      .from("admins")
      .update(updateData)
      .eq("user_id", userId);

    if (dbError) {
      console.error("DB UPDATE ERROR:", dbError);
      return NextResponse.json(
        { error: "Erro ao atualizar dados" },
        { status: 500 }
      );
    }

    /* ─────────────────────────────
       UPDATE AUTH (email)
    ───────────────────────────── */

    if (email) {
      const { error: authUpdateError } =
        await supabase.auth.admin.updateUserById(userId, {
          email,
        });

      if (authUpdateError) {
        console.error("AUTH UPDATE ERROR:", authUpdateError);
        // não quebra o fluxo, mas avisa
      }
    }

    /* ─────────────────────────────
       RESPONSE
    ───────────────────────────── */

    return NextResponse.json({
      success: true,
      message: "Dados atualizados com sucesso",
    });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
