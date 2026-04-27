import { NextResponse } from "next/server"; 
import { createSupabaseServerClient } from "@/lib/supabaseServer"; 

export async function POST() { 
  try { 
    const supabase = await createSupabaseServerClient(); 
    const { error } = await supabase.auth.signOut(); 
    
    if (error) { 
      console.error("Erro no logout:", error.message); 
      return NextResponse.json( 
        { success: false, error: "Erro ao deslogar" 
        }, { status: 500 } 
      ); 
    } 
    
    return NextResponse.json({ success: true });
    
  } catch (err) { 
    console.error("Erro inesperado:", err); 
    return NextResponse.json( { success: false, error: "Erro inesperado" }, { status: 500 } );
  } 
}
