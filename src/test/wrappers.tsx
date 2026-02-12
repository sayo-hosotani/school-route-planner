import type { ReactNode } from 'react';
import { AppProvider } from '../contexts/AppContext';
import { PointProvider } from '../contexts/PointContext';

export const AppWrapper = ({ children }: { children: ReactNode }) => (
	<AppProvider>{children}</AppProvider>
);

export const FullWrapper = ({ children }: { children: ReactNode }) => (
	<AppProvider>
		<PointProvider>{children}</PointProvider>
	</AppProvider>
);
