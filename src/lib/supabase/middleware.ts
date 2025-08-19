import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
		cookies: {
			getAll() {
			return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
			cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
			supabaseResponse = NextResponse.next({
				request,
			})
			cookiesToSet.forEach(({ name, value, options }) =>
				supabaseResponse.cookies.set(name, value, options)
			)
			},
		},
		}
	)

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	// This will be the are for protected routes.
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Define route patterns
	const pathname = request.nextUrl.pathname
	const isPublicRoute = pathname === '/' || 
											pathname.startsWith('/auth') || 
											pathname.startsWith('/api') ||
											pathname.startsWith('/_next') ||
											pathname.includes('favicon.ico')
	const isDashboardRoute = pathname.startsWith('/dashboard')

	// Handle unauthenticated users
	if (!user && !isPublicRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'
		return NextResponse.redirect(url)
	}

	// Handle authenticated users
	if (user) {
		// Get user metadata to determine account type
		const accountType = user.user_metadata?.accountType
		const isOrganization = accountType === 'organization'

		// Redirect authenticated users away from auth pages
		if (pathname.startsWith('/auth')) {
			const url = request.nextUrl.clone()
			url.pathname = isOrganization ? '/dashboard' : '/'
			return NextResponse.redirect(url)
		}

		// Protect dashboard routes - only organizations can access
		if (isDashboardRoute && !isOrganization) {
			const url = request.nextUrl.clone()
			url.pathname = '/'
			return NextResponse.redirect(url)
		}

		// Redirect organizations from personal settings to dashboard settings
		if (pathname.startsWith('/settings') && isOrganization) {
			console.log('🚀 Redirecting organization from /settings to /dashboard/settings')
			const url = request.nextUrl.clone()
			url.pathname = '/dashboard/settings'
			return NextResponse.redirect(url)
		}
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse
}