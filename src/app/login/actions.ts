'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    console.log('Attempting signup for:', email)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error)
        return { error: error.message }
    }

    console.log('Signup success. User created:', data.user?.id)

    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            username: email, // Defaulting username to email for now
            role: 'user',
        })

        if (profileError) {
            console.error('Error creating profile manually:', profileError)
        } else {
            console.log('Profile created manually for user:', data.user.id)
        }
    }

    if (data.user && !data.session) {
        console.log('User created but no session. Email confirmation likely required.')
        return { success: true, message: 'Check your email for confirmation link.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
