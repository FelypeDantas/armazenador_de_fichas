import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
};

export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const userId = decoded.id; // auth.uid()

    // 🔥 deleta da tabela admins usando user_id
    const { error } = await supabase
      .from("admins")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("SUPABASE DELETE ERROR:", error);
      throw error;
    }

    // 🔥 remove também do Supabase Auth (ESSENCIAL)
    const { error: authError } =
      await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("AUTH DELETE ERROR:", authError);
      // não quebra a execução, mas loga
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}