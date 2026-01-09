'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToCart(productId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if product exists and is available
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, sale_type, sold_to, seller_id')
        .eq('id', productId)
        .single()

    if (productError || !product) {
        return { error: 'Product not found' }
    }

    // Prevent users from adding their own products to cart
    if (product.seller_id === user.id) {
        return { error: 'You cannot purchase your own product' }
    }

    // Check if one-time product is already sold
    if (product.sale_type === 'one_time' && product.sold_to) {
        return { error: 'This exclusive product has already been sold' }
    }

    // Try to add to cart
    const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
            user_id: user.id,
            product_id: productId
        })

    if (insertError) {
        // Check if it's a unique constraint violation (duplicate item)
        if (insertError.code === '23505') {
            return { error: 'Item ini sudah ada di keranjang' }
        }
        console.error('Add to cart error:', insertError)
        return { error: 'Failed to add item to cart' }
    }

    revalidatePath('/cart')
    return { success: true }
}

export async function removeFromCart(cartItemId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Remove from cart error:', error)
        return { error: 'Failed to remove item from cart' }
    }

    revalidatePath('/cart')
    return { success: true }
}

export async function getCartItems() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized', items: [] }
    }

    const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            created_at,
            product:products(
                id,
                title,
                price,
                preview_url,
                sale_type,
                sold_to,
                category,
                seller:profiles!products_seller_id_fkey(
                    full_name,
                    store_name
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get cart items error:', error)
        return { error: error.message, items: [] }
    }

    // Filter out products that have been sold (for one-time sales)
    const availableItems = cartItems?.filter(item => {
        const product = item.product as any
        if (!product) return false
        if (product.sale_type === 'one_time' && product.sold_to) {
            return false
        }
        return true
    }) || []

    return { success: true, items: availableItems }
}

export async function clearCart() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

    if (error) {
        console.error('Clear cart error:', error)
        return { error: 'Failed to clear cart' }
    }

    revalidatePath('/cart')
    return { success: true }
}

export async function getCartCount() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { count: 0 }
    }

    const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (error) {
        console.error('Get cart count error:', error)
        return { count: 0 }
    }

    return { count: count || 0 }
}
