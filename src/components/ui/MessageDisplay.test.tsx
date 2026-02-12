import { render, screen } from '@testing-library/react';
import MessageDisplay from './MessageDisplay';

describe('MessageDisplay', () => {
	it('メッセージが空の場合、何も表示しない', () => {
		const { container } = render(<MessageDisplay message="" />);
		expect(container.firstChild).toBeNull();
	});

	it('メッセージを表示する', () => {
		render(<MessageDisplay message="テストメッセージ" />);
		expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
	});

	it('successタイプの場合、successクラスを適用する', () => {
		render(<MessageDisplay message="成功" type="success" />);
		const element = screen.getByText('成功');
		expect(element.className).toContain('success');
	});

	it('errorタイプの場合、errorクラスを適用する', () => {
		render(<MessageDisplay message="エラー" type="error" />);
		const element = screen.getByText('エラー');
		expect(element.className).toContain('error');
	});

	it('デフォルトのtypeはsuccessである', () => {
		render(<MessageDisplay message="デフォルト" />);
		const element = screen.getByText('デフォルト');
		expect(element.className).toContain('success');
		expect(element.className).not.toContain('error');
	});
});
