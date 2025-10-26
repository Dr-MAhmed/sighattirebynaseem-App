import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/firebase/firestore';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check if user is authenticated using the admin cookie
    const cookieStore = cookies();
    const isAdminAuthenticated = cookieStore.has('adminAuthenticated') && 
                                cookieStore.get('adminAuthenticated')?.value === 'true';
    
    if (!isAdminAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch products
    const products = await getAllProducts(100);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in products API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 