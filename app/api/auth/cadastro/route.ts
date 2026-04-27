import { NextResponse } from "next/server"; 
import { createSupabaseServerClient } from "@/lib/supabaseServer"; 
import bcrypt from "bcryptjs"; 

export async function POST(req: Request) { 
  const supabase = await createSupabaseServerClient(); // ✅ AGORA CERTO 
  const { nome, email, senha } = await req.json(); 
  if (!nome || !email || !senha) { 
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 }); 
  }
  const senhaHash = await bcrypt.hash(senha, 10); 
  const { error } = await supabase.from("admins").insert({ nome, email, senha: senhaHash, }); 
  if (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  } 
  return NextResponse.json({ success: true }); 
}
