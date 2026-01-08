'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const saleType = formData.get('sale_type') as string
    const filePath = formData.get('file_path') as string
    const previewUrl = formData.get('preview_url') as string
    const sellerId = formData.get('seller_id') as string

    if (!title || !price || !filePath || !sellerId) {
        return { error: 'Missing required fields' }
    }

    const { error } = await supabase.from('products').insert({
        title,
        description,
        price,
        category,
        sale_type: saleType || 'unlimited',
        file_path: filePath,
        preview_url: previewUrl,
        seller_id: sellerId,
    })

    if (error) {
        console.error('Error creating product:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard?mode=seller')
}

export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const saleType = formData.get('sale_type') as string

    const { error } = await supabase
        .from('products')
        .update({
            title,
            description,
            price: parseFloat(price),
            category,
            sale_type: saleType,
        })
        .eq('id', productId)
        .eq('seller_id', user.id)

    if (error) {
        console.error('Update product error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    revalidatePath(`/dashboard/products/${productId}/edit`)
    return { success: true }
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get product to find file paths
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('file_path, preview_url')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single()

    if (fetchError || !product) {
        return { error: 'Product not found or unauthorized' }
    }

    // Extract path from URL if needed
    const extractPath = (urlOrPath: string) => {
        if (urlOrPath.startsWith('http')) {
            const parts = urlOrPath.split('/assets/')
            if (parts.length > 1) return parts[1]
        }
        return urlOrPath
    }

    const filesToDelete = [
        extractPath(product.file_path),
        extractPath(product.preview_url)
    ].filter(Boolean)

    if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('assets')
            .remove(filesToDelete)

        if (storageError) {
            console.error('Storage delete error:', storageError)
        }
    }

    // Delete from database
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id)

    if (deleteError) {
        return { error: deleteError.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/products')
    return { success: true }
}
