export interface Point {
	id: string;
	lat: number;
	lng: number;
	type: 'start' | 'waypoint' | 'goal';
	order: number;
	comment: string;
	created_at: string;
	updated_at: string;
}
