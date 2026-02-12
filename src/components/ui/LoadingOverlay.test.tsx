import { render, screen } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
	it('isLoadingがfalseの場合、何も表示しない', () => {
		const { container } = render(<LoadingOverlay isLoading={false} />);
		expect(container.firstChild).toBeNull();
	});

	it('isLoadingがtrueの場合、オーバーレイを表示する', () => {
		const { container } = render(<LoadingOverlay isLoading={true} />);
		expect(container.firstChild).not.toBeNull();
	});

	it('messageが指定された場合、メッセージを表示する', () => {
		render(<LoadingOverlay isLoading={true} message="読み込み中..." />);
		expect(screen.getByText('読み込み中...')).toBeInTheDocument();
	});

	it('messageが未指定の場合、スピナーのみ表示する', () => {
		const { container } = render(<LoadingOverlay isLoading={true} />);
		expect(container.firstChild).not.toBeNull();
		expect(screen.queryByText(/.+/)).toBeNull();
	});
});
