'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { processPreviewImage } from '@/lib/image-utils'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const saleType = formData.get('sale_type') as string
    // File inputs might need different handling if they were uploaded directly to storage 
    // but here we are receiving form data. If the file was uploaded client-side, 
    // we can't process it here unless we change the upload flow.
    // Assuming current flow: Client uploads to storage -> sends path/url to server action.
    // To implement server-side watermarking, we need to:
    // 1. Receive the file buffer (if small enough) OR
    // 2. Download from storage -> Process -> Re-upload

    // Let's check how the current form works. 
    // The previous implementation suggested the client upload. 
    // If we want server-side watermarking, the client should submit the file to the server action,
    // OR the server action downloads the preview from the temporary path, processes it, and saves it to final path.

    const filePath = formData.get('file_path') as string
    const previewUrl = formData.get('preview_url') as string
    const sellerId = formData.get('seller_id') as string

    if (!title || !price || !filePath || !sellerId) {
        return { error: 'Missing required fields' }
    }

    // If previewUrl is provided (uploaded via client), we should process it if it's a new upload.
    // However, downloading -> processing -> re-uploading adds latency. 
    // For now, let's assume we proceed with the existing flow but plan to watermark in a trigger or separate process
    // OR we intercept here if possible. 

    // Since 'sharp' is installed and we want to enforce it, let's try to download and process if it is a storage path.
    // This is a bit complex for a single action if we don't have the file buffer directly.

    // WAITING FOR CONFIRMATION ON UPLOAD FLOW:
    // The previous context implies `ProductUploadForm` uploads directly to Supabase Storage.
    // To strictly enforce server-side watermarking, we should ideally handle the upload in the server action 
    // or use a Storage Trigger (Edge Function).
    // Given the constraints (Node environment, 'sharp' installed locally), 
    // the best approach without changing the client-side upload architecture heavily is:
    // 1. Client uploads to 'temp/' or standard path.
    // 2. This action downloads the preview image.
    // 3. Processes it with sharp.
    // 4. Re-uploads it (overwriting or new path).

    // Let's implement that logic.

    // Extract path from previewUrl if it's a full URL or just use it if it's a path
    let effectivePreviewPath = previewUrl
    if (previewUrl && !previewUrl.startsWith('http')) {
        // It is likely a relative path in the bucket
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('assets')
            .download(previewUrl)

        if (fileData && !downloadError) {
            const arrayBuffer = await fileData.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            try {
                const processedBuffer = await processPreviewImage(buffer)

                const { error: uploadError } = await supabase.storage
                    .from('assets')
                    .upload(previewUrl, processedBuffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    })

                if (uploadError) {
                    console.error('Failed to re-upload watermarked image', uploadError)
                }
            } catch (processingError) {
                console.error('Watermarking failed', processingError)
            }
        }
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
