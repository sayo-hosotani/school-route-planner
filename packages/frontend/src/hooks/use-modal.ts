import { useState, useCallback } from 'react';

interface UseModalReturn<T = null> {
	isOpen: boolean;
	data: T | null;
	open: (data?: T) => void;
	close: () => void;
}

export const useModal = <T = null>(initialData: T | null = null): UseModalReturn<T> => {
	const [isOpen, setIsOpen] = useState(false);
	const [data, setData] = useState<T | null>(initialData);

	const open = useCallback((newData?: T) => {
		if (newData !== undefined) {
			setData(newData);
		}
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		setData(null);
	}, []);

	return {
		isOpen,
		data,
		open,
		close,
	};
};
