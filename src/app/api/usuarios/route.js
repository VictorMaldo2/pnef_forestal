import { NextResponse } from 'next/server'
import { getUsuarios } from '@/lib/queries'

export async function GET() {
  try {
    const usuarios = await getUsuarios()
    return NextResponse.json(usuarios)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}