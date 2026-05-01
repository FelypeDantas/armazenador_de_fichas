import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import jwt from "jsonwebtoken";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type JwtPayload = {
  id: string;
};

/* ─────────────────────────────
   HANDLER
──────────────────────────── */

export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    /* ─────────────────────────────
       AUTH HEADER
    ───────────────────────────── */

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token inválido ou ausente" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    /* ─────────────────────────────
       JWT VERIFY
    ───────────────────────────── */

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET não definido");
      return NextResponse.json(
        { error: "Erro interno de configuração" },
        { status: 500 }
      );
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Token inválido (sem ID)" },
        { status: 401 }
      );
    }

    /* ─────────────────────────────
       DELETE FROM DB
    ───────────────────────────── */

    const { error: dbError } = await supabase
      .from("admins")
      .delete()
      .eq("user_id", userId);

    if (dbError) {
      console.error("DB DELETE ERROR:", dbError);
      return NextResponse.json(
        { error: "Erro ao excluir dados" },
        { status: 500 }
      );
    }

    /* ─────────────────────────────
       DELETE FROM AUTH
    ───────────────────────────── */

    const { error: authError } =
      await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("AUTH DELETE ERROR:", authError);
      // não bloqueia a resposta
    }

    /* ─────────────────────────────
       RESPONSE
    ───────────────────────────── */

    return NextResponse.json({
      success: true,
      message: "Usuário removido com sucesso",
    });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
