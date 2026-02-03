import type {FieldValue} from "firebase/firestore";

export interface Expense {
  id?: string;
  amount: number;
  year: number;
  month: number;
  categoryId: string;
  targetUserId: string;
  targetUserName: string;
  creatorUid: string;
  creatorEmail: string | null;
  createdAt: FieldValue;
  createdBy: string;
  createdByName: string;
}
