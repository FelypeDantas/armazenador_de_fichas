import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const body = await req.json();

    // 🔐 pega usuário autenticado direto do Supabase
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

    const updateData: Record<string, string> = {};

    if (body.nome) updateData.nome = body.nome;
    if (body.email) updateData.email = body.email;

    if (body.senha) {
      const hash = await bcrypt.hash(body.senha, 10);
      updateData.senha = hash;
    }

    if (body.foto_url) {
      updateData.foto_url = body.foto_url;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      );
    }

    // 🔥 atualiza tabela admins usando user_id
    const { error } = await supabase
      .from("admins")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      throw error;
    }

    // 🔥 sincroniza email no auth (se mudou)
    if (body.email) {
      const { error: updateAuthError } =
        await supabase.auth.admin.updateUserById(userId, {
          email: body.email,
        });

      if (updateAuthError) {
        console.error("AUTH UPDATE ERROR:", updateAuthError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}