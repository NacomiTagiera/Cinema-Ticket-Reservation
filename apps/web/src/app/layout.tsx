import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { cn } from '../lib/utils';
import './styles.css';

const figtree = Figtree({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700', '800', '900'],
	variable: '--font-figtree',
});

export const metadata: Metadata = {
	title: 'Movizo',
	description: 'The best movies in one place',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={cn(
					'bg-background text-foreground flex min-h-screen flex-col overflow-x-hidden antialiased',
					figtree.className,
				)}
			>
				<main className="flex-1">{children}</main>
			</body>
		</html>
	);
}
