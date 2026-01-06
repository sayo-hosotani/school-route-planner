import { useState, useCallback } from 'react';

interface UseCommentEditorOptions {
	initialComment?: string;
	onSave: (comment: string) => void;
}

interface UseCommentEditorReturn {
	isExpanded: boolean;
	isEditing: boolean;
	editingText: string;
	toggleExpanded: () => void;
	startEditing: (currentComment: string) => void;
	cancelEditing: () => void;
	saveComment: () => void;
	setEditingText: (text: string) => void;
}

export const useCommentEditor = ({
	onSave,
}: UseCommentEditorOptions): UseCommentEditorReturn => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingText, setEditingText] = useState('');

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	const startEditing = useCallback((currentComment: string) => {
		setIsEditing(true);
		setEditingText(currentComment);
	}, []);

	const cancelEditing = useCallback(() => {
		setIsEditing(false);
		setEditingText('');
	}, []);

	const saveComment = useCallback(() => {
		onSave(editingText);
		setIsEditing(false);
		setEditingText('');
	}, [editingText, onSave]);

	return {
		isExpanded,
		isEditing,
		editingText,
		toggleExpanded,
		startEditing,
		cancelEditing,
		saveComment,
		setEditingText,
	};
};
