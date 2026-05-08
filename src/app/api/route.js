import supabase from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('usuarios').select('*')
  return new Response(JSON.stringify(data))
} 