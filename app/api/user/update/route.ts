import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    // 🔐 usuário autenticado
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

    // 🔥 atualiza tabela admins
    const { error } = await supabase
      .from("admins")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      throw error;
    }

    // 🔥 monta payload do auth (sem sobrescrever com undefined)
    const authUpdatePayload: {
      email?: string;
      user_metadata?: {
        foto_url?: string;
        name?: string;
      };
    } = {};

    if (body.email) {
      authUpdatePayload.email = body.email;
    }

    if (body.nome || body.foto_url) {
      authUpdatePayload.user_metadata = {
        ...(body.nome && { name: body.nome }),
        ...(body.foto_url && { foto_url: body.foto_url }),
      };
    }

    // 🔥 atualiza auth (email + metadata)
    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authErrorUpdate } =
        await supabase.auth.admin.updateUserById(
          userId,
          authUpdatePayload
        );

      if (authErrorUpdate) {
        console.error("AUTH UPDATE ERROR:", authErrorUpdate);
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
