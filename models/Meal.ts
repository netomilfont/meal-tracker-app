export interface Meal {
  _id: string;
  name: string;
  description: string;
  calories: number;
  datetime: Date | string;
  type: string;
  createdAt: Date;
}